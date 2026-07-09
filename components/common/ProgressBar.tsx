type ProgressBarProps = {
  value: number;
  label?: string;
};

export function ProgressBar({ value, label }: ProgressBarProps) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm">
        {label ? <span className="font-semibold text-brand-ink">{label}</span> : null}
        <span className="font-bold text-brand-blue">{value}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-brand-blue"
          style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
        />
      </div>
    </div>
  );
}
