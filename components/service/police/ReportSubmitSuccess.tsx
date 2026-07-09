"use client";

import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

type ReportSubmitSuccessProps = {
  onReset: () => void;
};

export function ReportSubmitSuccess({ onReset }: ReportSubmitSuccessProps) {
  return (
    <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-8 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white text-emerald-700">
        <CheckCircle2 aria-hidden="true" className="h-7 w-7" />
      </div>
      <h2 className="mt-5 text-2xl font-black text-brand-ink">
        제보가 접수되었습니다.
      </h2>
      <p className="mt-3 text-sm leading-7 text-brand-muted">
        운영진 검토 후 필요한 조치가 진행됩니다.
      </p>
      <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
        <button
          type="button"
          onClick={onReset}
          className="focus-ring rounded-md bg-brand-blue px-5 py-3 text-sm font-black text-white hover:bg-brand-deep"
        >
          정시파출소 홈으로
        </button>
        <Link
          href="/"
          className="focus-ring rounded-md border border-brand-line bg-white px-5 py-3 text-sm font-black text-slate-700 hover:bg-slate-50"
        >
          메인으로 이동
        </Link>
      </div>
    </div>
  );
}
