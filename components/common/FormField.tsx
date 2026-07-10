"use client";

import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

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
  const [passwordVisible, setPasswordVisible] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword && passwordVisible ? "text" : type;

  return (
    <label className="grid gap-2">
      <span className="text-sm font-bold text-brand-ink">{label}</span>
      <span className="relative">
        <input
          name={name}
          type={inputType}
          value={value}
          placeholder={placeholder}
          min={min}
          max={max}
          required={required}
          autoComplete={autoComplete}
          onChange={(event) => onChange(name, event.target.value)}
          className={[
            "focus-ring w-full rounded-md border border-brand-line bg-white px-3 py-3 text-sm text-brand-ink placeholder:text-slate-400",
            isPassword ? "pr-12" : ""
          ].join(" ")}
        />
        {isPassword ? (
          <button
            type="button"
            onClick={() => setPasswordVisible((current) => !current)}
            className="focus-ring absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-md text-slate-500 hover:bg-slate-50 hover:text-brand-blue"
            aria-label={passwordVisible ? "비밀번호 숨기기" : "비밀번호 보기"}
          >
            {passwordVisible ? (
              <EyeOff aria-hidden="true" className="h-4 w-4" />
            ) : (
              <Eye aria-hidden="true" className="h-4 w-4" />
            )}
          </button>
        ) : null}
      </span>
    </label>
  );
}
