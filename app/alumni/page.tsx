import { PageHero } from "@/components/common/PageHero";

export default function AlumniPage() {
  return (
    <main className="bg-slate-50">
      <PageHero
        eyebrow="Alumni"
        title="동문회"
        description="청고정총 동문과 졸업생 네트워크를 안내하는 페이지입니다."
      />
      <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-xl border border-brand-line bg-white p-6">
          <h2 className="text-2xl font-black text-brand-ink">청고정총 동문 안내</h2>
          <p className="mt-3 text-sm leading-7 text-brand-muted">
            동문 멘토링, 진학 경험 공유, 졸업생 소식은 추후 이곳에서 안내합니다.
          </p>
        </div>
      </section>
    </main>
  );
}
