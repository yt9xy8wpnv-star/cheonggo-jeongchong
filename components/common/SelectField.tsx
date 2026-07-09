type SelectFieldProps = {
  label: string;
  name: string;
  value: string;
  options: string[];
  disabled?: boolean;
  onChange: (name: string, value: string) => void;
};

export function SelectField({
  label,
  name,
  value,
  options,
  disabled,
  onChange
}: SelectFieldProps) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-bold text-brand-ink">{label}</span>
      <select
        name={name}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(name, event.target.value)}
        className="focus-ring rounded-md border border-brand-line bg-white px-3 py-3 text-sm text-brand-ink disabled:bg-slate-100 disabled:text-slate-500"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}
