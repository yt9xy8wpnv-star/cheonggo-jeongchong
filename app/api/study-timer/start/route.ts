import { NextResponse } from "next/server";
import { requireApprovedUserFromRequest } from "@/lib/serverAuth";
import { getStudyDate } from "@/lib/studyDate";
import {
  buildStudyTimerMeResponse,
  fetchSubjectInput,
  fetchUserStudySessions,
  stopActiveStudySessions
} from "@/lib/studyTimerServer";
import {
  getStudySubjectOption,
  getSessionDurationSeconds,
  studySubjectKeys
} from "@/lib/studyTimer";
import type { StudySession, StudySubjectKey } from "@/lib/supabase/types";

type StartBody = {
  subject_key?: string;
};

export async function POST(request: Request) {
  const context = await requireApprovedUserFromRequest(request);

  if (!context.client || !context.profile || !context.user) {
    return NextResponse.json({ message: context.error }, { status: context.status });
  }

  const body = (await request.json().catch(() => ({}))) as StartBody;
  const subjectKey = body.subject_key as StudySubjectKey | undefined;

  if (!subjectKey || !studySubjectKeys.includes(subjectKey)) {
    return NextResponse.json(
      { message: "과목 정보를 확인해 주세요." },
      { status: 400 }
    );
  }

  const subjectResult = await fetchSubjectInput(context.client, context.profile.id);

  if (!subjectResult.data) {
    return NextResponse.json(
      { message: subjectResult.error },
      { status: subjectResult.status }
    );
  }

  const subjectOption = getStudySubjectOption(subjectResult.data, subjectKey);

  if (!subjectOption?.enabled) {
    return NextResponse.json(
      { message: "미응시 과목은 타이머를 시작할 수 없습니다." },
      { status: 400 }
    );
  }

  const now = new Date();
  const stopResult = await stopActiveStudySessions(context.client, context.profile.id, now);

  if (!stopResult.data) {
    return NextResponse.json(
      { message: stopResult.error },
      { status: stopResult.status }
    );
  }

  const studyDate = getStudyDate(now);
  const { data: session, error } = await context.client
    .from("study_sessions")
    .insert({
      user_id: context.user.id,
      study_date: studyDate,
      subject_key: subjectKey,
      subject_label: subjectOption.label,
      started_at: now.toISOString()
    })
    .select("*")
    .single<StudySession>();

  if (error || !session) {
    return NextResponse.json(
      { message: "타이머 시작 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }

  const sessionsResult = await fetchUserStudySessions(
    context.client,
    context.profile.id,
    studyDate
  );

  if (!sessionsResult.data) {
    return NextResponse.json(
      { message: sessionsResult.error },
      { status: sessionsResult.status }
    );
  }

  return NextResponse.json({
    message:
      stopResult.data.length > 0
        ? "기존 과목을 정지하고 새 과목을 시작했습니다."
        : "타이머를 시작했습니다.",
    active_elapsed_seconds: getSessionDurationSeconds(session, now),
    snapshot: buildStudyTimerMeResponse(
      context.profile,
      subjectResult.data,
      sessionsResult.data,
      studyDate,
      now
    )
  });
}
