import { Badge } from "@/components/common/Badge";
import { calendarEvents } from "@/lib/data";

const days = Array.from({ length: 31 }, (_, index) => index + 1);
const leadingBlanks = Array.from({ length: 3 }, (_, index) => index);

export function CalendarView() {
  return (
    <div className="rounded-lg border border-brand-line bg-white p-5 shadow-soft">
      <div className="mb-5 flex flex-col gap-3 border-b border-brand-line pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-bold text-brand-blue">정시 캘린더</p>
          <h2 className="mt-1 text-3xl font-black text-brand-ink">2026.7</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge tone="모의고사">모의고사</Badge>
          <Badge tone="자료">자료</Badge>
          <Badge tone="운영">원서</Badge>
        </div>
      </div>
      <div className="grid grid-cols-7 border-y border-brand-line bg-slate-50 text-center text-xs font-black text-slate-600">
        {["일", "월", "화", "수", "목", "금", "토"].map((day) => (
          <div key={day} className="py-3">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {leadingBlanks.map((blank) => (
          <div
            key={`blank-${blank}`}
            className="min-h-24 border-b border-r border-brand-line bg-slate-50"
          />
        ))}
        {days.map((day) => {
          const date = `2026-07-${String(day).padStart(2, "0")}`;
          const events = calendarEvents.filter((event) => event.date === date);
          return (
            <div
              key={day}
              className="min-h-24 border-b border-r border-brand-line p-2 last:border-r-0"
            >
              <p className="text-sm font-black text-brand-ink">{day}</p>
              <div className="mt-2 space-y-1">
                {events.map((event) => (
                  <p
                    key={event.label}
                    className="truncate rounded-sm bg-blue-50 px-1.5 py-1 text-xs font-bold text-brand-blue"
                    title={event.label}
                  >
                    {event.label}
                  </p>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
