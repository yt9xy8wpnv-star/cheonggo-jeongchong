"use client";

import { useEffect, useRef } from "react";
import { AlertTriangle } from "lucide-react";

type ResetTodayModalProps = {
  open: boolean;
  busy: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export function ResetTodayModal({
  open,
  busy,
  onClose,
  onConfirm
}: ResetTodayModalProps) {
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    cancelButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !busy) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [busy, onClose, open]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 py-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="reset-today-title"
    >
      <div className="w-full max-w-lg rounded-xl border border-brand-line bg-white p-6 shadow-xl">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-brand-red">
            <AlertTriangle aria-hidden="true" className="h-5 w-5" />
          </span>
          <div>
            <h2 id="reset-today-title" className="text-xl font-black text-brand-ink">
              오늘 공부 기록을 초기화할까요?
            </h2>
            <p className="mt-3 text-sm leading-7 text-brand-muted">
              오늘 오전 5시 기준으로 집계된 내 공부 기록이 모두 삭제됩니다.
              현재 실행 중인 타이머가 있다면 함께 초기화됩니다. 이 작업은 되돌릴 수 없습니다.
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            ref={cancelButtonRef}
            type="button"
            onClick={onClose}
            disabled={busy}
            className="focus-ring rounded-md border border-brand-line px-5 py-3 text-sm font-black text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            취소
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className="focus-ring rounded-md bg-brand-red px-5 py-3 text-sm font-black text-white hover:bg-red-800 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {busy ? "초기화 중" : "초기화하기"}
          </button>
        </div>
      </div>
    </div>
  );
}
