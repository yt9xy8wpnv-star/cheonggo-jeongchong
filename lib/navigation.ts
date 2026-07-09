export type MainMenuGroup = {
  key: string;
  title: string;
  description: string;
  href: string;
  active: string[];
  items: Array<{
    title: string;
    href: string;
  }>;
};

export const utilityMenuLinks = [
  { title: "동문회", href: "/alumni" },
  { title: "FAQ", href: "/faq" },
  { title: "발전기금", href: "/fund" },
  { title: "입시 결과", href: "/admission-results" }
];

export const mainMenuGroups: MainMenuGroup[] = [
  {
    key: "about",
    title: "단체소개",
    description: "청고정총의 목적, 조직, 위치 정보를 확인할 수 있습니다.",
    href: "/about",
    active: ["/about", "/leader", "/organization", "/location"],
    items: [
      { title: "청고정총 소개", href: "/about" },
      { title: "대표 소개", href: "/leader" },
      { title: "조직도", href: "/organization" },
      { title: "오시는 길", href: "/location" }
    ]
  },
  {
    key: "notice",
    title: "공지사항",
    description: "운영 공지와 중요한 안내를 빠르게 확인합니다.",
    href: "/notice",
    active: ["/notice"],
    items: [{ title: "전체 공지", href: "/notice" }]
  },
  {
    key: "community",
    title: "커뮤니티",
    description: "정시 생활, 공부 인증, 질문과 자료 공유를 나누는 공간입니다.",
    href: "/community",
    active: ["/community"],
    items: [
      { title: "커뮤니티 홈", href: "/community" },
      { title: "자유게시판", href: "/community/free" },
      { title: "공부 인증", href: "/community/study" },
      { title: "질문 게시판", href: "/community/qna" },
      { title: "자료 공유", href: "/community/resources-share" },
      { title: "모의고사 후기", href: "/community/reviews" }
    ]
  },
  {
    key: "mock",
    title: "모의고사",
    description: "모의고사 안내부터 답안 입력, 결과와 분석까지 이어집니다.",
    href: "/mock",
    active: ["/mock"],
    items: [
      { title: "모의고사 안내", href: "/mock" },
      { title: "답안 입력", href: "/mock/submit" },
      { title: "채점 결과", href: "/mock/result" },
      { title: "등급컷", href: "/mock/cutline" },
      { title: "문항별 분석", href: "/mock/analysis" }
    ]
  },
  {
    key: "service",
    title: "서비스",
    description: "굿즈, 타이머, 캘린더, 자료실을 한곳에서 이용합니다.",
    href: "/service/timer",
    active: ["/service"],
    items: [
      { title: "굿즈샵", href: "/service/shop" },
      { title: "정시파출소", href: "/service/police" },
      { title: "정시타이머", href: "/service/timer" },
      { title: "정시 캘린더", href: "/service/calendar" },
      { title: "자료실", href: "/service/resources" }
    ]
  },
  {
    key: "mypage",
    title: "마이페이지",
    description: "개인 페이지, 선택과목, 가입 관리, 관리자 화면으로 이동합니다.",
    href: "/mypage",
    active: ["/mypage", "/admin"],
    items: [
      { title: "마이페이지 홈", href: "/mypage" },
      { title: "선택과목 수정", href: "/mypage/subjects" },
      { title: "회원가입 관리", href: "/mypage/admin/signup-requests" },
      { title: "관리자", href: "/admin" }
    ]
  }
];
