import type { Metadata } from "next";
import { PostForm } from "@/components/community/PostForm";

export const metadata: Metadata = {
  title: "자유게시판 글쓰기"
};

export default function FreeBoardWritePage() {
  return <PostForm mode="create" />;
}
