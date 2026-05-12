from __future__ import annotations

from collections.abc import Callable
from dataclasses import dataclass
from queue import Empty, Queue
from threading import Event, Lock, Thread

from fastapi import FastAPI
from sqlalchemy import select
from sqlalchemy.orm import Session, sessionmaker

from app.core.database import get_session_factory
from app.modules.generation.models import GenerateTask
from app.modules.generation.service import GenerateTaskService
from app.storage.base import StorageProvider


@dataclass(frozen=True)
class QueuedGenerateTask:
    task_id: str
    task_type: str = "character_image_generation"
    storage: StorageProvider | None = None


class GenerateTaskQueue:
    def __init__(
        self,
        session_factory: Callable[[], Session] | sessionmaker[Session],
        *,
        auto_start: bool = True,
    ) -> None:
        self._session_factory = session_factory
        self._auto_start = auto_start
        self._queue: Queue[QueuedGenerateTask] = Queue()
        self._stop_event = Event()
        self._lock = Lock()
        self._worker: Thread | None = None
        self._recovered = False
        self._queued_task_ids: set[str] = set()

    @property
    def pending_count(self) -> int:
        return self._queue.qsize()

    def enqueue_character_image_task(self, task_id: str, storage: StorageProvider | None = None) -> None:
        with self._lock:
            if task_id in self._queued_task_ids:
                return
            self._queued_task_ids.add(task_id)
        self._queue.put(QueuedGenerateTask(task_id=task_id, storage=storage))
        if self._auto_start:
            self.start()

    def start(self) -> None:
        with self._lock:
            if self._worker is not None and self._worker.is_alive():
                return
            self._stop_event.clear()
            self._worker = Thread(target=self._run_forever, name="generate-task-worker", daemon=True)
            self._worker.start()

    def stop(self) -> None:
        self._stop_event.set()
        worker = self._worker
        if worker is not None and worker.is_alive():
            worker.join(timeout=5)

    def drain(self, max_tasks: int | None = None) -> list[str]:
        executed_task_ids: list[str] = []
        while max_tasks is None or len(executed_task_ids) < max_tasks:
            try:
                item = self._queue.get_nowait()
            except Empty:
                break
            self._queued_task_ids.discard(item.task_id)
            self._execute_item(item)
            self._queue.task_done()
            executed_task_ids.append(item.task_id)
        return executed_task_ids

    def recover_persisted_tasks(self) -> None:
        if self._recovered:
            return
        self._recovered = True
        with self._session_factory() as session:
            running_tasks = session.scalars(
                select(GenerateTask).where(
                    GenerateTask.task_type == "character_image_generation",
                    GenerateTask.status == "running",
                )
            ).all()
            for task in running_tasks:
                task.status = "failed"
                task.current_step = "generation_failed"
                task.progress = max(task.progress or 0, 1)
                task.error_code = "GENERATION_TASK_ORPHANED"
                task.error_message = "任务在服务重启或热重载后失去后台执行进程，已标记失败；可使用重试创建新任务。"
                task.output_asset_id = None
                task.output_asset_ids = []

            queued_task_ids = session.scalars(
                select(GenerateTask.id)
                .where(
                    GenerateTask.task_type == "character_image_generation",
                    GenerateTask.status.in_(["queued", "pending"]),
                )
                .order_by(GenerateTask.created_at.asc())
            ).all()
            session.commit()

        for task_id in queued_task_ids:
            self.enqueue_character_image_task(task_id)

        if queued_task_ids and self._auto_start:
            self.start()

    def _run_forever(self) -> None:
        while not self._stop_event.is_set():
            try:
                item = self._queue.get(timeout=0.2)
            except Empty:
                continue
            try:
                self._queued_task_ids.discard(item.task_id)
                self._execute_item(item)
            finally:
                self._queue.task_done()

    def _execute_item(self, item: QueuedGenerateTask) -> None:
        if item.task_type != "character_image_generation":
            self._mark_task_failed(item.task_id, "TASK_TYPE_UNSUPPORTED", f"Unsupported task_type: {item.task_type}")
            return
        run_character_image_task(item.task_id, self._session_factory, item.storage)

    def _mark_task_failed(self, task_id: str, error_code: str, error_message: str) -> None:
        with self._session_factory() as session:
            task = session.get(GenerateTask, task_id)
            if task is None:
                return
            task.status = "failed"
            task.current_step = "generation_failed"
            task.progress = max(task.progress or 0, 1)
            task.error_code = error_code
            task.error_message = error_message
            session.commit()


def get_generation_task_queue(app: FastAPI, *, recover: bool = True) -> GenerateTaskQueue:
    queue = getattr(app.state, "generation_task_queue", None)
    if queue is not None:
        return queue

    session_factory = getattr(app.state, "testing_session_factory", None) or get_session_factory()
    auto_start = not (
        getattr(app.state, "disable_generation_worker", False)
        or getattr(app.state, "disable_generation_background_tasks", False)
    )
    queue = GenerateTaskQueue(session_factory, auto_start=auto_start)
    if recover:
        queue.recover_persisted_tasks()
    app.state.generation_task_queue = queue
    return queue


def enqueue_character_image_task(
    *,
    app: FastAPI,
    task_id: str,
    storage: StorageProvider | None = None,
) -> None:
    get_generation_task_queue(app, recover=False).enqueue_character_image_task(task_id, storage=storage)


def drain_generation_task_queue(app: FastAPI, max_tasks: int | None = None) -> list[str]:
    return get_generation_task_queue(app).drain(max_tasks=max_tasks)


def stop_generation_task_queue(app: FastAPI) -> None:
    queue = getattr(app.state, "generation_task_queue", None)
    if queue is not None:
        queue.stop()


def run_character_image_task(
    task_id: str,
    session_factory: Callable[[], Session] | sessionmaker[Session],
    storage: StorageProvider | None = None,
) -> None:
    try:
        with session_factory() as session:
            service = GenerateTaskService(session, storage=storage)
            service.execute_character_image_task(task_id)
    except Exception as exc:
        with session_factory() as session:
            task = session.get(GenerateTask, task_id)
            if task is None:
                return
            task.status = "failed"
            task.current_step = "generation_failed"
            task.progress = max(task.progress or 0, 1)
            task.error_code = "GENERATION_WORKER_ERROR"
            task.error_message = str(exc)
            task.output_asset_id = None
            task.output_asset_ids = []
            session.commit()
