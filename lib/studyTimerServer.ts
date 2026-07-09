import type { SupabaseClient } from "@supabase/supabase-js";
import {
  addSessionToTotals,
  createEmptyStudyTotals,
  getFlatStudyTotals,
  getSessionDurationSeconds,
  getStudySubjectOptions,
  getTotalStudySeconds,
  studySubjectKeys,
  type ActiveStudySession,
  type StudyAnalysisResponse,
  type StudyAnalysisSubject,
  type StudyCalendarDay,
  type StudyRankingUser,
  type StudyTimerMeResponse
} from "@/lib/studyTimer";
import type {
  Profile,
  StudySession,
  StudySubjectKey,
  SubjectPreferenceInput,
  SubjectPreferences
} from "@/lib/supabase/types";

export type StudyTimerResult<T> =
  | { data: T; error: null; status: 200 }
  | { data: null; error: string; status: number };

export type StudyTimerStartInput = {
  subject_key?: StudySubjectKey;
};

export function toSubjectInput(subjects: SubjectPreferences): SubjectPreferenceInput {
  return {
    korean_subject: subjects.korean_subject,
    math_subject: subjects.math_subject,
    english_subject: subjects.english_subject,
    history_subject: subjects.history_subject,
    inquiry_subject_1: subjects.inquiry_subject_1,
    inquiry_subject_2: subjects.inquiry_subject_2,
    second_language_subject: subjects.second_language_subject
  };
}

export async function fetchSubjectInput(
  client: SupabaseClient,
  userId: string
): Promise<StudyTimerResult<SubjectPreferenceInput>> {
  const { data, error } = await client
    .from("subject_preferences")
    .select("*")
    .eq("profile_id", userId)
    .maybeSingle<SubjectPreferences>();

  if (error || !data) {
    return {
      data: null,
      error: "선택과목 정보를 확인할 수 없습니다.",
      status: 404
    };
  }

  return { data: toSubjectInput(data), error: null, status: 200 };
}

export async function fetchUserStudySessions(
  client: SupabaseClient,
  userId: string,
  studyDate: string
): Promise<StudyTimerResult<StudySession[]>> {
  const { data, error } = await client
    .from("study_sessions")
    .select("*")
    .eq("user_id", userId)
    .eq("study_date", studyDate)
    .order("started_at", { ascending: true });

  if (error) {
    return {
      data: null,
      error: "공부 기록을 불러오지 못했습니다.",
      status: 500
    };
  }

  return { data: (data ?? []) as StudySession[], error: null, status: 200 };
}

export async function fetchTodayStudySessions(
  client: SupabaseClient,
  studyDate: string
): Promise<StudyTimerResult<StudySession[]>> {
  const { data, error } = await client
    .from("study_sessions")
    .select("*")
    .eq("study_date", studyDate)
    .order("started_at", { ascending: true });

  if (error) {
    return {
      data: null,
      error: "랭킹 기록을 불러오지 못했습니다.",
      status: 500
    };
  }

  return { data: (data ?? []) as StudySession[], error: null, status: 200 };
}

export async function fetchUserStudySessionsRange(
  client: SupabaseClient,
  userId: string,
  startStudyDate: string,
  endStudyDate: string
): Promise<StudyTimerResult<StudySession[]>> {
  const { data, error } = await client
    .from("study_sessions")
    .select("*")
    .eq("user_id", userId)
    .gte("study_date", startStudyDate)
    .lte("study_date", endStudyDate)
    .order("study_date", { ascending: true })
    .order("started_at", { ascending: true });

  if (error) {
    return {
      data: null,
      error: "공부 기록을 불러오지 못했습니다.",
      status: 500
    };
  }

  return { data: (data ?? []) as StudySession[], error: null, status: 200 };
}

export async function fetchApprovedProfiles(
  client: SupabaseClient
): Promise<StudyTimerResult<Profile[]>> {
  const { data, error } = await client
    .from("profiles")
    .select("*")
    .eq("status", "approved")
    .order("name", { ascending: true });

  if (error) {
    return {
      data: null,
      error: "회원 목록을 불러오지 못했습니다.",
      status: 500
    };
  }

  return { data: (data ?? []) as Profile[], error: null, status: 200 };
}

