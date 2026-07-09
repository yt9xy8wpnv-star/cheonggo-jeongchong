import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/common/Badge";
import { homeCalendarEvents, homeNotices } from "@/lib/data";

function formatDate(date: string) {
  return date.replaceAll("-", ".");
}

export function HomeNoticeCalendar() {
  return (
    <section className="bg-white">
      <div className="mx-auto grid max-w-7xl gap-14 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-20">
        <div>
          <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-5">
              <h2 className="text-4xl font-black text-brand-ink">공지사항</h2>
              <Badge tone="모의고사" className="rounded-full px-4 py-2 text-sm">
                전체
              </Badge>
            </div>
            <Link
              href="/notice"
              className="focus-ring text-base font-black text-brand-blue underline underline-offset-4 hover:text-brand-deep"
            >
              View More +
            </Link>
          </div>

          <div className="border-y border-brand-line">
            {homeNotices.map((notice) => (
              <Link
                key={notice.id}
                href={`/notice/${notice.id}`}
                className="focus-ring block border-b border-brand-line py-5 last:border-b-0 hover:bg-slate-50"
              >
                <h3 className="text-xl font-black leading-7 text-brand-ink">
                  {notice.title}
                </h3>
                <div className="mt-3 flex flex-wrap items-center gap-3 text-sm font-semibold text-brand-muted">
                  <span>{formatDate(notice.date)}</span>
                  <span className="h-3 w-px bg-brand-line" />
                  <span>{notice.tag}</span>
                  {notice.isNew ? (
                    <span className="font-black text-brand-blue">NEW</span>
                  ) : null}
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-7 flex items-center justify-between gap-4">
            <h2 className="text-4xl font-black text-brand-ink">정시 캘린더</h2>
            <Link
              href="/service/calendar"
              className="focus-ring text-base font-black text-brand-blue underline underline-offset-4 hover:text-brand-deep"
            >
              View More +
            </Link>
          </div>

          <div className="min-h-[360px] rounded-lg bg-[#EAF2FF] p-7 sm:p-9">
            <div className="flex flex-col gap-5 border-b border-blue-200 pb-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3 text-brand-blue">
                <ChevronLeft aria-hidden="true" className="h-7 w-7 stroke-[3]" />
                <span className="text-4xl font-black">2026.7</span>
                <ChevronRight aria-hidden="true" className="h-7 w-7 stroke-[3]" />
              </div>
              <div className="flex flex-wrap gap-3 text-sm font-black">
                <span className="rounded-full bg-blue-600 px-4 py-2 text-white">
                  정시일정
                </span>
                <span className="px-3 py-2 text-slate-700">모의고사</span>
                <span className="px-3 py-2 text-slate-700">기타일정</span>
              </div>
            </div>

            <div className="mt-7 space-y-4">
              {homeCalendarEvents.map((event) => (
                <div
                  key={`${event.date}-${event.label}`}
                  className="grid grid-cols-[76px_1fr] gap-6 text-base sm:text-lg"
                >
                  <span className="font-black text-slate-600">{event.date}</span>
                  <span className="font-semibold text-slate-700">{event.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
