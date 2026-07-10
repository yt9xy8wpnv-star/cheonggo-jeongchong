import type { Metadata } from "next";
import { StudyPostForm } from "@/components/community/StudyPostForm";

export const metadata: Metadata = {
  title: "공부 인증하기"
};

type StudyBoardWritePageProps = {
  searchParams?: Promise<{
    from?: string | string[];
  }>;
};

export default async function StudyBoardWritePage({
  searchParams
}: StudyBoardWritePageProps) {
  const params = await searchParams;
  const from = Array.isArray(params?.from) ? params.from[0] : params?.from;
  const redirectPath =
    from === "timer" ? "/community/study/write?from=timer" : "/community/study/write";

  return <StudyPostForm mode="create" redirectPath={redirectPath} />;
}
