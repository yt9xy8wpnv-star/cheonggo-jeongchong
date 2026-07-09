export type NoticeTag = "필독" | "모의고사" | "굿즈" | "자료" | "운영" | "서비스";

export const csatDate = "2026-11-19T00:00:00+09:00";

export const notices = [
  {
    id: "2026-operation-rule",
    tag: "필독" as NoticeTag,
    date: "2026-07-07",
    author: "청고정총 운영진",
    title: "2026 하반기 청고정총 운영 원칙 안내",
    summary:
      "공지, 자료 공유, 신고 접수, 모의고사 이용 시 지켜야 할 기본 운영 원칙을 안내합니다.",
    content: [
      "청고정총은 정시를 준비하는 청주고 학생들이 필요한 정보를 빠르게 공유하고, 모의고사와 자료를 함께 관리하기 위해 운영됩니다.",
      "커뮤니티에서는 실명 비방, 개인정보 공개, 특정 학생을 향한 조롱성 표현을 금지합니다. 정시파출소 또한 내부 밈을 위한 공간이며 실제 징계나 낙인을 목적으로 운영하지 않습니다.",
      "모의고사 자료와 등급컷은 운영진 검수 후 공개되며, 오류 제보는 자료관리부 또는 공지 댓글을 통해 접수합니다."
    ]
  },
  {
    id: "july-mock-open",
    tag: "모의고사" as NoticeTag,
    date: "2026-07-06",
    author: "모의고사부",
    title: "제1회 청고정총 생명과학Ⅱ 모의고사 응시 안내",
    summary:
      "생명과학Ⅱ 실전 감각 점검을 위한 제1회 청고정총 모의고사 응시 일정을 안내합니다.",
    content: [
      "제1회 청고정총 생명과학Ⅱ 모의고사는 정시 준비 학생들의 실전 감각 점검을 위해 운영됩니다.",
      "답안 입력 기간은 2026년 7월 8일부터 7월 10일 18시까지입니다. 기간 내 제출한 답안만 채점 결과에 반영됩니다.",
      "성적표에는 원점수, 예상 등급, 문항별 정답률, 오답률 높은 문항 목록이 포함됩니다."
    ]
  },
  {
    id: "police-rule",
    tag: "서비스" as NoticeTag,
    date: "2026-07-03",
    author: "커뮤니티관리부",
    title: "정시파출소 이용 규칙 및 신고 처리 기준 안내",
    summary:
      "정시파출소는 내부 밈과 질서 안내를 위한 공간이며 개인정보 공개와 비방은 제한됩니다.",
    content: [
      "정시파출소는 청고정총 내부 밈과 재미를 위한 서비스입니다.",
      "실명 비방, 개인정보 공개, 모욕적 표현은 운영진에 의해 삭제될 수 있습니다.",
      "처리 상태는 접수, 검토 중, 훈방, 주의, 정시교육 필요 등으로 표시됩니다."
    ]
  },
  {
    id: "goods-preorder",
    tag: "굿즈" as NoticeTag,
    date: "2026-07-03",
    author: "굿즈관리부",
    title: "청고정총 티셔츠 및 스티커 사전 수요 조사",
    summary:
      "공식 구호 디자인을 적용한 티셔츠와 정시파이터 스티커 수요 조사를 시작합니다.",
    content: [
      "굿즈 제작은 실제 결제 전 수요 조사 방식으로 진행됩니다.",
      "상품별 예상 단가와 제작 가능 수량은 굿즈샵 페이지에서 확인할 수 있습니다.",
      "주문 기능은 현재 목업이며, 실제 주문은 운영진 공지 후 별도 링크로 진행됩니다."
    ]
  },
  {
    id: "resource-upload-guide",
    tag: "자료" as NoticeTag,
    date: "2026-07-01",
    author: "자료관리부",
    title: "자료실 업로드 기준 및 과목 분류 안내",
    summary:
      "국어, 수학, 영어, 생명과학Ⅱ, 화학Ⅱ, 정시자료 분류 기준을 안내합니다.",
    content: [
      "자료실에는 직접 제작한 요약본, 오답 정리 양식, 학습 체크리스트, 모의고사 해설 자료를 올릴 수 있습니다.",
      "저작권이 있는 교재 스캔본이나 유료 강의 자료는 업로드할 수 없습니다.",
      "운영진은 자료의 출처와 분류를 확인한 뒤 게시 여부를 결정합니다."
    ]
  },
  {
    id: "community-beta",
    tag: "운영" as NoticeTag,
    date: "2026-06-28",
    author: "커뮤니티관리부",
    title: "커뮤니티 시범 운영 기간 안내",
    summary:
      "자유게시판, 공부 인증, 질문 게시판, 자료 공유, 모의고사 후기 게시판을 시범 운영합니다.",
    content: [
      "커뮤니티는 7월 한 달간 시범 운영됩니다.",
      "게시글 작성, 댓글, 신고 기능은 추후 로그인 시스템 연결 후 순차적으로 적용됩니다.",
      "시범 기간에는 운영진이 게시판 구조와 분류를 조정할 수 있습니다."
    ]
  }
];

