import { SubjectsEditor } from "@/components/auth/SubjectsEditor";
import { PageHero } from "@/components/common/PageHero";

export default function SubjectsPage() {
  return (
    <main className="bg-slate-50">
      <PageHero
        eyebrow="Subjects"
        title="선택과목 수정"
        description="국어, 수학, 영어, 탐구, 제2외국어/한문 선택과목을 관리합니다."
      />
      <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <SubjectsEditor />
      </section>
    </main>
  );
}
