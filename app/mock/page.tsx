import Link from "next/link";
import { BarChart3, CheckCircle2, ClipboardCheck, FileCheck2 } from "lucide-react";
import { Badge } from "@/components/common/Badge";
import { PageHero } from "@/components/common/PageHero";
import { SectionTitle } from "@/components/common/SectionTitle";
import { mockExams } from "@/lib/data";

export default function MockPage() {
  return (
    <main>
      <PageHero
        eyebrow="Mock Exam"
        title="모의고사 풀서비스"
        description="모의고사 일정, 답안 입력, 채점 결과, 등급컷, 문항별 분석을 한 흐름으로 확인합니다."
      >
        <div className="flex flex-wrap gap-3">
          <Link
            href="/mock/submit"
            className="focus-ring rounded-md bg-brand-blue px-5 py-3 text-sm font-black text-white hover:bg-brand-deep"
          >
            답안 입력
          </Link>
          <Link
            href="/mock/result"
            className="focus-ring rounded-md border border-brand-blue px-5 py-3 text-sm font-black text-brand-blue hover:bg-blue-50"
          >
            결과 확인
          </Link>
        </div>
      </PageHero>
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <SectionTitle title="모의고사 목록" />
        <div className="grid gap-4 lg:grid-cols-3">
          {mockExams.map((exam) => (
            <article key={exam.id} className="rounded-lg border border-brand-line bg-white p-6 shadow-soft">
              <div className="mb-5 flex items-center justify-between">
                <ClipboardCheck aria-hidden="true" className="h-7 w-7 text-brand-blue" />
                <Badge tone={exam.status === "응시 가능" ? "모의고사" : "운영"}>
                  {exam.status}
                </Badge>
              </div>
              <h2 className="text-xl font-black text-brand-ink">{exam.title}</h2>
              <dl className="mt-5 space-y-2 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-brand-muted">과목</dt>
                  <dd className="font-bold text-brand-ink">{exam.subject}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-brand-muted">일정</dt>
                  <dd className="font-bold text-brand-ink">{exam.date}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-brand-muted">채점</dt>
                  <dd className="font-bold text-brand-ink">{exam.scoring}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-brand-muted">참여</dt>
                  <dd className="font-bold text-brand-ink">{exam.participants}명</dd>
                </div>
              </dl>
              <div className="mt-6 grid gap-2">
                <Link
                  href="/mock/submit"
                  className="focus-ring inline-flex items-center justify-center gap-2 rounded-md bg-brand-blue px-4 py-2.5 text-sm font-black text-white hover:bg-brand-deep"
                >
                  <FileCheck2 aria-hidden="true" className="h-4 w-4" />
                  답안 입력
                </Link>
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/mock/result"
                    className="focus-ring inline-flex items-center justify-center gap-2 rounded-md border border-brand-line px-4 py-2.5 text-sm font-black text-slate-700 hover:bg-slate-50"
                  >
                    <CheckCircle2 aria-hidden="true" className="h-4 w-4" />
                    결과
                  </Link>
                  <Link
                    href="/mock/cutline"
                    className="focus-ring inline-flex items-center justify-center gap-2 rounded-md border border-brand-line px-4 py-2.5 text-sm font-black text-slate-700 hover:bg-slate-50"
                  >
                    <BarChart3 aria-hidden="true" className="h-4 w-4" />
                    등급컷
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
