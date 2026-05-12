from collections.abc import Sequence
from typing import Any

from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.orm import Session


class CRUDRepository:
    model: type[Any]

    def __init__(self, session: Session) -> None:
        self.session = session

    def list(self) -> Sequence[Any]:
        statement = select(self.model)
        return self.session.scalars(statement).all()

    def get(self, object_id: str) -> Any | None:
        return self.session.get(self.model, object_id)

    def create(self, payload: dict[str, Any]) -> Any:
        instance = self.model(**payload)
        self.session.add(instance)
        self.session.commit()
        self.session.refresh(instance)
        return instance

    def update(self, object_id: str, payload: dict[str, Any]) -> Any | None:
        instance = self.get(object_id)
        if instance is None:
            return None
        for key, value in payload.items():
            setattr(instance, key, value)
        self.session.commit()
        self.session.refresh(instance)
        return instance

    def delete(self, object_id: str) -> bool:
        instance = self.get(object_id)
        if instance is None:
            return False
        self.session.delete(instance)
        self.session.commit()
        return True


class CRUDService:
    def __init__(self, repository: CRUDRepository, read_schema: type[BaseModel]) -> None:
        self.repository = repository
        self.read_schema = read_schema

    def list(self) -> list[BaseModel]:
        return [self.read_schema.model_validate(item) for item in self.repository.list()]

    def get(self, object_id: str) -> BaseModel | None:
        item = self.repository.get(object_id)
        if item is None:
            return None
        return self.read_schema.model_validate(item)

    def create(self, payload: BaseModel) -> BaseModel:
        created = self.repository.create(payload.model_dump(exclude_unset=True))
        return self.read_schema.model_validate(created)

    def update(self, object_id: str, payload: BaseModel) -> BaseModel | None:
        updated = self.repository.update(object_id, payload.model_dump(exclude_unset=True))
        if updated is None:
            return None
        return self.read_schema.model_validate(updated)

    def delete(self, object_id: str) -> bool:
        return self.repository.delete(object_id)
