import Link from "next/link";

type CommunityNoticeCardProps = {
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
};

export function CommunityNoticeCard({
  title,
  description,
  actionHref,
  actionLabel
}: CommunityNoticeCardProps) {
  return (
    <div className="rounded-xl border border-brand-line bg-white p-6">
      <h2 className="text-xl font-black text-brand-ink">{title}</h2>
      <p className="mt-3 text-sm leading-7 text-brand-muted">{description}</p>
      {actionHref && actionLabel ? (
        <Link
          href={actionHref}
          className="focus-ring mt-5 inline-flex rounded-md bg-brand-blue px-5 py-3 text-sm font-black text-white hover:bg-brand-deep"
        >
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}
