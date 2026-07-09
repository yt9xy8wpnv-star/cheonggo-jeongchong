"use client";

import {
  AlertTriangle,
  FileWarning,
  MessageSquareWarning,
  ShieldAlert,
  VolumeX
} from "lucide-react";
import { policeReportTypes } from "@/lib/police";
import type { PoliceReportType } from "@/lib/supabase/types";

const reportIcons = {
  post_comment: MessageSquareWarning,
  early_admission_behavior: AlertTriangle,
  study_disruption: VolumeX,
  delivery_behavior: ShieldAlert,
  other: FileWarning
} satisfies Record<PoliceReportType, typeof ShieldAlert>;

type ReportTypeSelectorProps = {
  selectedType: PoliceReportType | null;
  onSelect: (type: PoliceReportType) => void;
};

export function ReportTypeSelector({
  selectedType,
  onSelect
}: ReportTypeSelectorProps) {
  return (
    <section aria-labelledby="report-type-title">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-bold text-brand-blue">Report Type</p>
          <h2 id="report-type-title" className="mt-1 text-2xl font-black text-brand-ink">
            신고 유형 선택
          </h2>
        </div>
        <p className="text-sm font-bold text-brand-muted">
          유형을 선택하면 신고 양식이 표시됩니다.
        </p>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {policeReportTypes.map((type) => {
          const Icon = reportIcons[type.value];
          const active = selectedType === type.value;

          return (
            <button
              key={type.value}
              type="button"
              onClick={() => onSelect(type.value)}
              className={`focus-ring rounded-xl border p-5 text-left transition ${
                active
                  ? "border-brand-blue bg-blue-50"
                  : "border-brand-line bg-white hover:border-blue-200 hover:bg-slate-50"
              }`}
            >
              <Icon
                aria-hidden="true"
                className={`h-7 w-7 ${active ? "text-brand-blue" : "text-slate-500"}`}
              />
              <h3 className="mt-4 text-base font-black text-brand-ink">
                {type.label}
              </h3>
              <p className="mt-2 text-sm leading-6 text-brand-muted">
                {type.description}
              </p>
            </button>
          );
        })}
      </div>
    </section>
  );
}
