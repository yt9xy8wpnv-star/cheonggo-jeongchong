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
