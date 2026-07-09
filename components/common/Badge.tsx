import { cn } from "@/lib/utils";

const toneMap = {
  필독: "border-brand-red/20 bg-red-50 text-brand-red",
  모의고사: "border-brand-blue/20 bg-blue-50 text-brand-blue",
  굿즈: "border-amber-200 bg-amber-50 text-amber-700",
  자료: "border-emerald-200 bg-emerald-50 text-emerald-700",
  운영: "border-slate-200 bg-slate-50 text-slate-700",
  서비스: "border-blue-200 bg-blue-50 text-brand-blue",
  접수: "border-slate-200 bg-slate-50 text-slate-700",
  "검토 중": "border-blue-200 bg-blue-50 text-brand-blue",
  훈방: "border-emerald-200 bg-emerald-50 text-emerald-700",
  주의: "border-amber-200 bg-amber-50 text-amber-700",
  "정시교육 필요": "border-red-200 bg-red-50 text-brand-red",
  "명예 정시파이터 복귀": "border-emerald-200 bg-emerald-50 text-emerald-700"
};

type BadgeProps = {
  children: React.ReactNode;
  tone?: keyof typeof toneMap | "default";
  className?: string;
};

export function Badge({ children, tone = "default", className }: BadgeProps) {
  const toneClass =
    tone !== "default" && tone in toneMap
      ? toneMap[tone as keyof typeof toneMap]
      : "border-slate-200 bg-white text-slate-700";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-semibold",
        toneClass,
        className
      )}
    >
      {children}
    </span>
  );
}
