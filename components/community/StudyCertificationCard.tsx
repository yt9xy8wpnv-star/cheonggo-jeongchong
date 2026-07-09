import { Trophy } from "lucide-react";
import { formatCommunityDate, formatCommunityDateTime } from "@/components/community/communityFormat";
import type { StudyCertificationView } from "@/lib/community";
import { formatSeconds } from "@/lib/time";

type StudyCertificationCardProps = {
  certification: StudyCertificationView | null;
  note?: string;
};

const subjectRows: Array<{
  label: string;
  subjectKey: keyof StudyCertificationView;
  secondsKey: keyof StudyCertificationView;
}> = [
  { label: "국어", subjectKey: "korean_subject", secondsKey: "korean_seconds" },
  { label: "수학", subjectKey: "math_subject", secondsKey: "math_seconds" },
  { label: "영어", subjectKey: "english_subject", secondsKey: "english_seconds" },
  { label: "한국사", subjectKey: "history_subject", secondsKey: "history_seconds" },
  { label: "탐구1", subjectKey: "inquiry_subject_1", secondsKey: "inquiry_1_seconds" },
  { label: "탐구2", subjectKey: "inquiry_subject_2", secondsKey: "inquiry_2_seconds" },
  {
    label: "제2외국어/한문",
    subjectKey: "second_language_subject",
    secondsKey: "second_language_seconds"
  }
];

export function StudyCertificationCard({
  certification,
  note
}: StudyCertificationCardProps) {
  if (!certification) {
    return (
      <div className="rounded-xl border border-brand-line bg-slate-50 p-5">
        <p className="text-sm font-black text-brand-muted">
          정시타이머 인증 기록을 불러오는 중입니다.
        </p>
      </div>
    );
  }

  const isRankOne = certification.is_rank_1;

  return (
    <section
      className={`rounded-xl border p-5 ${
        isRankOne
          ? "border-amber-300 bg-amber-50/70 ring-1 ring-amber-200"
          : "border-blue-100 bg-white"
      }`}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-bold text-brand-blue">Study Certification</p>
          <h2 className="mt-2 text-xl font-black text-brand-ink">정시타이머 인증 카드</h2>
        </div>
        {isRankOne ? (
          <span className="inline-flex w-fit items-center gap-1 rounded-full border border-amber-200 bg-amber-100 px-3 py-1 text-xs font-black text-amber-800">
            <Trophy aria-hidden="true" className="h-4 w-4" />
            인증 당시 1등
          </span>
        ) : null}
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-[1fr_1.4fr]">
        <div>
          <p className="text-sm font-bold text-brand-muted">오늘의 순공 시간</p>
          <p className="mt-2 font-mono text-4xl font-black text-brand-ink">
            {formatSeconds(certification.total_seconds)}
          </p>
          {certification.total_seconds === 0 ? (
            <p className="mt-3 text-sm font-bold text-brand-muted">
              아직 오늘 기록된 공부 시간이 없습니다.
            </p>
          ) : null}
          <dl className="mt-5 grid gap-3 text-sm">
            <div>
              <dt className="font-bold text-brand-muted">기준 날짜</dt>
              <dd className="mt-1 font-black text-brand-ink">
                {formatCommunityDate(certification.study_date)}
              </dd>
            </div>
            <div>
              <dt className="font-bold text-brand-muted">현재 순위</dt>
              <dd className="mt-1 font-black text-brand-ink">
                {certification.rank_position
                  ? `${certification.rank_position}위 / ${certification.rank_total_users ?? "-"}명`
                  : "-"}
              </dd>
            </div>
            <div>
              <dt className="font-bold text-brand-muted">인증 시각</dt>
              <dd className="mt-1 font-black text-brand-ink">
                {formatCommunityDateTime(certification.captured_at)}
              </dd>
            </div>
          </dl>
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          {subjectRows.map((row) => {
            const subject = String(certification[row.subjectKey] ?? "미응시");
            const seconds = Number(certification[row.secondsKey] ?? 0);
            const disabled = subject === "미응시";

            return (
              <div
                key={row.label}
                className={`rounded-lg border px-4 py-3 ${
                  disabled
                    ? "border-brand-line bg-slate-50 text-brand-muted"
                    : "border-blue-100 bg-white text-brand-ink"
                }`}
              >
                <p className="text-xs font-black text-brand-muted">
                  {row.label}
                  {subject && subject !== "응시" ? ` · ${subject}` : ""}
                </p>
                <p className="mt-1 font-mono text-sm font-black">
                  {formatSeconds(seconds)}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {note ? (
        <p className="mt-4 rounded-md bg-slate-50 px-4 py-3 text-sm font-bold text-brand-muted">
          {note}
        </p>
      ) : null}
    </section>
  );
}
