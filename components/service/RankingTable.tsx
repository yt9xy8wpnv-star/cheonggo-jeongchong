"use client";

import { formatSeconds } from "@/lib/time";
import {
  getLiveSubjectTotals,
  getLiveTotalSeconds,
  studySubjectKeys,
  type StudyRankingUser
} from "@/lib/studyTimer";

const subjectLabels = {
  korean: "국어",
  math: "수학",
  english: "영어",
  history: "한국사",
  inquiry_1: "탐구1",
  inquiry_2: "탐구2",
  second_language: "제2외국어"
};

type RankingTableProps = {
  users: StudyRankingUser[];
  serverNow: string;
  now: Date;
  emptyMessage: string;
};

export function RankingTable({
  users,
  serverNow,
  now,
  emptyMessage
}: RankingTableProps) {
  if (users.length === 0) {
    return (
      <div className="rounded-xl border border-brand-line bg-slate-50 p-6 text-sm font-bold text-brand-muted">
        {emptyMessage}
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3 md:hidden">
        {users.map((user, index) => {
          const totals = getLiveSubjectTotals(
            user.subject_totals_seconds,
            user.active_session,
            serverNow,
            now
          );
          const totalSeconds = getLiveTotalSeconds(
            user.total_seconds,
            user.active_session,
            serverNow,
            now
          );

          return (
            <article
              key={user.user_id}
              className="rounded-xl border border-brand-line bg-white p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-black text-brand-blue">
                    {index + 1}위
                  </p>
                  <h3 className="mt-1 text-lg font-black text-brand-ink">
                    {user.name}
                  </h3>
                </div>
                <p className="font-mono text-lg font-black text-brand-ink">
                  {formatSeconds(totalSeconds)}
                </p>
              </div>
              {user.active_session ? (
                <p className="mt-2 text-xs font-black text-brand-red">
                  {user.active_session.subject_label} 진행 중
                </p>
              ) : null}
              <dl className="mt-4 grid grid-cols-2 gap-2 text-xs font-bold text-brand-muted">
                {studySubjectKeys.map((key) => (
                  <div key={key} className="flex justify-between gap-2">
                    <dt>{subjectLabels[key]}</dt>
                    <dd className="font-mono text-slate-700">
                      {formatSeconds(totals[key])}
                    </dd>
                  </div>
                ))}
              </dl>
            </article>
          );
        })}
      </div>

      <div className="hidden overflow-x-auto rounded-xl border border-brand-line bg-white md:block">
        <table className="min-w-[920px] w-full border-collapse text-left text-sm">
          <thead className="bg-slate-50 text-xs font-black uppercase tracking-normal text-slate-500">
            <tr>
              <th className="px-4 py-3">순위</th>
              <th className="px-4 py-3">이름</th>
              <th className="px-4 py-3">총 공부 시간</th>
              {studySubjectKeys.map((key) => (
                <th key={key} className="px-4 py-3">
                  {subjectLabels[key]}
                </th>
              ))}
              <th className="px-4 py-3">상태</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-line">
            {users.map((user, index) => {
              const totals = getLiveSubjectTotals(
                user.subject_totals_seconds,
                user.active_session,
                serverNow,
                now
              );
              const totalSeconds = getLiveTotalSeconds(
                user.total_seconds,
                user.active_session,
                serverNow,
                now
              );

              return (
                <tr key={user.user_id} className="text-brand-ink">
                  <td className="px-4 py-4 font-black text-brand-blue">
                    {index + 1}
                  </td>
                  <td className="px-4 py-4 font-black">{user.name}</td>
                  <td className="px-4 py-4 font-mono font-black">
                    {formatSeconds(totalSeconds)}
                  </td>
                  {studySubjectKeys.map((key) => (
                    <td key={key} className="px-4 py-4 font-mono text-slate-600">
                      {formatSeconds(totals[key])}
                    </td>
                  ))}
                  <td className="px-4 py-4 text-xs font-black">
                    {user.active_session ? (
                      <span className="rounded-full bg-red-50 px-2 py-1 text-brand-red">
                        {user.active_session.subject_label} 진행 중
                      </span>
                    ) : (
                      <span className="text-slate-400">정지</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
