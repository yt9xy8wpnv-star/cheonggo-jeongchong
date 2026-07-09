type FormFieldProps = {
  label: string;
  name: string;
  value: string;
  type?: string;
  placeholder?: string;
  min?: number;
  max?: number;
  required?: boolean;
  autoComplete?: string;
  onChange: (name: string, value: string) => void;
};

export function FormField({
  label,
  name,
  value,
  type = "text",
  placeholder,
  min,
  max,
  required,
  autoComplete,
  onChange
}: FormFieldProps) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-bold text-brand-ink">{label}</span>
      <input
        name={name}
        type={type}
        value={value}
        placeholder={placeholder}
        min={min}
        max={max}
        required={required}
        autoComplete={autoComplete}
        onChange={(event) => onChange(name, event.target.value)}
        className="focus-ring rounded-md border border-brand-line bg-white px-3 py-3 text-sm text-brand-ink placeholder:text-slate-400"
      />
    </label>
  );
}
