import { ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

type PlaceholderVisualProps = {
  title: string;
  label?: string;
  className?: string;
};

export function PlaceholderVisual({
  title,
  label = "청고정총",
  className
}: PlaceholderVisualProps) {
  return (
    <div
      className={cn(
        "flex min-h-40 flex-col justify-between rounded-lg border border-dashed border-slate-300 bg-slate-50 p-5",
        className
      )}
    >
      <ShieldCheck aria-hidden="true" className="h-9 w-9 text-brand-blue" />
      <div>
        <p className="text-xs font-bold uppercase text-brand-blue">{label}</p>
        <p className="mt-1 text-lg font-black text-brand-ink">{title}</p>
      </div>
    </div>
  );
}
