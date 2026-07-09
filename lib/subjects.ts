import type { SubjectPreferenceInput } from "@/lib/supabase/types";

export const koreanSubjects = ["미응시", "화법과 작문", "언어와 매체"];

export const mathSubjects = ["미응시", "미적분", "기하", "확률과 통계"];

export const englishSubjects = ["미응시", "응시"];

export const historySubjects = ["응시"];

export const inquirySubjects = [
  "미응시",
  "생활과 윤리",
  "윤리와 사상",
  "한국지리",
  "세계지리",
  "동아시아사",
  "세계사",
  "경제",
  "정치와 법",
  "사회·문화",
  "물리학 I",
  "화학 I",
  "생명과학 I",
  "지구과학 I",
  "물리학 II",
  "화학 II",
  "생명과학 II",
  "지구과학 II",
  "성공적인 직업생활",
  "농업 기초 기술",
  "공업 일반",
  "상업 경제",
  "수산·해운 산업 기초",
  "인간 발달"
];

export const careerInquirySubjects = [
  "농업 기초 기술",
  "공업 일반",
  "상업 경제",
  "수산·해운 산업 기초",
  "인간 발달"
];

export const secondLanguageSubjects = [
  "미응시",
  "독일어",
  "프랑스어",
  "스페인어",
  "중국어",
  "일본어",
  "러시아어",
  "아랍어",
  "베트남어",
  "한문"
];

export const defaultSubjectPreferences: SubjectPreferenceInput = {
  korean_subject: "미응시",
  math_subject: "미응시",
  english_subject: "미응시",
  history_subject: "응시",
  inquiry_subject_1: "미응시",
  inquiry_subject_2: "미응시",
  second_language_subject: "미응시"
};

export function formatSubjectSummary(subjects: SubjectPreferenceInput) {
  return [
    `국어: ${subjects.korean_subject}`,
    `수학: ${subjects.math_subject}`,
    `영어: ${subjects.english_subject}`,
    `한국사: ${subjects.history_subject}`,
    `탐구: ${subjects.inquiry_subject_1} / ${subjects.inquiry_subject_2}`,
    `제2외국어/한문: ${subjects.second_language_subject}`
  ];
}
