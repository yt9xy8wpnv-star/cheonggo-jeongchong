import type { Metadata } from "next";
import { StudyPostForm } from "@/components/community/StudyPostForm";

type StudyBoardEditPageProps = {
  params: Promise<{ id: string }>;
};

export const metadata: Metadata = {
  title: "공부 인증 수정"
};

export default async function StudyBoardEditPage({
  params
}: StudyBoardEditPageProps) {
  const { id } = await params;

  return <StudyPostForm mode="edit" postId={id} />;
}
