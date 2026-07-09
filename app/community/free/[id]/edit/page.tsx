import type { Metadata } from "next";
import { PostForm } from "@/components/community/PostForm";

type FreeBoardEditPageProps = {
  params: Promise<{ id: string }>;
};

export const metadata: Metadata = {
  title: "자유게시판 수정"
};

export default async function FreeBoardEditPage({
  params
}: FreeBoardEditPageProps) {
  const { id } = await params;

  return <PostForm mode="edit" postId={id} />;
}
