"use client";

import { useMemo } from "react";
import { formatDurationShort, formatSeconds } from "@/lib/time";
import {
  getLiveDeltaSeconds,
  type ActiveStudySession,
  type StudyAnalysisResponse,
  type StudyAnalysisSubject
} from "@/lib/studyTimer";

type StudyAnalysisProps = {
  data: StudyAnalysisResponse | null;
  activeSession: ActiveStudySession | null;
  now: Date;
  loading: boolean;
};

function isDateInRange(studyDate: string, start: string, end: string) {
  return studyDate >= start && studyDate <= end;
}

function withLiveAnalysis(
  data: StudyAnalysisResponse,
  activeSession: ActiveStudySession | null,
  now: Date
) {
  if (
    !activeSession ||
    !isDateInRange(activeSession.study_date, data.start_study_date, data.end_study_date)
  ) {
    return data;
  }

  const delta = getLiveDeltaSeconds(data.server_now, now);
  const totalSeconds = data.total_seconds + delta;
  const subjectTotals = data.subject_totals.map((subject) => {
    const nextSeconds =
      subject.subject_key === activeSession.subject_key
        ? subject.total_seconds + delta
        : subject.total_seconds;

    return {
      ...subject,
      total_seconds: nextSeconds,
      percentage: totalSeconds > 0 ? Math.round((nextSeconds / totalSeconds) * 100) : 0
    };
  });
  const enabledSubjects = subjectTotals.filter((subject) => subject.enabled);

  return {
    ...data,
    total_seconds: totalSeconds,
    average_seconds: Math.floor(totalSeconds / Math.max(data.daily_totals.length, 1)),
    most_studied_subject:
      enabledSubjects.length > 0
        ? [...enabledSubjects].sort((a, b) => b.total_seconds - a.total_seconds)[0]
        : null,
    least_studied_subject:
      enabledSubjects.length > 0
        ? [...enabledSubjects].sort((a, b) => a.total_seconds - b.total_seconds)[0]
        : null,
    subject_totals: subjectTotals,
    daily_totals: data.daily_totals.map((day) => ({
      ...day,
      total_seconds:
        day.study_date === activeSession.study_date
          ? day.total_seconds + delta
          : day.total_seconds
    }))
  };
}

function SubjectLine({ subject }: { subject: StudyAnalysisSubject }) {
  return (
    <div className={subject.enabled ? "" : "opacity-50"}>
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-sm font-black text-brand-ink">{subject.subject_label}</p>
          <p className="text-xs font-bold text-brand-muted">
            {subject.subject_choice_label}
          </p>
        </div>
        <div className="text-right">
          <p className="font-mono text-sm font-black text-brand-ink">
            {formatSeconds(subject.total_seconds)}
          </p>
          <p className="text-xs font-black text-brand-blue">{subject.percentage}%</p>
        </div>
      </div>
      <div className="mt-2 h-2 rounded-full bg-slate-100">
        <div
          className="h-2 rounded-full bg-brand-blue"
          style={{ width: `${Math.min(subject.percentage, 100)}%` }}
        />
      </div>
    </div>
  );
}

export function StudyAnalysis({
  data,
  activeSession,
  now,
  loading
}: StudyAnalysisProps) {
  const analysis = useMemo(
    () => (data ? withLiveAnalysis(data, activeSession, now) : null),
    [activeSession, data, now]
  );
  const maxDailySeconds = Math.max(
    ...(analysis?.daily_totals.map((day) => day.total_seconds) ?? [0]),
    1
  );

  return (
    <section className="rounded-xl border border-brand-line bg-white p-5 sm:p-6">
      <div>
        <p className="text-sm font-bold text-brand-blue">Analysis</p>
        <h2 className="mt-1 text-2xl font-black text-brand-ink">
          최근 7일 공부 분석
        </h2>
      </div>

      {loading && !analysis ? (
        <div className="mt-6 rounded-xl border border-brand-line bg-slate-50 p-6 text-sm font-bold text-brand-muted">
          분석을 불러오는 중입니다.
        </div>
      ) : analysis ? (
        <div className="mt-6 space-y-6">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-brand-line bg-slate-50 p-4">
              <p className="text-xs font-black text-brand-blue">총 공부 시간</p>
              <p className="mt-2 font-mono text-2xl font-black text-brand-ink">
                {formatSeconds(analysis.total_seconds)}
              </p>
            </div>
            <div className="rounded-xl border border-brand-line bg-slate-50 p-4">
              <p className="text-xs font-black text-brand-blue">하루 평균</p>
              <p className="mt-2 font-mono text-2xl font-black text-brand-ink">
                {formatSeconds(analysis.average_seconds)}
              </p>
            </div>
            <div className="rounded-xl border border-brand-line bg-slate-50 p-4">
              <p className="text-xs font-black text-brand-blue">가장 많이 공부한 과목</p>
              <p className="mt-2 text-lg font-black text-brand-ink">
                {analysis.most_studied_subject
                  ? `${analysis.most_studied_subject.subject_label} · ${formatDurationShort(
                      analysis.most_studied_subject.total_seconds
                    )}`
                  : "-"}
              </p>
            </div>
            <div className="rounded-xl border border-brand-line bg-slate-50 p-4">
              <p className="text-xs font-black text-brand-blue">가장 적게 공부한 과목</p>
              <p className="mt-2 text-lg font-black text-brand-ink">
                {analysis.least_studied_subject
                  ? `${analysis.least_studied_subject.subject_label} · ${formatDurationShort(
                      analysis.least_studied_subject.total_seconds
                    )}`
                  : "-"}
              </p>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
            <div className="rounded-xl border border-brand-line p-4">
              <h3 className="text-lg font-black text-brand-ink">과목별 비율</h3>
              <div className="mt-4 space-y-4">
                {analysis.subject_totals.map((subject) => (
                  <SubjectLine key={subject.subject_key} subject={subject} />
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-brand-line p-4">
              <h3 className="text-lg font-black text-brand-ink">일별 공부 시간</h3>
              <div className="mt-4 space-y-3">
                {analysis.daily_totals.map((day) => {
                  const percentage = Math.round(
                    (day.total_seconds / maxDailySeconds) * 100
                  );

                  return (
                    <div key={day.study_date}>
                      <div className="flex justify-between gap-3 text-sm">
                        <p className="font-black text-brand-ink">
                          {day.study_date.slice(5).replace("-", ".")}
                        </p>
                        <p className="font-mono font-black text-slate-700">
                          {formatSeconds(day.total_seconds)}
                        </p>
                      </div>
                      <div className="mt-2 h-2 rounded-full bg-slate-100">
                        <div
                          className="h-2 rounded-full bg-brand-blue"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-6 rounded-xl border border-brand-line bg-slate-50 p-6 text-sm font-bold text-brand-muted">
          분석 데이터가 없습니다.
        </div>
      )}
    </section>
  );
}
