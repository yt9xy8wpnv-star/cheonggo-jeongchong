import { AnswerSheet } from "@/components/mock/AnswerSheet";
import { PageHero } from "@/components/common/PageHero";

export default function MockSubmitPage() {
  return (
    <main className="bg-slate-50">
      <PageHero
        eyebrow="Answer Sheet"
        title="답안 입력"
        description="1번부터 20번까지 객관식 답안을 선택합니다. 실제 채점 로직은 추후 연결하며, 현재는 결과 페이지 이동 목업입니다."
      />
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <AnswerSheet />
      </section>
    </main>
  );
}
