import { Badge } from "@/components/common/Badge";
import { PageHero } from "@/components/common/PageHero";
import { ProgressBar } from "@/components/common/ProgressBar";
import { questionAnalysis } from "@/lib/data";

export default function MockAnalysisPage() {
  return (
    <main>
      <PageHero
        eyebrow="Analysis"
        title="문항별 분석"
        description="문항별 정답률, 난이도, 단원, 오답률 높은 문항을 확인합니다."
      />
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-4 lg:grid-cols-2">
          {questionAnalysis.map((item) => (
            <article key={item.no} className="rounded-lg border border-brand-line bg-white p-6 shadow-soft">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-bold text-brand-blue">{item.no}번 문항</p>
                  <h2 className="mt-1 text-xl font-black text-brand-ink">{item.unit}</h2>
                </div>
                <Badge tone={item.difficulty.includes("매우") ? "필독" : "모의고사"}>
                  {item.difficulty}
                </Badge>
              </div>
              <ProgressBar label="정답률" value={item.correctRate} />
              <p className="mt-4 text-sm leading-6 text-brand-muted">
                오답률이 높은 문항은 풀이 과정에서 근거 표시와 시간 배분을 다시
                점검하는 것이 좋습니다.
              </p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
