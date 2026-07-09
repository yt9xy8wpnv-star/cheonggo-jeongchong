"use client";

import { getQnaSubjectDetails, qnaSubjectAreas } from "@/lib/qnaSubjects";

type QnaSubjectSelectProps = {
  subjectArea: string;
  subjectDetail: string;
  onSubjectAreaChange: (value: string) => void;
  onSubjectDetailChange: (value: string) => void;
};

export function QnaSubjectSelect({
  subjectArea,
  subjectDetail,
  onSubjectAreaChange,
  onSubjectDetailChange
}: QnaSubjectSelectProps) {
  const subjectDetails = getQnaSubjectDetails(subjectArea);

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div>
        <label htmlFor="qna-subject-area" className="text-sm font-black text-brand-ink">
          과목 영역
        </label>
        <select
          id="qna-subject-area"
          value={subjectArea}
          onChange={(event) => {
            const nextArea = event.target.value;
            const [firstDetail = ""] = getQnaSubjectDetails(nextArea);

            onSubjectAreaChange(nextArea);
            onSubjectDetailChange(firstDetail);
          }}
          className="focus-ring mt-2 w-full rounded-md border border-brand-line bg-white px-4 py-3 text-sm font-bold text-brand-ink"
        >
          <option value="">과목 영역 선택</option>
          {qnaSubjectAreas.map((area) => (
            <option key={area} value={area}>
              {area}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="qna-subject-detail" className="text-sm font-black text-brand-ink">
          세부 과목
        </label>
        <select
          id="qna-subject-detail"
          value={subjectDetail}
          onChange={(event) => onSubjectDetailChange(event.target.value)}
          disabled={!subjectArea}
          className="focus-ring mt-2 w-full rounded-md border border-brand-line bg-white px-4 py-3 text-sm font-bold text-brand-ink disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-brand-muted"
        >
          <option value="">세부 과목 선택</option>
          {subjectDetails.map((detail) => (
            <option key={detail} value={detail}>
              {detail}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
