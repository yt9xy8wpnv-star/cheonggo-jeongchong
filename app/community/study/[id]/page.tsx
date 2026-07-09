import type { Metadata } from "next";
import { StudyPostDetail } from "@/components/community/StudyPostDetail";

type StudyBoardDetailPageProps = {
  params: Promise<{ id: string }>;
};

export const metadata: Metadata = {
  title: "공부 인증 상세"
};

export default async function StudyBoardDetailPage({
  params
}: StudyBoardDetailPageProps) {
  const { id } = await params;

  return <StudyPostDetail postId={id} />;
}