export const homeServiceLinks = [
  {
    title: "굿즈샵",
    href: "/service/shop",
    imageSrc: "/assets/services/shop.png",
    fallbackIcon: "shop" as const
  },
  {
    title: "정시파출소",
    href: "/service/police",
    imageSrc: "/assets/services/police.png",
    fallbackIcon: "police" as const
  },
  {
    title: "정시타이머",
    href: "/service/timer",
    imageSrc: "/assets/services/timer.png",
    fallbackIcon: "timer" as const
  },
  {
    title: "정시 캘린더",
    href: "/service/calendar",
    imageSrc: "/assets/services/calendar.png",
    fallbackIcon: "calendar" as const
  },
  {
    title: "자료실",
    href: "/service/resources",
    imageSrc: "/assets/services/resources.png",
    fallbackIcon: "resources" as const
  }
];

export const homeNotices = [
  {
    id: "2026-operation-rule",
    tag: "필독" as NoticeTag,
    date: "2026-07-07",
    title: "2026 하반기 청고정총 운영 원칙 안내",
    isNew: true
  },
  {
    id: "july-mock-open",
    tag: "모의고사" as NoticeTag,
    date: "2026-07-06",
    title: "제1회 청고정총 생명과학Ⅱ 모의고사 응시 안내",
    isNew: true
  },
  {
    id: "police-rule",
    tag: "서비스" as NoticeTag,
    date: "2026-07-03",
    title: "정시파출소 이용 규칙 및 신고 처리 기준 안내",
    isNew: true
  },
  {
    id: "goods-preorder",
    tag: "굿즈" as NoticeTag,
    date: "2026-07-03",
    title: "청고정총 공식 굿즈 수요조사 안내",
    isNew: false
  }
];

export const homeCalendarEvents = [
  {
    date: "07.13",
    label: "제1회 청고정총 모의고사 접수 시작"
  },
  {
    date: "07.21",
    label: "여름방학 정시 집중 기간 시작"
  },
  {
    date: "08.01",
    label: "정시파이터 순공 인증 캠페인"
  },
  {
    date: "11.13",
    label: "2026학년도 대학수학능력시험"
  }
];

// Mock promotional statistics for the homepage numbers section.
export const numberStats = [
  {
    title: "대한민국 정시파이터 단체 순위",
    description: "전국 기준",
    values: [
      { label: "전국", value: "3위" },
      { label: "충북", value: "1위" }
    ]
  },
  {
    title: "2026 입시 서울대학교 의예과",
    description: "청고정총 합격 실적",
    values: [{ label: "", value: "5명" }]
  },
  {
    title: "2026 입시 가톨릭대학교 의예과",
    description: "청고정총 합격 실적",
    values: [{ label: "", value: "4명" }]
  },
  {
    title: "2026 입시 연세대학교 의예과",
    description: "청고정총 합격 실적",
    values: [{ label: "", value: "5명" }]
  }
];

export const boardMeta = {
  free: {
    title: "자유게시판",
    description: "정시 생활, 학교 이야기, 가벼운 잡담을 나누는 공간입니다.",
    href: "/community/free"
  },
  study: {
    title: "공부 인증",
    description: "오늘의 순공 시간과 계획 달성 여부를 기록합니다.",
    href: "/community/study"
  },
  qna: {
    title: "질문 게시판",
    description: "문제 풀이, 자료 위치, 일정 관련 질문을 올립니다.",
    href: "/community/qna"
  },
  "resources-share": {
    title: "자료 공유",
    description: "자작 자료와 정리본을 공유하는 게시판입니다.",
    href: "/community/resources-share"
  },
  reviews: {
    title: "모의고사 후기",
    description: "회차별 체감 난도와 오답 포인트를 공유합니다.",
    href: "/community/reviews"
  }
};

