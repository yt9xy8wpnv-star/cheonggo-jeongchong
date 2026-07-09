"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import { formatSeconds } from "@/lib/time";
import {
  getLiveDeltaSeconds,
  type ActiveStudySession,
  type StudyCalendarDay,
  type StudyCalendarResponse,
  type StudySubjectOption
} from "@/lib/studyTimer";

const weekdayLabels = ["일", "월", "화", "수", "목", "금", "토"];

type StudyCalendarProps = {
  data: StudyCalendarResponse | null;
  month: string;
  subjectOptions: StudySubjectOption[];
  activeSession: ActiveStudySession | null;
  now: Date;
  loading: boolean;
  onMonthChange: (month: string) => void;
};

function shiftMonth(month: string, amount: number) {
  const [year, monthIndex] = month.split("-").map(Number);
  const nextDate = new Date(Date.UTC(year, monthIndex - 1 + amount, 1));

  return [
    String(nextDate.getUTCFullYear()).padStart(4, "0"),
    String(nextDate.getUTCMonth() + 1).padStart(2, "0")
  ].join("-");
}

function getDayNumber(studyDate: string) {
  return Number(studyDate.slice(-2));
}

function formatCalendarTime(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function getIntensityClass(totalSeconds: number) {
  if (totalSeconds >= 32400) {
    return "bg-brand-deep text-white border-brand-deep";
  }

  if (totalSeconds >= 21600) {
    return "bg-brand-blue text-white border-brand-blue";
  }

  if (totalSeconds >= 10800) {
    return "bg-blue-100 text-brand-deep border-blue-200";
  }

  if (totalSeconds >= 3600) {
    return "bg-blue-50 text-brand-deep border-blue-100";
  }

  if (totalSeconds > 0) {
    return "bg-slate-50 text-brand-ink border-slate-200";
  }

  return "bg-white text-slate-400 border-brand-line";
}

function addLiveDeltaToDay(
  day: StudyCalendarDay,
  activeSession: ActiveStudySession | null,
  serverNow: string,
  now: Date
): StudyCalendarDay {
  if (!activeSession || activeSession.study_date !== day.study_date) {
    return day;
  }

  const delta = getLiveDeltaSeconds(serverNow, now);
  const subjectTotals = { ...day.subject_totals_seconds };
  subjectTotals[activeSession.subject_key] += delta;

  return {
    ...day,
    total_seconds: day.total_seconds + delta,
    [`${activeSession.subject_key}_seconds`]: subjectTotals[activeSession.subject_key],
    subject_totals_seconds: subjectTotals
  };
}

export function StudyCalendar({
  data,
  month,
  subjectOptions,
  activeSession,
  now,
  loading,
  onMonthChange
}: StudyCalendarProps) {
  const [selectedDate, setSelectedDate] = useState("");

  const liveDays = useMemo(() => {
    if (!data) {
      return [];
    }

    return data.days.map((day) =>
      addLiveDeltaToDay(day, activeSession, data.server_now, now)
    );
  }, [activeSession, data, now]);

  const selectedDay =
    liveDays.find((day) => day.study_date === selectedDate) ??
    liveDays.find((day) => day.total_seconds > 0) ??
    liveDays[0] ??
    null;

  const leadingEmptyDays = data?.days[0]
    ? new Date(`${data.days[0].study_date}T00:00:00Z`).getUTCDay()
    : 0;

  return (
    <section className="rounded-xl border border-brand-line bg-white p-5 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-bold text-brand-blue">Study Calendar</p>
          <h2 className="mt-1 text-2xl font-black text-brand-ink">
            나의 공부 기록 달력
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onMonthChange(shiftMonth(month, -1))}
            className="focus-ring inline-flex h-10 w-10 items-center justify-center rounded-md border border-brand-line text-slate-700 hover:bg-slate-50"
          >
            <ChevronLeft aria-hidden="true" className="h-4 w-4" />
          </button>
          <p className="min-w-24 text-center text-lg font-black text-brand-ink">
            {month.replace("-", ".")}
          </p>
          <button
            type="button"
            onClick={() => onMonthChange(shiftMonth(month, 1))}
            className="focus-ring inline-flex h-10 w-10 items-center justify-center rounded-md border border-brand-line text-slate-700 hover:bg-slate-50"
          >
            <ChevronRight aria-hidden="true" className="h-4 w-4" />
          </button>
        </div>
      </div>

      {loading && !data ? (
        <div className="mt-6 rounded-xl border border-brand-line bg-slate-50 p-6 text-sm font-bold text-brand-muted">
          달력을 불러오는 중입니다.
        </div>
      ) : (
        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div>
            <div className="grid grid-cols-7 gap-2 text-center text-xs font-black text-slate-500">
              {weekdayLabels.map((label) => (
                <div key={label}>{label}</div>
              ))}
            </div>
            <div className="mt-2 grid grid-cols-7 gap-2">
              {Array.from({ length: leadingEmptyDays }).map((_, index) => (
                <div key={`empty-${index}`} className="aspect-square" />
              ))}
              {liveDays.map((day) => {
                const isSelected = selectedDay?.study_date === day.study_date;

                return (
                  <button
                    key={day.study_date}
                    type="button"
                    onClick={() => setSelectedDate(day.study_date)}
                    className={[
                      "focus-ring aspect-square rounded-lg border p-1.5 text-left transition sm:p-2",
                      getIntensityClass(day.total_seconds),
                      isSelected ? "ring-2 ring-brand-blue ring-offset-2" : ""
                    ].join(" ")}
                  >
                    <span className="block text-xs font-black sm:text-sm">
                      {getDayNumber(day.study_date)}
                    </span>
                    <span className="mt-1 block font-mono text-[10px] font-black sm:text-xs">
                      {formatCalendarTime(day.total_seconds)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <aside className="rounded-xl border border-brand-line bg-slate-50 p-4">
            {selectedDay ? (
              <>
                <p className="text-sm font-bold text-brand-blue">
                  {selectedDay.study_date.replaceAll("-", ".")}
                </p>
                <p className="mt-2 font-mono text-3xl font-black text-brand-ink">
                  {formatSeconds(selectedDay.total_seconds)}
                </p>
                <div className="mt-4 space-y-2">
                  {subjectOptions.map((option) => (
                    <div
                      key={option.key}
                      className={[
                        "flex items-center justify-between gap-3 rounded-md bg-white px-3 py-2 text-sm",
                        option.enabled ? "" : "opacity-50"
                      ].join(" ")}
                    >
                      <div>
                        <p className="font-black text-brand-ink">{option.title}</p>
                        <p className="text-xs font-bold text-brand-muted">{option.label}</p>
                      </div>
                      <p className="font-mono font-black text-slate-700">
                        {formatSeconds(selectedDay.subject_totals_seconds[option.key])}
                      </p>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-sm font-bold text-brand-muted">기록이 없습니다.</p>
            )}
          </aside>
        </div>
      )}
    </section>
  );
}
