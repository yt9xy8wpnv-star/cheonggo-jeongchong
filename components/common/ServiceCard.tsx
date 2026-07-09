import Link from "next/link";
import { ArrowRight } from "lucide-react";

type ServiceCardProps = {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
};

export function ServiceCard({ title, description, href, icon }: ServiceCardProps) {
  return (
    <Link
      href={href}
      className="focus-ring group rounded-lg border border-brand-line bg-white p-5 transition hover:border-brand-blue hover:shadow-soft"
    >
      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-md bg-blue-50 text-brand-blue">
        {icon}
      </div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-black text-brand-ink">{title}</h3>
          <p className="mt-2 text-sm leading-6 text-brand-muted">{description}</p>
        </div>
        <ArrowRight
          aria-hidden="true"
          className="mt-1 h-5 w-5 shrink-0 text-slate-300 transition group-hover:translate-x-1 group-hover:text-brand-blue"
        />
      </div>
    </Link>
  );
}