export type BoardKey = keyof typeof boardMeta;

export const posts = [
  {
    id: 1,
    board: "free" as BoardKey,
    category: "잡담",
    title: "자습실 3열 콘센트 살아났나요?",
    author: "익명 파이터",
    date: "2026-07-07",
    views: 128,
    comments: 7
  },
  {
    id: 2,
    board: "study" as BoardKey,
    category: "인증",
    title: "오늘 순공 7시간 40분, 영어 듣기까지 완료",
    author: "D-135",
    date: "2026-07-07",
    views: 92,
    comments: 5
  },
  {
    id: 3,
    board: "qna" as BoardKey,
    category: "수학",
    title: "미적분 29번 풀이 방향 질문합니다",
    author: "극한값",
    date: "2026-07-06",
    views: 176,
    comments: 11
  },
  {
    id: 4,
    board: "resources-share" as BoardKey,
    category: "국어",
    title: "비문학 선지 판단 체크리스트 공유",
    author: "자료관리부",
    date: "2026-07-05",
    views: 241,
    comments: 9
  },
  {
    id: 5,
    board: "reviews" as BoardKey,
    category: "7월 모의고사",
    title: "국어 독서 지문 체감 난도 후기",
    author: "정시파이터23",
    date: "2026-07-04",
    views: 311,
    comments: 18
  },
  {
    id: 6,
    board: "free" as BoardKey,
    category: "운영",
    title: "정시파출소 상태명이 은근히 살벌한데 웃깁니다",
    author: "익명",
    date: "2026-07-03",
    views: 206,
    comments: 12
  }
];

export const mockExams = [
  {
    id: "july-real",
    title: "7월 정시파이터 실전 모의고사",
    subject: "전 영역",
    date: "2026-07-10",
    status: "응시 가능",
    scoring: "채점 준비 중",
    participants: 183
  },
  {
    id: "math-half",
    title: "수학 집중 하프 모의고사",
    subject: "수학",
    date: "2026-07-18",
    status: "예정",
    scoring: "대기",
    participants: 96
  },
  {
    id: "science-ii",
    title: "탐구Ⅱ 점검 모의고사",
    subject: "생명과학Ⅱ · 화학Ⅱ",
    date: "2026-07-25",
    status: "예정",
    scoring: "대기",
    participants: 72
  }
];

export const answerResults = [
  { no: 1, answer: 3, selected: 3, rate: 91 },
  { no: 2, answer: 5, selected: 5, rate: 84 },
  { no: 3, answer: 2, selected: 4, rate: 43 },
  { no: 4, answer: 1, selected: 1, rate: 78 },
  { no: 5, answer: 4, selected: 4, rate: 69 },
  { no: 6, answer: 2, selected: 2, rate: 88 },
  { no: 7, answer: 3, selected: 1, rate: 31 },
  { no: 8, answer: 5, selected: 5, rate: 74 },
  { no: 9, answer: 1, selected: 1, rate: 66 },
  { no: 10, answer: 4, selected: 4, rate: 59 }
];

export const cutlines = [
  { grade: 1, raw: 92, standard: 132, percentile: 96 },
  { grade: 2, raw: 84, standard: 125, percentile: 89 },
  { grade: 3, raw: 75, standard: 117, percentile: 77 },
  { grade: 4, raw: 64, standard: 108, percentile: 60 },
  { grade: 5, raw: 52, standard: 98, percentile: 40 },
  { grade: 6, raw: 40, standard: 88, percentile: 23 },
  { grade: 7, raw: 29, standard: 78, percentile: 11 },
  { grade: 8, raw: 18, standard: 69, percentile: 4 },
  { grade: 9, raw: 0, standard: 60, percentile: 0 }
];

