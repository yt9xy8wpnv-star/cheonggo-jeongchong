import type { QnaQuestionStatus } from "@/lib/supabase/types";

const qnaStatusMeta: Record<
  QnaQuestionStatus,
  { label: string; className: string }
> = {
  waiting: {
    label: "답변 대기",
    className: "border-amber-200 bg-amber-50 text-amber-800"
  },
  answered: {
    label: "답변 완료",
    className: "border-blue-200 bg-blue-50 text-brand-blue"
  },
  accepted: {
    label: "채택 완료",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700"
  }
};

export function QnaStatusBadge({
  status
}: {
  status: QnaQuestionStatus | null | undefined;
}) {
  if (!status) {
    return null;
  }

  const meta = qnaStatusMeta[status];

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-black ${meta.className}`}
    >
      {meta.label}
    </span>
  );
}

export function getQnaStatusLabel(status: QnaQuestionStatus | null | undefined) {
  return status ? qnaStatusMeta[status].label : "";
}
