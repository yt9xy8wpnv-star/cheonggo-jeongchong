import Link from "next/link";
import { Badge } from "@/components/common/Badge";
import type { NoticeTag } from "@/lib/data";

type NoticeCardProps = {
  id: string;
  tag: NoticeTag;
  date: string;
  title: string;
  summary: string;
};

export function NoticeCard({ id, tag, date, title, summary }: NoticeCardProps) {
  return (
    <Link
      href={`/notice/${id}`}
      className="focus-ring block border-b border-brand-line py-5 transition last:border-b-0 hover:bg-slate-50"
    >
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone={tag}>{tag}</Badge>
        <span className="text-sm font-semibold text-brand-muted">{date}</span>
      </div>
      <h3 className="mt-3 text-lg font-black text-brand-ink">{title}</h3>
      <p className="mt-2 line-clamp-2 text-sm leading-6 text-brand-muted">
        {summary}
      </p>
    </Link>
  );
}
