import type { Metadata } from "next";
import { StudyPostForm } from "@/components/community/StudyPostForm";

export const metadata: Metadata = {
  title: "공부 인증하기"
};

export default function StudyBoardWritePage() {
  return <StudyPostForm mode="create" />;
}
