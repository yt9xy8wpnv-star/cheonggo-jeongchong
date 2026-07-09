import { PageHero } from "@/components/common/PageHero";

export default function FaqPage() {
  return (
    <main className="bg-slate-50">
      <PageHero
        eyebrow="FAQ"
        title="자주 묻는 질문"
        description="청고정총 서비스 이용과 운영 기준에 대한 주요 질문을 정리합니다."
      />
      <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-xl border border-brand-line bg-white p-6">
          <h2 className="text-2xl font-black text-brand-ink">FAQ 준비 중</h2>
          <p className="mt-3 text-sm leading-7 text-brand-muted">
            회원가입, 모의고사, 자료실, 정시파출소 관련 질문을 순차적으로 추가합니다.
          </p>
        </div>
      </section>
    </main>
  );
}