export function getActiveStudySession(
  session: StudySession,
  now: Date
): ActiveStudySession {
  return {
    id: session.id,
    subject_key: session.subject_key,
    subject_label: session.subject_label,
    study_date: session.study_date,
    started_at: session.started_at,
    elapsed_seconds: getSessionDurationSeconds(session, now)
  };
}

export function buildStudyTimerMeResponse(
  profile: Profile,
  subjects: SubjectPreferenceInput,
  sessions: StudySession[],
  studyDate: string,
  now: Date
): StudyTimerMeResponse {
  const totals = createEmptyStudyTotals();

  sessions.forEach((session) => addSessionToTotals(totals, session, now));

  const activeSession =
    sessions
      .filter((session) => !session.ended_at)
      .sort(
        (a, b) =>
          new Date(b.started_at).getTime() - new Date(a.started_at).getTime()
      )[0] ?? null;

  return {
    profile_name: profile.name,
    study_date: studyDate,
    server_now: now.toISOString(),
    subjects,
    subject_options: getStudySubjectOptions(subjects),
    subject_totals_seconds: totals,
    total_seconds: getTotalStudySeconds(totals),
    active_session: activeSession ? getActiveStudySession(activeSession, now) : null
  };
}

export function buildStudyRankingUsers(
  profiles: Profile[],
  sessions: StudySession[],
  now: Date
): StudyRankingUser[] {
  const profilesById = new Map(profiles.map((profile) => [profile.id, profile]));
  const usersById = new Map<string, StudyRankingUser>();

  profiles.forEach((profile) => {
    usersById.set(profile.id, {
      user_id: profile.id,
      rank: 0,
      name: profile.name,
      total_seconds: 0,
      korean_seconds: 0,
      math_seconds: 0,
      english_seconds: 0,
      history_seconds: 0,
      inquiry_1_seconds: 0,
      inquiry_2_seconds: 0,
      second_language_seconds: 0,
      subject_totals_seconds: createEmptyStudyTotals(),
      active_session: null
    });
  });

  sessions.forEach((session) => {
    if (!profilesById.has(session.user_id)) {
      return;
    }

    const user = usersById.get(session.user_id);

    if (!user) {
      return;
    }

    const duration = getSessionDurationSeconds(session, now);
    user.subject_totals_seconds[session.subject_key] += duration;
    user.total_seconds += duration;

    if (
      !session.ended_at &&
      (!user.active_session ||
        new Date(session.started_at).getTime() >
          new Date(user.active_session.started_at).getTime())
    ) {
      user.active_session = getActiveStudySession(session, now);
    }
  });

  return Array.from(usersById.values())
    .map((user) => ({
      ...user,
      korean_seconds: user.subject_totals_seconds.korean,
      math_seconds: user.subject_totals_seconds.math,
      english_seconds: user.subject_totals_seconds.english,
      history_seconds: user.subject_totals_seconds.history,
      inquiry_1_seconds: user.subject_totals_seconds.inquiry_1,
      inquiry_2_seconds: user.subject_totals_seconds.inquiry_2,
      second_language_seconds: user.subject_totals_seconds.second_language
    }))
    .sort((a, b) => {
      if (b.total_seconds !== a.total_seconds) {
        return b.total_seconds - a.total_seconds;
      }

      return a.name.localeCompare(b.name, "ko");
    })
    .map((user, index) => ({
      ...user,
      rank: index + 1
    }));
}

export function buildStudyCalendarDays(
  days: string[],
  sessions: StudySession[],
  now: Date
): StudyCalendarDay[] {
  const totalsByDate = new Map<string, ReturnType<typeof createEmptyStudyTotals>>();

  days.forEach((day) => {
    totalsByDate.set(day, createEmptyStudyTotals());
  });

  sessions.forEach((session) => {
    const totals = totalsByDate.get(session.study_date);

    if (!totals) {
      return;
    }

    addSessionToTotals(totals, session, now);
  });

  return days.map((day) => {
    const totals = totalsByDate.get(day) ?? createEmptyStudyTotals();

    return {
      study_date: day,
      total_seconds: getTotalStudySeconds(totals),
      ...getFlatStudyTotals(totals),
      subject_totals_seconds: totals
    };
  });
}

