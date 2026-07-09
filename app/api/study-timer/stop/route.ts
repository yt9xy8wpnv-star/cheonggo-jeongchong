import { NextResponse } from "next/server";
import { requireApprovedUserFromRequest } from "@/lib/serverAuth";
import { getStudyDate } from "@/lib/studyDate";
import {
  buildStudyTimerMeResponse,
  fetchSubjectInput,
  fetchUserStudySessions,
  stopActiveStudySessions
} from "@/lib/studyTimerServer";

export async function POST(request: Request) {
  const context = await requireApprovedUserFromRequest(request);

  if (!context.client || !context.profile) {
    return NextResponse.json({ message: context.error }, { status: context.status });
  }

  const now = new Date();
  const stopResult = await stopActiveStudySessions(context.client, context.profile.id, now);

  if (!stopResult.data) {
    return NextResponse.json(
      { message: stopResult.error },
      { status: stopResult.status }
    );
  }

  const subjectResult = await fetchSubjectInput(context.client, context.profile.id);

  if (!subjectResult.data) {
    return NextResponse.json(
      { message: subjectResult.error },
      { status: subjectResult.status }
    );
  }

  const studyDate = getStudyDate(now);
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
        ? "타이머를 정지했습니다."
        : "실행 중인 타이머가 없습니다.",
    snapshot: buildStudyTimerMeResponse(
      context.profile,
      subjectResult.data,
      sessionsResult.data,
      studyDate,
      now
    )
  });
}
