"use client";

import { Lock, PauseCircle, PlayCircle } from "lucide-react";
import { formatSeconds } from "@/lib/time";
import type { StudySubjectOption } from "@/lib/studyTimer";

const subjectColorClasses: Record<
  StudySubjectOption["key"],
  { icon: string; active: string }
> = {
  korean: {
    icon: "bg-orange-50 text-orange-600 ring-orange-100",
    active: "border-orange-200 bg-orange-50/60"
  },
  math: {
    icon: "bg-blue-50 text-blue-700 ring-blue-100",
    active: "border-blue-200 bg-blue-50/70"
  },
  english: {
    icon: "bg-amber-50 text-amber-700 ring-amber-100",
    active: "border-amber-200 bg-amber-50/70"
  },
  history: {
    icon: "bg-indigo-50 text-indigo-700 ring-indigo-100",
    active: "border-indigo-200 bg-indigo-50/70"
  },
  inquiry_1: {
    icon: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    active: "border-emerald-200 bg-emerald-50/70"
  },
  inquiry_2: {
    icon: "bg-purple-50 text-purple-700 ring-purple-100",
    active: "border-purple-200 bg-purple-50/70"
  },
  second_language: {
    icon: "bg-rose-50 text-rose-700 ring-rose-100",
    active: "border-rose-200 bg-rose-50/70"
  }
};

type SubjectTimerRowProps = {
  option: StudySubjectOption;
  seconds: number;
  isActive: boolean;
  busy: boolean;
  onStart: (option: StudySubjectOption) => void;
  onStop: () => void;
};

export function SubjectTimerRow({
  option,
  seconds,
  isActive,
  busy,
  onStart,
  onStop
}: SubjectTimerRowProps) {
  const colors = subjectColorClasses[option.key];
  const primaryLabel =
    option.key === "inquiry_1" ||
    option.key === "inquiry_2" ||
    option.key === "second_language"
      ? option.label
      : option.title;
  const secondaryLabel =
    option.enabled && option.label !== primaryLabel ? option.label : "";

  return (
    <div
      className={[
        "grid gap-4 rounded-xl border px-4 py-4 transition-colors sm:grid-cols-[44px_1fr_auto_auto] sm:items-center",
        isActive ? colors.active : "border-brand-line bg-white",
        !option.enabled ? "opacity-60" : ""
      ].join(" ")}
    >
      <div
        className={[
          "flex h-11 w-11 items-center justify-center rounded-full ring-1",
          option.enabled ? colors.icon : "bg-slate-100 text-slate-400 ring-slate-200"
        ].join(" ")}
      >
        {option.enabled ? (
          isActive ? (
            <PauseCircle aria-hidden="true" className="h-6 w-6" />
          ) : (
            <PlayCircle aria-hidden="true" className="h-6 w-6" />
          )
        ) : (
          <Lock aria-hidden="true" className="h-5 w-5" />
        )}
      </div>

      <div>
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-base font-black text-brand-ink">{primaryLabel}</p>
          {isActive ? (
            <span className="rounded-full bg-brand-blue px-2 py-0.5 text-xs font-black text-white">
              진행 중
            </span>
          ) : null}
        </div>
        {secondaryLabel ? (
          <p className="mt-1 text-sm font-semibold text-brand-muted">{secondaryLabel}</p>
        ) : null}
      </div>

      <p className="font-mono text-xl font-black text-brand-ink sm:text-right">
        {option.enabled ? formatSeconds(seconds) : "미응시"}
      </p>

      {option.enabled ? (
        <button
          type="button"
          onClick={() => (isActive ? onStop() : onStart(option))}
          disabled={busy}
          className={[
            "focus-ring inline-flex min-w-20 items-center justify-center rounded-md px-4 py-2.5 text-sm font-black transition-colors disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-white",
            isActive
              ? "bg-brand-red text-white hover:bg-red-800"
              : "bg-brand-blue text-white hover:bg-brand-deep"
          ].join(" ")}
        >
          {busy ? "처리 중" : isActive ? "정지" : "시작"}
        </button>
      ) : (
        <span className="inline-flex min-w-20 justify-center rounded-md border border-brand-line bg-slate-50 px-4 py-2.5 text-sm font-black text-slate-400">
          비활성
        </span>
      )}
    </div>
  );
}