export const questionAnalysis = [
  { no: 3, unit: "독서 추론", difficulty: "어려움", correctRate: 43 },
  { no: 7, unit: "미적분", difficulty: "매우 어려움", correctRate: 31 },
  { no: 12, unit: "영어 빈칸", difficulty: "보통", correctRate: 62 },
  { no: 16, unit: "생명과학Ⅱ", difficulty: "어려움", correctRate: 48 },
  { no: 20, unit: "화학Ⅱ", difficulty: "매우 어려움", correctRate: 27 }
];

export const products = [
  {
    id: 1,
    name: "청고정총 티셔츠",
    price: 18000,
    status: "수요 조사",
    description: "전면 심볼, 후면 구호가 들어간 공식 티셔츠"
  },
  {
    id: 2,
    name: "정시파이터 스티커",
    price: 3000,
    status: "주문 가능",
    description: "노트북과 플래너에 붙이기 좋은 방수 스티커"
  },
  {
    id: 3,
    name: "청고정총 뱃지",
    price: 5000,
    status: "제작 검토",
    description: "심볼 로고를 활용한 금속 뱃지"
  },
  {
    id: 4,
    name: "수능 D-Day 카드",
    price: 2000,
    status: "주문 가능",
    description: "책상에 세워두는 월별 D-Day 카드"
  }
];

export const policeReports = [
  {
    id: 1,
    type: "수시 발언",
    title: "점심시간에 교과 전형 장점을 3분 이상 언급",
    status: "검토 중",
    date: "2026-07-07"
  },
  {
    id: 2,
    type: "자습실 소음",
    title: "형광펜 뚜껑을 12회 연속 닫음",
    status: "주의",
    date: "2026-07-06"
  },
  {
    id: 3,
    type: "정시 배신 의혹",
    title: "수행평가에 지나치게 진심인 정황 포착",
    status: "훈방",
    date: "2026-07-05"
  }
];

export const calendarEvents = [
  { date: "2026-07-08", label: "7월 모의고사 답안 입력 시작", type: "모의고사" },
  { date: "2026-07-10", label: "7월 모의고사 제출 마감", type: "모의고사" },
  { date: "2026-07-15", label: "자료실 정리 주간", type: "자료" },
  { date: "2026-07-18", label: "수학 하프 모의고사", type: "모의고사" },
  { date: "2026-07-22", label: "정시 상담 신청 점검", type: "원서" },
  { date: "2026-07-25", label: "탐구Ⅱ 점검 모의고사", type: "모의고사" }
];

export const resources = [
  {
    id: 1,
    subject: "국어",
    name: "독서 선지 판단 체크리스트.pdf",
    date: "2026-07-05",
    downloads: 312
  },
  {
    id: 2,
    subject: "수학",
    name: "미적분 오답 유형 정리.xlsx",
    date: "2026-07-04",
    downloads: 188
  },
  {
    id: 3,
    subject: "영어",
    name: "빈칸 추론 근거 표시 연습지.pdf",
    date: "2026-07-02",
    downloads: 142
  },
  {
    id: 4,
    subject: "생명과학Ⅱ",
    name: "유전 단원 실수 방지표.pdf",
    date: "2026-06-30",
    downloads: 97
  },
  {
    id: 5,
    subject: "화학Ⅱ",
    name: "평형 계산 핵심 문항 모음.pdf",
    date: "2026-06-28",
    downloads: 76
  },
  {
    id: 6,
    subject: "정시자료",
    name: "2027학년도 정시 일정 체크리스트.pdf",
    date: "2026-06-26",
    downloads: 224
  }
];

export const organizationUnits = [
  {
    name: "대표",
    role: "운영 방향 총괄, 대외 공지 승인"
  },
  {
    name: "운영진",
    role: "공지 작성, 일정 조율, 전체 서비스 점검"
  },
  {
    name: "모의고사부",
    role: "시험 일정, 답안 입력, 채점 결과 관리"
  },
  {
    name: "커뮤니티관리부",
    role: "게시판 운영, 신고 처리, 이용 규칙 관리"
  },
  {
    name: "굿즈관리부",
    role: "굿즈 수요 조사, 주문 현황, 제작 일정 관리"
  },
  {
    name: "정시파출소",
    role: "밈성 신고 접수와 커뮤니티 질서 안내"
  },
  {
    name: "자료관리부",
    role: "학습 자료 분류, 업로드 기준, 저작권 확인"
  }
];
