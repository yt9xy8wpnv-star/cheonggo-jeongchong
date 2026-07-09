import type { Metadata } from "next";
import { QnaQuestionDetail } from "@/components/community/QnaQuestionDetail";

type QnaDetailPageProps = {
  params: Promise<{ id: string }>;
};

export const metadata: Metadata = {
  title: "질문 상세"
};

export default async function QnaDetailPage({ params }: QnaDetailPageProps) {
  const { id } = await params;

  return <QnaQuestionDetail postId={id} />;
}
