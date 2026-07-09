import { Search, SlidersHorizontal, SquarePen } from "lucide-react";
import { PageHero } from "@/components/common/PageHero";
import { boardMeta, posts, type BoardKey } from "@/lib/data";

type BoardPageProps = {
  board: BoardKey;
};

export function BoardPage({ board }: BoardPageProps) {
  const meta = boardMeta[board];
  const boardPosts = posts.filter((post) => post.board === board);

  return (
    <main>
      <PageHero eyebrow="Community" title={meta.title} description={meta.description} />
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-3 rounded-lg border border-brand-line bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
          <label className="relative flex-1">
            <span className="sr-only">게시글 검색</span>
            <Search
              aria-hidden="true"
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            />
            <input
              type="search"
              placeholder="제목, 작성자, 내용 검색"
              className="focus-ring w-full rounded-md border border-brand-line py-2.5 pl-10 pr-3 text-sm"
            />
          </label>
          <div className="flex gap-2">
            <button className="focus-ring inline-flex items-center gap-2 rounded-md border border-brand-line px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50">
              <SlidersHorizontal aria-hidden="true" className="h-4 w-4" />
              최신순
            </button>
            <button className="focus-ring inline-flex items-center gap-2 rounded-md bg-brand-blue px-4 py-2.5 text-sm font-bold text-white hover:bg-brand-deep">
              <SquarePen aria-hidden="true" className="h-4 w-4" />
              글쓰기
            </button>
          </div>
        </div>
        <div className="overflow-hidden rounded-lg border border-brand-line bg-white">
          <div className="hidden grid-cols-[120px_1fr_120px_100px_100px] border-b border-brand-line bg-slate-50 px-5 py-3 text-sm font-bold text-slate-600 md:grid">
            <span>분류</span>
            <span>제목</span>
            <span>작성자</span>
            <span>조회</span>
            <span>댓글</span>
          </div>
          {boardPosts.map((post) => (
            <article
              key={post.id}
              className="grid gap-2 border-b border-brand-line px-5 py-4 last:border-b-0 md:grid-cols-[120px_1fr_120px_100px_100px] md:items-center"
            >
              <span className="text-sm font-bold text-brand-blue">{post.category}</span>
              <div>
                <h2 className="font-black text-brand-ink">{post.title}</h2>
                <p className="mt-1 text-xs text-brand-muted md:hidden">
                  {post.author} · {post.date} · 조회 {post.views} · 댓글 {post.comments}
                </p>
              </div>
              <span className="hidden text-sm text-brand-muted md:block">{post.author}</span>
              <span className="hidden text-sm text-brand-muted md:block">{post.views}</span>
              <span className="hidden text-sm text-brand-muted md:block">{post.comments}</span>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
