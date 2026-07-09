import Link from "next/link";
import { ArrowRight, BookOpen, MessageCircle, Search, Share2, Trophy } from "lucide-react";
import { PageHero } from "@/components/common/PageHero";
import { SectionTitle } from "@/components/common/SectionTitle";
import { boardMeta, posts } from "@/lib/data";

const boardIcons = {
  free: MessageCircle,
  study: Trophy,
  qna: Search,
  "resources-share": Share2,
  reviews: BookOpen
};

export default function CommunityPage() {
  return (
    <main>
      <PageHero
        eyebrow="Community"
        title="커뮤니티"
        description="정시 준비 과정에서 필요한 질문, 인증, 자료 공유, 모의고사 후기를 게시판별로 관리합니다."
      />
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <SectionTitle title="게시판" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Object.entries(boardMeta).map(([key, board]) => {
            const Icon = boardIcons[key as keyof typeof boardIcons];
            return (
              <Link
                key={board.href}
                href={board.href}
                className="focus-ring group rounded-lg border border-brand-line bg-white p-5 transition hover:border-brand-blue hover:shadow-soft"
              >
                <Icon aria-hidden="true" className="mb-5 h-7 w-7 text-brand-blue" />
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-black text-brand-ink">{board.title}</h2>
                    <p className="mt-2 text-sm leading-6 text-brand-muted">
                      {board.description}
                    </p>
                  </div>
                  <ArrowRight
                    aria-hidden="true"
                    className="h-5 w-5 shrink-0 text-slate-300 transition group-hover:translate-x-1 group-hover:text-brand-blue"
                  />
                </div>
              </Link>
            );
          })}
        </div>
      </section>
      <section className="bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <SectionTitle title="최근 게시글" />
          <div className="overflow-hidden rounded-lg border border-brand-line bg-white">
            {posts.slice(0, 6).map((post) => (
              <article
                key={post.id}
                className="grid gap-2 border-b border-brand-line px-5 py-4 last:border-b-0 md:grid-cols-[120px_1fr_120px_120px] md:items-center"
              >
                <span className="text-sm font-bold text-brand-blue">{post.category}</span>
                <h2 className="font-black text-brand-ink">{post.title}</h2>
                <span className="text-sm text-brand-muted">{post.author}</span>
                <span className="text-sm text-brand-muted">{post.date}</span>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
