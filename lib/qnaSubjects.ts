export const qnaSubjectOptions = {
  "국어": ["언어와 매체", "화법과 작문"],
  "수학": ["미적분", "확률과 통계", "기하"],
  "영어": ["영어"],
  "한국사": ["한국사"],
  "사회탐구": [
    "생활과 윤리",
    "윤리와 사상",
    "한국지리",
    "세계지리",
    "동아시아사",
    "세계사",
    "경제",
    "정치와 법",
    "사회·문화"
  ],
  "과학탐구": [
    "물리학 I",
    "화학 I",
    "생명과학 I",
    "지구과학 I",
    "물리학 II",
    "화학 II",
    "생명과학 II",
    "지구과학 II"
  ],
  "직업탐구": [
    "성공적인 직업생활",
    "농업 기초 기술",
    "공업 일반",
    "상업 경제",
    "수산·해운 산업 기초",
    "인간 발달"
  ],
  "제2외국어/한문": [
    "독일어",
    "프랑스어",
    "스페인어",
    "중국어",
    "일본어",
    "러시아어",
    "아랍어",
    "베트남어",
    "한문"
  ],
  "기타": ["기타"]
} as const;

export type QnaSubjectArea = keyof typeof qnaSubjectOptions;

export const qnaSubjectAreas = Object.keys(qnaSubjectOptions) as QnaSubjectArea[];

export function isQnaSubjectArea(value: string): value is QnaSubjectArea {
  return qnaSubjectAreas.includes(value as QnaSubjectArea);
}

export function getQnaSubjectDetails(area: string) {
  return isQnaSubjectArea(area) ? ([...qnaSubjectOptions[area]] as string[]) : [];
}

export function isValidQnaSubject(area: string, detail: string) {
  return getQnaSubjectDetails(area).includes(detail);
}
