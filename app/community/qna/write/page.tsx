import type { Metadata } from "next";
import { QnaQuestionForm } from "@/components/community/QnaQuestionForm";

export const metadata: Metadata = {
  title: "질문 작성"
};

export default function QnaWritePage() {
  return <QnaQuestionForm mode="create" />;
}
