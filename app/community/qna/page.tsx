import { Suspense } from "react";
import type { Metadata } from "next";
import { QnaBoardList } from "@/components/community/QnaBoardList";

export const metadata: Metadata = {
  title: "질문 게시판"
};

function QnaBoardListFallback() {
  return (
    <main className="bg-white">
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="border-y border-brand-line py-16 text-center text-sm font-bold text-brand-muted">
          질문을 불러오는 중입니다.
        </div>
      </section>
    </main>
  );
}

export default function QnaBoardPage() {
  return (
    <Suspense fallback={<QnaBoardListFallback />}>
      <QnaBoardList />
    </Suspense>
  );
}
