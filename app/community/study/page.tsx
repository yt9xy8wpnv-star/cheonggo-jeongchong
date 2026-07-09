import { Suspense } from "react";
import type { Metadata } from "next";
import { StudyBoardList } from "@/components/community/StudyBoardList";

export const metadata: Metadata = {
  title: "공부 인증"
};

function StudyBoardListFallback() {
  return (
    <main className="bg-white">
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="border-y border-brand-line py-16 text-center text-sm font-bold text-brand-muted">
          공부 인증 글을 불러오는 중입니다.
        </div>
      </section>
    </main>
  );
}

export default function StudyBoardPage() {
  return (
    <Suspense fallback={<StudyBoardListFallback />}>
      <StudyBoardList />
    </Suspense>
  );
}
