import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/common/Badge";
import { notices } from "@/lib/data";

type NoticeDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export function generateStaticParams() {
  return notices.map((notice) => ({ id: notice.id }));
}

export async function generateMetadata({
  params
}: NoticeDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const notice = notices.find((item) => item.id === id);
  return {
    title: notice ? notice.title : "공지 상세"
  };
}

export default async function NoticeDetailPage({ params }: NoticeDetailPageProps) {
  const { id } = await params;
  const notice = notices.find((item) => item.id === id);

  if (!notice) {
    notFound();
  }

  return (
    <main className="bg-slate-50">
      <article className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <Link
          href="/notice"
          className="focus-ring mb-6 inline-flex items-center gap-2 rounded-md text-sm font-bold text-brand-blue hover:text-brand-deep"
        >
          <ArrowLeft aria-hidden="true" className="h-4 w-4" />
          목록으로 돌아가기
        </Link>
        <div className="rounded-lg border border-brand-line bg-white p-6 shadow-soft sm:p-8">
          <Badge tone={notice.tag}>{notice.tag}</Badge>
          <h1 className="mt-5 text-3xl font-black leading-tight text-brand-ink">
            {notice.title}
          </h1>
          <div className="mt-5 flex flex-wrap gap-3 border-b border-brand-line pb-6 text-sm text-brand-muted">
            <span>{notice.date}</span>
            <span>작성자: {notice.author}</span>
          </div>
          <div className="prose prose-slate mt-8 max-w-none">
            {notice.content.map((paragraph) => (
              <p key={paragraph} className="text-base leading-8 text-slate-700">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </article>
    </main>
  );
}
