import { careerInquirySubjects } from "@/lib/subjects";

type SubjectPreferenceValidationInput = {
  inquiry_subject_1: string;
  inquiry_subject_2: string;
};

export function validateSubjectPreferences(input: SubjectPreferenceValidationInput) {
  const warnings: string[] = [];
  const first = input.inquiry_subject_1;
  const second = input.inquiry_subject_2;

  if (first !== "미응시" && second !== "미응시" && first === second) {
    warnings.push("탐구 제1선택과 제2선택은 같은 과목으로 선택할 수 없습니다.");
  }

  if (careerInquirySubjects.includes(second) && first !== "성공적인 직업생활") {
    warnings.push(
      "직업탐구를 제2선택으로 응시하는 경우 제1선택은 ‘성공적인 직업생활’이어야 합니다."
    );
  }

  return {
    warnings,
    isValid: warnings.length === 0
  };
}
