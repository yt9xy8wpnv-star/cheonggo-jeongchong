import type { SupabaseClient } from "@supabase/supabase-js";
import { getStudyDate } from "@/lib/studyDate";
import {
  buildStudyRankingUsers,
  buildStudyTimerMeResponse,
  fetchApprovedProfiles,
  fetchSubjectInput,
  fetchTodayStudySessions,
  fetchUserStudySessions
} from "@/lib/studyTimerServer";
import type { StudyCertificationView } from "@/lib/community";
import type { Profile } from "@/lib/supabase/types";

export async function buildStudyCertificationSnapshot(
  client: SupabaseClient,
  profile: Profile
) {
  const now = new Date();
  const studyDate = getStudyDate(now);
  const [subjectResult, userSessionsResult, profilesResult, allSessionsResult] =
    await Promise.all([
      fetchSubjectInput(client, profile.id),
      fetchUserStudySessions(client, profile.id, studyDate),
      fetchApprovedProfiles(client),
      fetchTodayStudySessions(client, studyDate)
    ]);

  if (!subjectResult.data) {
    return {
      data: null,
      error: subjectResult.error,
      status: subjectResult.status
    };
  }

  if (!userSessionsResult.data) {
    return {
      data: null,
      error: userSessionsResult.error,
      status: userSessionsResult.status
    };
  }

  if (!profilesResult.data) {
    return {
      data: null,
      error: profilesResult.error,
      status: profilesResult.status
    };
  }

  if (!allSessionsResult.data) {
    return {
      data: null,
      error: allSessionsResult.error,
      status: allSessionsResult.status
    };
  }

  const timer = buildStudyTimerMeResponse(
    profile,
    subjectResult.data,
    userSessionsResult.data,
    studyDate,
    now
  );
  const rankingUsers = buildStudyRankingUsers(
    profilesResult.data,
    allSessionsResult.data,
    now
  );
  const rankingUser = rankingUsers.find((user) => user.user_id === profile.id);
  const rankPosition = rankingUser?.rank ?? null;
  const totals = timer.subject_totals_seconds;

  return {
    data: {
      post_id: "",
      user_id: profile.id,
      study_date: studyDate,
      captured_at: now.toISOString(),
      total_seconds: timer.total_seconds,
      korean_seconds: totals.korean,
      math_seconds: totals.math,
      english_seconds: totals.english,
      history_seconds: totals.history,
      inquiry_1_seconds: totals.inquiry_1,
      inquiry_2_seconds: totals.inquiry_2,
      second_language_seconds: totals.second_language,
      korean_subject: subjectResult.data.korean_subject,
      math_subject: subjectResult.data.math_subject,
      english_subject: subjectResult.data.english_subject,
      history_subject: subjectResult.data.history_subject,
      inquiry_subject_1: subjectResult.data.inquiry_subject_1,
      inquiry_subject_2: subjectResult.data.inquiry_subject_2,
      second_language_subject: subjectResult.data.second_language_subject,
      rank_position: rankPosition,
      is_rank_1: timer.total_seconds > 0 && rankPosition === 1,
      rank_total_users: rankingUsers.length
    },
    error: null,
    status: 200
  };
}

export function toStudyCertificationView(
  certification: StudyCertificationView
): StudyCertificationView {
  return certification;
}
