export type UserRole = "user" | "admin";
export type ProfileStatus = "pending" | "approved" | "rejected";

export type Profile = {
  id: string;
  username: string;
  name: string;
  grade: number;
  class_number: number;
  student_number: number;
  role: UserRole;
  status: ProfileStatus;
  created_at: string;
  approved_at: string | null;
  rejected_at: string | null;
};

export type SubjectPreferences = {
  profile_id: string;
  korean_subject: string;
  math_subject: string;
  english_subject: string;
  history_subject: string;
  inquiry_subject_1: string;
  inquiry_subject_2: string;
  second_language_subject: string;
  updated_at: string;
};

export type SubjectPreferenceInput = Omit<
  SubjectPreferences,
  "profile_id" | "updated_at"
>;

export type SignupRequest = {
  profile: Profile;
  subjects: SubjectPreferences | null;
};

export type StudySubjectKey =
  | "korean"
  | "math"
  | "english"
  | "history"
  | "inquiry_1"
  | "inquiry_2"
  | "second_language";

export type StudySession = {
  id: string;
  user_id: string;
  study_date: string;
  subject_key: StudySubjectKey;
  subject_label: string;
  started_at: string;
  ended_at: string | null;
  duration_seconds: number | null;
  created_at: string;
  updated_at: string;
};

export type CommunityBoardType =
  | "free"
  | "study"
  | "qna"
  | "resources"
  | "reviews";

export type CommunityStatus = "published" | "hidden" | "deleted";

export type CommunityPost = {
  id: string;
  board_type: CommunityBoardType;
  user_id: string;
  title: string;
  content: string;
  status: CommunityStatus;
  is_pinned: boolean;
  view_count: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type CommunityPostImage = {
  id: string;
  post_id: string;
  image_url: string;
  storage_path: string;
  order_index: number;
  created_at: string;
};

export type CommunityComment = {
  id: string;
  post_id: string;
  user_id: string;
  parent_id: string | null;
  content: string;
  status: CommunityStatus;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type CommunityReactionType = "like" | "dislike" | "helpful";

export type CommunityReaction = {
  id: string;
  target_type: "post" | "comment" | "answer";
  target_id: string;
  user_id: string;
  reaction_type: CommunityReactionType;
  created_at: string;
};

export type CommunityStudyCertification = {
  id: string;
  post_id: string;
  user_id: string;
  study_date: string;
  captured_at: string;
  total_seconds: number;
  korean_seconds: number;
  math_seconds: number;
  english_seconds: number;
  history_seconds: number;
  inquiry_1_seconds: number;
  inquiry_2_seconds: number;
  second_language_seconds: number;
  korean_subject: string | null;
  math_subject: string | null;
  english_subject: string | null;
  history_subject: string | null;
  inquiry_subject_1: string | null;
  inquiry_subject_2: string | null;
  second_language_subject: string | null;
  rank_position: number | null;
  is_rank_1: boolean;
  rank_total_users: number | null;
  created_at: string;
};

export type QnaQuestionStatus = "waiting" | "answered" | "accepted";

export type CommunityQuestion = {
  id: string;
  post_id: string;
  subject_area: string;
  subject_detail: string;
  question_status: QnaQuestionStatus;
  accepted_answer_id: string | null;
  created_at: string;
  updated_at: string;
};

export type CommunityAnswer = {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  status: CommunityStatus;
  is_accepted: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type CommunityAnswerImage = {
  id: string;
  answer_id: string;
  image_url: string;
  storage_path: string;
  order_index: number;
  created_at: string;
};

export type PoliceReportType =
  | "post_comment"
  | "early_admission_behavior"
  | "study_disruption"
  | "delivery_behavior"
  | "other";

export type PoliceTargetType = "post" | "comment" | "answer";

export type PoliceReportStatus =
  | "received"
  | "reviewing"
  | "resolved"
  | "rejected";

export type PoliceReport = {
  id: string;
  reporter_id: string | null;
  report_type: PoliceReportType;
  target_type: PoliceTargetType | null;
  target_id: string | null;
  target_label: string | null;
  target_author_name: string | null;
  accused_name: string | null;
  reason: string;
  detail: string;
  image_url: string | null;
  storage_path: string | null;
  status: PoliceReportStatus;
  admin_note: string | null;
  handled_by: string | null;
  handled_at: string | null;
  created_at: string;
  updated_at: string;
};
