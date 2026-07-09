import Link from "next/link";
import { AlertTriangle, BarChart3, CheckCircle2, Trophy } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { PageHero } from "@/components/common/PageHero";
import { ProgressBar } from "@/components/common/ProgressBar";
import { ResultTable } from "@/components/mock/ResultTable";
import { questionAnalysis } from "@/lib/data";

const scoreCards: Array<[LucideIcon, string, string, string]> = [
  [Trophy, "원점수", "84점", "상위권 진입 직전입니다."],
  [CheckCircle2, "예상 등급", "2등급", "1등급 컷까지 8점 남았습니다."],
  [AlertTriangle, "오답 문항", "3, 7번", "고난도 추론 문항을 다시 확인하세요."]
];

export default function MockResultPage() {
  return (
    <main>
      <PageHero
        eyebrow="Result"
        title="채점 결과"
        description="원점수, 예상 등급, 정오표, 틀린 문항, 문항별 정답률을 확인합니다."
      />
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-3">
          {scoreCards.map(([Icon, label, value, text]) => (
            <article key={String(label)} className="rounded-lg border border-brand-line bg-white p-6 shadow-soft">
              <Icon aria-hidden="true" className="mb-5 h-7 w-7 text-brand-blue" />
              <p className="text-sm font-bold text-brand-muted">{label}</p>
              <p className="mt-2 text-3xl font-black text-brand-ink">{value}</p>
              <p className="mt-3 text-sm leading-6 text-brand-muted">{text}</p>
            </article>
          ))}
        </div>
        <div className="mt-10 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <h2 className="mb-4 text-2xl font-black text-brand-ink">정오표</h2>
            <ResultTable />
          </div>
          <aside className="rounded-lg border border-brand-line bg-white p-6 shadow-soft">
            <div className="mb-5 flex items-center gap-2">
              <BarChart3 aria-hidden="true" className="h-5 w-5 text-brand-blue" />
              <h2 className="text-xl font-black text-brand-ink">문항별 정답률</h2>
            </div>
            <div className="space-y-5">
              {questionAnalysis.map((item) => (
                <ProgressBar
                  key={item.no}
                  label={`${item.no}번 · ${item.unit}`}
                  value={item.correctRate}
                />
              ))}
            </div>
            <Link
              href="/mock/analysis"
              className="focus-ring mt-6 inline-flex rounded-md border border-brand-blue px-4 py-2.5 text-sm font-black text-brand-blue hover:bg-blue-50"
            >
              문항별 분석 보기
            </Link>
          </aside>
        </div>
      </section>
    </main>
  );
}
