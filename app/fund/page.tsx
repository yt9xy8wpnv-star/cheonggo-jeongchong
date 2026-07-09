import { PageHero } from "@/components/common/PageHero";

export default function FundPage() {
  return (
    <main className="bg-slate-50">
      <PageHero
        eyebrow="Fund"
        title="발전기금"
        description="청고정총 운영과 콘텐츠 제작을 위한 발전기금 안내 페이지입니다."
      />
      <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-xl border border-brand-line bg-white p-6">
          <h2 className="text-2xl font-black text-brand-ink">발전기금 안내</h2>
          <p className="mt-3 text-sm leading-7 text-brand-muted">
            발전기금 접수 방식과 사용 내역 공개 기준은 운영진 확정 후 안내합니다.
          </p>
        </div>
      </section>
    </main>
  );
}
