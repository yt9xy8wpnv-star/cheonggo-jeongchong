import { NextResponse } from "next/server";
import { requireApprovedUserFromRequest } from "@/lib/serverAuth";
import { getStudyDate } from "@/lib/studyDate";
import {
  buildStudyTimerMeResponse,
  fetchSubjectInput,
  fetchUserStudySessions
} from "@/lib/studyTimerServer";

export async function POST(request: Request) {
  const context = await requireApprovedUserFromRequest(request);

  if (!context.client || !context.profile) {
    return NextResponse.json({ message: context.error }, { status: context.status });
  }

  const now = new Date();
  const studyDate = getStudyDate(now);

  const { error: resetError } = await context.client
    .from("study_sessions")
    .delete()
    .eq("user_id", context.profile.id)
    .eq("study_date", studyDate);

  if (resetError) {
    return NextResponse.json(
      { message: "오늘 기록을 초기화하지 못했습니다." },
      { status: 500 }
    );
  }

  const subjectResult = await fetchSubjectInput(context.client, context.profile.id);

  if (!subjectResult.data) {
    return NextResponse.json(
      { message: subjectResult.error },
      { status: subjectResult.status }
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
    snapshot: buildStudyTimerMeResponse(
      context.profile,
      subjectResult.data,
      sessionsResult.data,
      studyDate,
      now
    )
  });
}
