import type { Metadata } from "next";
import { QnaQuestionForm } from "@/components/community/QnaQuestionForm";

type QnaEditPageProps = {
  params: Promise<{ id: string }>;
};

export const metadata: Metadata = {
  title: "질문 수정"
};

export default async function QnaEditPage({ params }: QnaEditPageProps) {
  const { id } = await params;

  return <QnaQuestionForm mode="edit" postId={id} />;
}
