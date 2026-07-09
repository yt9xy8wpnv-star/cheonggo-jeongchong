import { PageHero } from "@/components/common/PageHero";

export default function AdmissionResultsPage() {
  return (
    <main className="bg-slate-50">
      <PageHero
        eyebrow="Admission Results"
        title="입시 결과"
        description="청고정총 입시 결과와 합격 실적을 아카이브하는 페이지입니다."
      />
      <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-xl border border-brand-line bg-white p-6">
          <h2 className="text-2xl font-black text-brand-ink">입시 결과 아카이브</h2>
          <p className="mt-3 text-sm leading-7 text-brand-muted">
            연도별 입시 결과, 합격 사례, 정시 준비 기록을 이곳에 정리합니다.
          </p>
        </div>
      </section>
    </main>
  );
}
