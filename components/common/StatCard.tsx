import { cn } from "@/lib/utils";

type StatCardProps = {
  label: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  tone?: "blue" | "red" | "slate";
};

export function StatCard({
  label,
  value,
  description,
  icon,
  tone = "blue"
}: StatCardProps) {
  return (
    <article className="rounded-lg border border-brand-line bg-white p-5 shadow-soft">
      <div
        className={cn(
          "mb-5 flex h-11 w-11 items-center justify-center rounded-md border",
          tone === "red" &&
            "border-red-100 bg-red-50 text-brand-red",
          tone === "blue" &&
            "border-blue-100 bg-blue-50 text-brand-blue",
          tone === "slate" &&
            "border-slate-200 bg-slate-50 text-slate-700"
        )}
      >
        {icon}
      </div>
      <p className="text-sm font-semibold text-brand-muted">{label}</p>
      <p className="mt-2 text-2xl font-black text-brand-ink">{value}</p>
      <p className="mt-2 text-sm leading-6 text-brand-muted">{description}</p>
    </article>
  );
}
