import type {
  StudySession,
  StudySubjectKey,
  SubjectPreferenceInput
} from "@/lib/supabase/types";

export type StudySubjectOption = {
  key: StudySubjectKey;
  title: string;
  label: string;
  enabled: boolean;
};

export type StudyTotals = Record<StudySubjectKey, number>;

export type ActiveStudySession = Pick<
  StudySession,
  "id" | "subject_key" | "subject_label" | "started_at" | "study_date"
> & {
  elapsed_seconds: number;
};

export type StudyTimerMeResponse = {
  profile_name: string;
  study_date: string;
  server_now: string;
  subjects: SubjectPreferenceInput;
  subject_options: StudySubjectOption[];
  subject_totals_seconds: StudyTotals;
  total_seconds: number;
  active_session: ActiveStudySession | null;
};

export type StudyRankingUser = {
  user_id: string;
  name: string;
  total_seconds: number;
  korean_seconds: number;
  math_seconds: number;
  english_seconds: number;
  history_seconds: number;
  inquiry_1_seconds: number;
  inquiry_2_seconds: number;
  second_language_seconds: number;
  subject_totals_seconds: StudyTotals;
  active_session: ActiveStudySession | null;
};

export type StudyRankingResponse = {
  study_date: string;
  server_now: string;
  top5: StudyRankingUser[];
  allUsers: StudyRankingUser[];
  users: StudyRankingUser[];
};

export const studySubjectKeys: StudySubjectKey[] = [
  "korean",
  "math",
  "english",
  "history",
  "inquiry_1",
  "inquiry_2",
  "second_language"
];

export function createEmptyStudyTotals(): StudyTotals {
  return {
    korean: 0,
    math: 0,
    english: 0,
    history: 0,
    inquiry_1: 0,
    inquiry_2: 0,
    second_language: 0
  };
}

export function getStudySubjectOptions(
  subjects: SubjectPreferenceInput
): StudySubjectOption[] {
  return [
    {
      key: "korean",
      title: "국어",
      label: subjects.korean_subject,
      enabled: subjects.korean_subject !== "미응시"
    },
    {
      key: "math",
      title: "수학",
      label: subjects.math_subject,
      enabled: subjects.math_subject !== "미응시"
    },
    {
      key: "english",
      title: "영어",
      label: subjects.english_subject === "응시" ? "영어" : "미응시",
      enabled: subjects.english_subject === "응시"
    },
    {
      key: "history",
      title: "한국사",
      label: "한국사",
      enabled: true
    },
    {
      key: "inquiry_1",
      title: "탐구1",
      label: subjects.inquiry_subject_1,
      enabled: subjects.inquiry_subject_1 !== "미응시"
    },
    {
      key: "inquiry_2",
      title: "탐구2",
      label: subjects.inquiry_subject_2,
      enabled: subjects.inquiry_subject_2 !== "미응시"
    },
    {
      key: "second_language",
      title: "제2외국어/한문",
      label: subjects.second_language_subject,
      enabled: subjects.second_language_subject !== "미응시"
    }
  ];
}

export function getStudySubjectOption(
  subjects: SubjectPreferenceInput,
  key: StudySubjectKey
) {
  return getStudySubjectOptions(subjects).find((option) => option.key === key) ?? null;
}

export function getSessionDurationSeconds(session: StudySession, now: Date) {
  if (session.ended_at) {
    return Math.max(
      0,
      session.duration_seconds ??
        Math.floor(
          (new Date(session.ended_at).getTime() -
            new Date(session.started_at).getTime()) /
            1000
        )
    );
  }

  const startedAt = new Date(session.started_at).getTime();
  return Math.max(0, Math.floor((now.getTime() - startedAt) / 1000));
}

export function addSessionToTotals(
  totals: StudyTotals,
  session: StudySession,
  now: Date
) {
  totals[session.subject_key] += getSessionDurationSeconds(session, now);
}

export function getTotalStudySeconds(totals: StudyTotals) {
  return studySubjectKeys.reduce((sum, key) => sum + totals[key], 0);
}

export function getLiveDeltaSeconds(serverNow: string, now: Date) {
  return Math.max(
    0,
    Math.floor((now.getTime() - new Date(serverNow).getTime()) / 1000)
  );
}

export function getLiveActiveElapsedSeconds(
  activeSession: ActiveStudySession | null,
  serverNow: string,
  now: Date
) {
  if (!activeSession) {
    return 0;
  }

  return activeSession.elapsed_seconds + getLiveDeltaSeconds(serverNow, now);
}

export function getLiveSubjectTotals(
  totals: StudyTotals,
  activeSession: ActiveStudySession | null,
  serverNow: string,
  now: Date
) {
  const liveTotals = { ...totals };

  if (activeSession) {
    liveTotals[activeSession.subject_key] += getLiveDeltaSeconds(serverNow, now);
  }

  return liveTotals;
}

export function getLiveTotalSeconds(
  totalSeconds: number,
  activeSession: ActiveStudySession | null,
  serverNow: string,
  now: Date
) {
  return activeSession
    ? totalSeconds + getLiveDeltaSeconds(serverNow, now)
    : totalSeconds;
}