export function buildStudyAnalysisResponse({
  subjects,
  sessions,
  dailyDates,
  startStudyDate,
  endStudyDate,
  now
}: {
  subjects: SubjectPreferenceInput;
  sessions: StudySession[];
  dailyDates: string[];
  startStudyDate: string;
  endStudyDate: string;
  now: Date;
}): StudyAnalysisResponse {
  const subjectOptions = getStudySubjectOptions(subjects);
  const subjectTotals = createEmptyStudyTotals();
  const dailyTotals = new Map<string, number>();

  dailyDates.forEach((date) => dailyTotals.set(date, 0));

  sessions.forEach((session) => {
    const duration = getSessionDurationSeconds(session, now);
    subjectTotals[session.subject_key] += duration;
    dailyTotals.set(session.study_date, (dailyTotals.get(session.study_date) ?? 0) + duration);
  });

  const totalSeconds = getTotalStudySeconds(subjectTotals);
  const subjectRows: StudyAnalysisSubject[] = studySubjectKeys.map((key) => {
    const option = subjectOptions.find((subjectOption) => subjectOption.key === key);
    const subjectSeconds = subjectTotals[key];

    return {
      subject_key: key,
      subject_label: option?.title ?? key,
      subject_choice_label: option?.label ?? "",
      total_seconds: subjectSeconds,
      percentage: totalSeconds > 0 ? Math.round((subjectSeconds / totalSeconds) * 100) : 0,
      enabled: option?.enabled ?? false
    };
  });

  const enabledSubjects = subjectRows.filter((subject) => subject.enabled);
  const mostStudiedSubject =
    enabledSubjects.length > 0
      ? [...enabledSubjects].sort((a, b) => b.total_seconds - a.total_seconds)[0]
      : null;
  const leastStudiedSubject =
    enabledSubjects.length > 0
      ? [...enabledSubjects].sort((a, b) => a.total_seconds - b.total_seconds)[0]
      : null;

  return {
    start_study_date: startStudyDate,
    end_study_date: endStudyDate,
    server_now: now.toISOString(),
    total_seconds: totalSeconds,
    average_seconds: Math.floor(totalSeconds / Math.max(dailyDates.length, 1)),
    most_studied_subject: mostStudiedSubject ?? null,
    least_studied_subject: leastStudiedSubject ?? null,
    subject_totals: subjectRows,
    daily_totals: dailyDates.map((studyDate) => ({
      study_date: studyDate,
      total_seconds: dailyTotals.get(studyDate) ?? 0
    }))
  };
}

export async function stopActiveStudySessions(
  client: SupabaseClient,
  userId: string,
  now: Date
): Promise<StudyTimerResult<StudySession[]>> {
  const { data, error } = await client
    .from("study_sessions")
    .select("*")
    .eq("user_id", userId)
    .is("ended_at", null);

  if (error) {
    return {
      data: null,
      error: "실행 중인 타이머를 확인하지 못했습니다.",
      status: 500
    };
  }

  const activeSessions = (data ?? []) as StudySession[];
  const stoppedSessions: StudySession[] = [];

  for (const session of activeSessions) {
    const duration = Math.max(
      0,
      Math.floor((now.getTime() - new Date(session.started_at).getTime()) / 1000)
    );

    const { data: stoppedSession, error: stopError } = await client
      .from("study_sessions")
      .update({
        ended_at: now.toISOString(),
        duration_seconds: duration
      })
      .eq("id", session.id)
      .select("*")
      .single<StudySession>();

    if (stopError || !stoppedSession) {
      return {
        data: null,
        error: "타이머 정지 중 오류가 발생했습니다.",
        status: 500
      };
    }

    stoppedSessions.push(stoppedSession);
  }

  return { data: stoppedSessions, error: null, status: 200 };
}
