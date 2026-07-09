"use client";

import { Pause, Play, RotateCcw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { csatDate } from "@/lib/data";
import { getDday } from "@/lib/utils";

function formatSeconds(total: number) {
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  return [hours, minutes, seconds]
    .map((value) => String(value).padStart(2, "0"))
    .join(":");
}

export function TimerWidget() {
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const dday = useMemo(() => getDday(csatDate), []);

  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => {
      setSeconds((current) => current + 1);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [running]);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
      <section className="rounded-lg border border-brand-line bg-white p-6 shadow-soft">
        <p className="text-sm font-bold text-brand-blue">2027학년도 수능</p>
        <p className="mt-3 text-5xl font-black text-brand-red">D-{dday}</p>
        <p className="mt-4 text-sm leading-6 text-brand-muted">
          기준일: 2026년 11월 19일. 남은 시간은 공부 계획과 자료 점검에
          활용하세요.
        </p>
      </section>
      <section className="rounded-lg border border-brand-line bg-white p-6 shadow-soft">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-bold text-brand-blue">오늘 순공 기록</p>
            <p className="mt-3 font-mono text-5xl font-black text-brand-ink">
              {formatSeconds(seconds)}
            </p>
          </div>
          <p className="rounded-md bg-slate-50 px-3 py-2 text-sm font-bold text-slate-600">
            오늘의 구호: 자주! 결의! 투쟁!
          </p>
        </div>
        <div className="mt-6 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setRunning(true)}
            className="focus-ring inline-flex items-center gap-2 rounded-md bg-brand-blue px-4 py-2.5 text-sm font-black text-white hover:bg-brand-deep"
          >
            <Play aria-hidden="true" className="h-4 w-4" />
            시작
          </button>
          <button
            type="button"
            onClick={() => setRunning(false)}
            className="focus-ring inline-flex items-center gap-2 rounded-md border border-brand-line px-4 py-2.5 text-sm font-black text-slate-700 hover:bg-slate-50"
          >
            <Pause aria-hidden="true" className="h-4 w-4" />
            정지
          </button>
          <button
            type="button"
            onClick={() => {
              setSeconds(0);
              setRunning(false);
            }}
            className="focus-ring inline-flex items-center gap-2 rounded-md border border-red-200 px-4 py-2.5 text-sm font-black text-brand-red hover:bg-red-50"
          >
            <RotateCcw aria-hidden="true" className="h-4 w-4" />
            초기화
          </button>
        </div>
      </section>
    </div>
  );
}
