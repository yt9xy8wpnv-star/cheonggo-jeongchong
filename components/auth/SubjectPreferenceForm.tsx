"use client";

import type { Dispatch, SetStateAction } from "react";
import type { SubjectPreferenceInput } from "@/lib/supabase/types";
import {
  englishSubjects,
  historySubjects,
  inquirySubjects,
  koreanSubjects,
  mathSubjects,
  secondLanguageSubjects
} from "@/lib/subjects";
import { validateSubjectPreferences } from "@/lib/subjectValidation";
import { SelectField } from "@/components/common/SelectField";

type SubjectPreferenceFormProps = {
  value: SubjectPreferenceInput;
  onChange: Dispatch<SetStateAction<SubjectPreferenceInput>>;
  disabled?: boolean;
};

export function SubjectPreferenceForm({
  value,
  onChange,
  disabled
}: SubjectPreferenceFormProps) {
  const validation = validateSubjectPreferences(value);

  const handleChange = (name: string, nextValue: string) => {
    onChange((current) => ({
      ...current,
      [name]: nextValue,
      history_subject: "응시"
    }));
  };

  return (
    <div className="space-y-5">
      <div className="grid gap-5 md:grid-cols-2">
        <SelectField
          label="국어 영역"
          name="korean_subject"
          value={value.korean_subject}
          options={koreanSubjects}
          disabled={disabled}
          onChange={handleChange}
        />
        <SelectField
          label="수학 영역"
          name="math_subject"
          value={value.math_subject}
          options={mathSubjects}
          disabled={disabled}
          onChange={handleChange}
        />
        <SelectField
          label="영어 영역"
          name="english_subject"
          value={value.english_subject}
          options={englishSubjects}
          disabled={disabled}
          onChange={handleChange}
        />
        <SelectField
          label="한국사 영역"
          name="history_subject"
          value="응시"
          options={historySubjects}
          disabled
          onChange={handleChange}
        />
        <SelectField
          label="탐구 영역 제1선택"
          name="inquiry_subject_1"
          value={value.inquiry_subject_1}
          options={inquirySubjects}
          disabled={disabled}
          onChange={handleChange}
        />
        <SelectField
          label="탐구 영역 제2선택"
          name="inquiry_subject_2"
          value={value.inquiry_subject_2}
          options={inquirySubjects}
          disabled={disabled}
          onChange={handleChange}
        />
        <SelectField
          label="제2외국어/한문 영역"
          name="second_language_subject"
          value={value.second_language_subject}
          options={secondLanguageSubjects}
          disabled={disabled}
          onChange={handleChange}
        />
      </div>

      {validation.warnings.length > 0 ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm font-semibold leading-6 text-red-700">
          {validation.warnings.map((warning) => (
            <p key={warning}>{warning}</p>
          ))}
        </div>
      ) : null}
    </div>
  );
}
