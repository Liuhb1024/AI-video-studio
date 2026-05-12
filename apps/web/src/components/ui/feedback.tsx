"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export type ToastTone = "success" | "error" | "info";

export type ToastMessage = {
  id: string;
  title: string;
  description?: string;
  tone: ToastTone;
};

type ToastViewportProps = {
  messages: ToastMessage[];
  onDismiss: (id: string) => void;
};

const toneClass: Record<ToastTone, string> = {
  success: "border-teal-300/30 bg-teal-400/[0.12] text-teal-50",
  error: "border-clay-300/35 bg-clay-500/[0.14] text-[#ffd7c3]",
  info: "border-stage-300/30 bg-stage-400/[0.12] text-[#fff5df]",
};

export function ToastViewport({ messages, onDismiss }: ToastViewportProps) {
  const mounted = useMounted();

  if (!mounted) {
    return null;
  }

  return createPortal(
    <div className="pointer-events-none fixed right-5 top-5 z-50 flex w-[min(92vw,420px)] flex-col gap-2">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`pointer-events-auto rounded-xl border px-3.5 py-3 shadow-panel backdrop-blur-2xl ${toneClass[message.tone]}`}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-sm font-medium">{message.title}</div>
              {message.description ? <p className="mt-1 text-xs leading-5 opacity-80">{message.description}</p> : null}
            </div>
            <button
              type="button"
              onClick={() => onDismiss(message.id)}
              className="rounded-full border border-white/10 px-2 py-0.5 text-xs opacity-75 transition hover:opacity-100"
            >
              关闭
            </button>
          </div>
        </div>
      ))}
    </div>,
    document.body,
  );
}

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "确认",
  cancelLabel = "取消",
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const mounted = useMounted();

  if (!open || !mounted) {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-40 flex items-start justify-center bg-black/55 px-4 pt-24 backdrop-blur-sm">
      <div className="surface w-[min(92vw,520px)] rounded-xl p-5 shadow-panel">
        <div className="text-[10px] uppercase tracking-[0.32em] text-clay-100/80">Confirm Action</div>
        <div className="mt-2 text-lg font-semibold text-[#fff5df]">{title}</div>
        <p className="mt-2 text-sm leading-6 text-[#cfc1a6]">{description}</p>
        <div className="mt-5 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-full border border-[#e7b45f]/15 bg-black/25 px-5 py-2 text-sm text-[#e9dcc4] transition hover:border-stage-300/35 disabled:cursor-not-allowed disabled:opacity-55"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="rounded-full border border-clay-300/35 bg-clay-500/[0.16] px-5 py-2 text-sm text-[#ffd7c3] transition hover:bg-clay-500/[0.24] disabled:cursor-not-allowed disabled:opacity-55"
          >
            {loading ? "处理中..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

type ProgressOverlayProps = {
  open: boolean;
  title: string;
  description: string;
  progress: number;
  steps: Array<{
    label: string;
    status: "done" | "active" | "pending";
  }>;
};

export function ProgressOverlay({ open, title, description, progress, steps }: ProgressOverlayProps) {
  const mounted = useMounted();

  if (!open || !mounted) {
    return null;
  }

  return createPortal(
    <div className="pointer-events-none fixed bottom-5 right-5 z-50 w-[min(92vw,460px)]">
      <div className="pointer-events-auto rounded-2xl border border-stage-300/25 bg-[#10130f]/95 p-4 shadow-panel backdrop-blur-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-sm font-semibold text-[#fff5df]">{title}</div>
            <p className="mt-1 text-xs leading-5 text-[#bfb196]">{description}</p>
          </div>
          <div className="rounded-full border border-stage-300/25 bg-stage-400/[0.1] px-2.5 py-1 text-xs text-stage-100">
            {Math.round(progress)}%
          </div>
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-black/45">
          <div
            className="h-full rounded-full bg-[linear-gradient(90deg,#4fbda8,#e7b45f,#b6532f)] transition-all duration-700"
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        </div>
        <div className="mt-4 grid gap-2">
          {steps.map((step, index) => (
            <div key={step.label} className="flex items-center gap-3 text-xs">
              <div
                className={`flex h-5 w-5 items-center justify-center rounded-full border text-[10px] ${
                  step.status === "done"
                    ? "border-teal-300/35 bg-teal-400/[0.16] text-teal-100"
                    : step.status === "active"
                      ? "border-stage-300/45 bg-stage-400/[0.18] text-stage-100 shadow-stage-glow"
                      : "border-[#e7b45f]/12 bg-black/30 text-[#7e735e]"
                }`}
              >
                {step.status === "done" ? "✓" : index + 1}
              </div>
              <span className={step.status === "pending" ? "text-[#7e735e]" : "text-[#e8dbc2]"}>{step.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>,
    document.body,
  );
}

function useMounted() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted;
}
