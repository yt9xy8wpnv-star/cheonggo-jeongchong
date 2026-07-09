import type { Metadata } from "next";
import { PostDetail } from "@/components/community/PostDetail";

type FreeBoardDetailPageProps = {
  params: Promise<{ id: string }>;
};

export const metadata: Metadata = {
  title: "자유게시판 상세"
};

export default async function FreeBoardDetailPage({
  params
}: FreeBoardDetailPageProps) {
  const { id } = await params;

  return <PostDetail postId={id} />;
}
