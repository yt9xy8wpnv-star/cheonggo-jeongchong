import { Search } from "lucide-react";
import { Badge } from "@/components/common/Badge";
import { NoticeCard } from "@/components/common/NoticeCard";
import { PageHero } from "@/components/common/PageHero";
import { notices } from "@/lib/data";

const tags = ["전체", "필독", "모의고사", "굿즈", "자료", "운영"];

export default function NoticePage() {
  return (
    <main>
      <PageHero
        eyebrow="Notice"
        title="공지사항"
        description="청고정총의 전체 공지를 확인합니다. 공지 글에는 필독, 모의고사, 굿즈, 자료, 운영 태그가 붙습니다."
      />
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-7 rounded-lg border border-brand-line bg-white p-4">
          <label className="relative block">
            <span className="sr-only">공지 검색</span>
            <Search
              aria-hidden="true"
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            />
            <input
              type="search"
              placeholder="공지 제목 또는 내용 검색"
              className="focus-ring w-full rounded-md border border-brand-line py-3 pl-10 pr-3 text-sm"
            />
          </label>
          <div className="mt-4 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <button
                key={tag}
                type="button"
                className="focus-ring rounded-md border border-brand-line px-3 py-2 text-sm font-bold text-slate-700 hover:border-brand-blue hover:text-brand-blue"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
        <div className="rounded-lg border border-brand-line bg-white px-5">
          <div className="border-b border-brand-line py-5">
            <Badge tone="필독">전체 공지</Badge>
            <p className="mt-3 text-sm text-brand-muted">
              현재 {notices.length}개의 공지가 등록되어 있습니다.
            </p>
          </div>
          {notices.map((notice) => (
            <NoticeCard key={notice.id} {...notice} />
          ))}
        </div>
      </section>
    </main>
  );
}
