type TimelineItem = {
  date: string;
  text: string;
};

type TimelineSectionProps = {
  title: string;
  items: TimelineItem[];
};

export function TimelineSection({ title, items }: TimelineSectionProps) {
  return (
    <section className="rounded-xl border border-brand-line bg-white p-6">
      <h2 className="text-2xl font-black text-brand-ink">{title}</h2>
      <div className="mt-6 border-t border-brand-line">
        {items.map((item) => (
          <div
            key={`${item.date}-${item.text}`}
            className="grid gap-2 border-b border-brand-line py-4 sm:grid-cols-[160px_1fr] sm:gap-8"
          >
            <p className="text-sm font-black text-brand-blue">{item.date}</p>
            <p className="text-base font-semibold leading-7 text-brand-ink">
              {item.text}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
