import type {
  CommunityBoardType,
  PoliceReportType,
  PoliceTargetType
} from "@/lib/supabase/types";

export const policeReportImageBucket = "police-report-images";
export const maxPoliceReportImageCount = 1;
export const maxPoliceReportImageSize = 5 * 1024 * 1024;
export const allowedPoliceReportImageTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif"
];

export const policeReportTypes = [
  {
    value: "post_comment",
    label: "게시물/댓글 신고",
    description: "커뮤니티 게시글 또는 답변·댓글의 문제를 신고합니다."
  },
  {
    value: "early_admission_behavior",
    label: "수시행동 신고",
    description: "정시파이터 정신에 어긋나는 수시 관련 행위를 제보합니다."
  },
  {
    value: "study_disruption",
    label: "공부 방해 신고",
    description: "자습, 순공, 집중을 방해하는 행위를 신고합니다."
  },
  {
    value: "delivery_behavior",
    label: "딸배짓 신고",
    description: "정시파이터 기강을 흐리는 행동을 제보합니다."
  },
  {
    value: "other",
    label: "기타 신고",
    description: "위 유형에 해당하지 않는 내용을 신고합니다."
  }
] as const satisfies ReadonlyArray<{
  value: PoliceReportType;
  label: string;
  description: string;
}>;

export const policeReasons = [
  "수시행동 신고",
  "공부 방해 신고",
  "딸배짓 신고",
  "욕설 및 비방",
  "기타"
] as const;

export type PoliceReason = (typeof policeReasons)[number];

export const policeTargetBoards = [
  { value: "all", label: "전체" },
  { value: "free", label: "자유게시판" },
  { value: "study", label: "공부 인증" },
  { value: "qna", label: "질문 게시판" }
] as const;

export type PoliceTargetBoardFilter = (typeof policeTargetBoards)[number]["value"];

export type PoliceTargetListItem = {
  id: string;
  board_type: Extract<CommunityBoardType, "free" | "study" | "qna">;
  board_label: string;
  title: string;
  author_name: string;
  created_at: string;
};

export type PoliceTargetChildItem = {
  id: string;
  target_type: Extract<PoliceTargetType, "comment" | "answer">;
  author_name: string;
  content: string;
  created_at: string;
};

export type PoliceTargetDetailResponse = {
  post: PoliceTargetListItem;
  comments: PoliceTargetChildItem[];
  answers: PoliceTargetChildItem[];
};

export type PoliceTargetsResponse = {
  posts: PoliceTargetListItem[];
  pagination: {
    page: number;
    page_size: number;
    total: number;
    total_pages: number;
  };
  q: string;
  board: PoliceTargetBoardFilter;
};

export function getPoliceReportTypeLabel(value: PoliceReportType) {
  return policeReportTypes.find((type) => type.value === value)?.label ?? value;
}

export function getPoliceBoardLabel(value: CommunityBoardType) {
  if (value === "free") {
    return "자유게시판";
  }

  if (value === "study") {
    return "공부 인증";
  }

  if (value === "qna") {
    return "질문 게시판";
  }

  return "커뮤니티";
}

export function isPoliceReportType(value: string): value is PoliceReportType {
  return policeReportTypes.some((type) => type.value === value);
}

export function isPoliceTargetType(value: string): value is PoliceTargetType {
  return value === "post" || value === "comment" || value === "answer";
}

export function isPoliceReason(value: string): value is PoliceReason {
  return policeReasons.includes(value as PoliceReason);
}

export function normalizePoliceTargetBoard(
  value: string | null
): PoliceTargetBoardFilter {
  return policeTargetBoards.some((board) => board.value === value)
    ? (value as PoliceTargetBoardFilter)
    : "all";
}

export function normalizePolicePage(value: string | null) {
  const page = Number(value);
  return Number.isInteger(page) && page > 0 ? page : 1;
}

export function normalizePolicePageSize(value: string | null) {
  const pageSize = Number(value);

  if (!Number.isInteger(pageSize)) {
    return 8;
  }

  return Math.min(Math.max(pageSize, 1), 12);
}

export function isAllowedPoliceReportImage(file: File) {
  return (
    allowedPoliceReportImageTypes.includes(file.type) &&
    file.size <= maxPoliceReportImageSize
  );
}

export function validatePoliceDetail(detail: string) {
  const trimmedDetail = detail.trim();

  if (trimmedDetail.length < 5 || trimmedDetail.length > 1000) {
    return {
      ok: false,
      message: "신고 내용은 5자 이상 1000자 이하로 입력해 주세요."
    };
  }

  return { ok: true, message: "" };
}

export function validatePoliceAccusedName(name: string, required: boolean) {
  const trimmedName = name.trim();

  if (!required && trimmedName.length === 0) {
    return { ok: true, message: "" };
  }

  if (trimmedName.length < 2 || trimmedName.length > 30) {
    return {
      ok: false,
      message: "이름은 2자 이상 30자 이하로 입력해 주세요."
    };
  }

  return { ok: true, message: "" };
}

export function getPoliceReportReason(reportType: PoliceReportType, reason: string) {
  if (reportType === "early_admission_behavior") {
    return "수시행동 신고";
  }

  if (reportType === "study_disruption") {
    return "공부 방해 신고";
  }

  if (reportType === "delivery_behavior") {
    return "딸배짓 신고";
  }

  if (reportType === "other") {
    return "기타";
  }

  return reason;
}
