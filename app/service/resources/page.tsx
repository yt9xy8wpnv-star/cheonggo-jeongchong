import { Download, Search } from "lucide-react";
import { Badge } from "@/components/common/Badge";
import { PageHero } from "@/components/common/PageHero";
import { resources } from "@/lib/data";
import { formatNumber } from "@/lib/utils";

const subjects = ["전체", "국어", "수학", "영어", "생명과학Ⅱ", "화학Ⅱ", "정시자료"];

export default function ResourcesPage() {
  return (
    <main className="bg-slate-50">
      <PageHero
        eyebrow="Resources"
        title="자료실"
        description="과목별 자료, 정시 일정, 오답 정리 양식 등을 분류해 확인합니다. 다운로드 버튼은 목업입니다."
      />
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-7 rounded-lg border border-brand-line bg-white p-4">
          <label className="relative block">
            <span className="sr-only">자료 검색</span>
            <Search
              aria-hidden="true"
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            />
            <input
              type="search"
              placeholder="파일명 또는 과목 검색"
              className="focus-ring w-full rounded-md border border-brand-line py-3 pl-10 pr-3 text-sm"
            />
          </label>
          <div className="mt-4 flex flex-wrap gap-2">
            {subjects.map((subject) => (
              <button
                key={subject}
                type="button"
                className="focus-ring rounded-md border border-brand-line px-3 py-2 text-sm font-bold text-slate-700 hover:border-brand-blue hover:text-brand-blue"
              >
                {subject}
              </button>
            ))}
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {resources.map((resource) => (
            <article key={resource.id} className="rounded-lg border border-brand-line bg-white p-5 shadow-soft">
              <Badge tone={resource.subject === "정시자료" ? "필독" : "자료"}>
                {resource.subject}
              </Badge>
              <h2 className="mt-4 text-lg font-black text-brand-ink">{resource.name}</h2>
              <p className="mt-3 text-sm text-brand-muted">
                업로드 {resource.date} · 다운로드 {formatNumber(resource.downloads)}
              </p>
              <button
                type="button"
                className="focus-ring mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md border border-brand-blue px-4 py-2.5 text-sm font-black text-brand-blue hover:bg-blue-50"
              >
                <Download aria-hidden="true" className="h-4 w-4" />
                다운로드
              </button>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
