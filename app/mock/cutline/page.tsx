import { PageHero } from "@/components/common/PageHero";
import { cutlines } from "@/lib/data";

export default function MockCutlinePage() {
  return (
    <main className="bg-slate-50">
      <PageHero
        eyebrow="Cutline"
        title="등급컷"
        description="회차별 원점수, 표준점수, 백분위 기준 등급컷 mock data입니다."
      />
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-6 grid gap-4 md:grid-cols-3">
          {[
            ["평균", "58.4점"],
            ["최고점", "100점"],
            ["표준편차", "21.7"]
          ].map(([label, value]) => (
            <article key={label} className="rounded-lg border border-brand-line bg-white p-5">
              <p className="text-sm font-bold text-brand-muted">{label}</p>
              <p className="mt-2 text-3xl font-black text-brand-ink">{value}</p>
            </article>
          ))}
        </div>
        <div className="overflow-hidden rounded-lg border border-brand-line bg-white shadow-soft">
          <div className="grid grid-cols-4 bg-slate-50 px-5 py-3 text-center text-sm font-black text-slate-700">
            <span>등급</span>
            <span>원점수</span>
            <span>표준점수</span>
            <span>백분위</span>
          </div>
          {cutlines.map((line) => (
            <div
              key={line.grade}
              className="grid grid-cols-4 border-t border-brand-line px-5 py-3 text-center text-sm"
            >
              <span className="font-black text-brand-blue">{line.grade}등급</span>
              <span>{line.raw}</span>
              <span>{line.standard}</span>
              <span>{line.percentile}</span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
