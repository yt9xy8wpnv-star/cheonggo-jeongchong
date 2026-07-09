import Link from "next/link";

type SectionTitleProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: {
    label: string;
    href: string;
  };
};

export function SectionTitle({
  eyebrow,
  title,
  description,
  action
}: SectionTitleProps) {
  return (
    <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow ? (
          <p className="mb-2 text-sm font-bold text-brand-blue">{eyebrow}</p>
        ) : null}
        <h2 className="text-2xl font-black text-brand-ink sm:text-3xl">{title}</h2>
        {description ? (
          <p className="mt-3 max-w-2xl text-sm leading-6 text-brand-muted">
            {description}
          </p>
        ) : null}
      </div>
      {action ? (
        <Link
          href={action.href}
          className="focus-ring text-sm font-bold text-brand-blue underline underline-offset-4 hover:text-brand-deep"
        >
          {action.label} +
        </Link>
      ) : null}
    </div>
  );
}
