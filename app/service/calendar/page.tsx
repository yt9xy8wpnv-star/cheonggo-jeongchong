import { CalendarDays } from "lucide-react";
import { Badge } from "@/components/common/Badge";
import { PageHero } from "@/components/common/PageHero";
import { CalendarView } from "@/components/service/CalendarView";
import { calendarEvents } from "@/lib/data";

export default function CalendarPage() {
  return (
    <main>
      <PageHero
        eyebrow="Calendar"
        title="정시 캘린더"
        description="모의고사, 수능, 원서접수, 학교 일정 mock data를 월간 캘린더로 확인합니다."
      />
      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_360px] lg:px-8">
        <CalendarView />
        <aside className="rounded-lg border border-brand-line bg-white p-6 shadow-soft">
          <div className="mb-5 flex items-center gap-2">
            <CalendarDays aria-hidden="true" className="h-5 w-5 text-brand-blue" />
            <h2 className="text-xl font-black text-brand-ink">날짜별 이벤트</h2>
          </div>
          <div className="space-y-4">
            {calendarEvents.map((event) => (
              <article key={event.label} className="border-b border-brand-line pb-4 last:border-b-0">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-black text-brand-blue">{event.date}</span>
                  <Badge tone={event.type === "자료" ? "자료" : "모의고사"}>
                    {event.type}
                  </Badge>
                </div>
                <p className="text-sm font-bold text-brand-ink">{event.label}</p>
              </article>
            ))}
          </div>
        </aside>
      </section>
    </main>
  );
}
