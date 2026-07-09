import { NextResponse } from "next/server";
import { requireApprovedUserFromRequest } from "@/lib/serverAuth";
import { getStudyDate } from "@/lib/studyDate";
import {
  buildStudyTimerMeResponse,
  fetchSubjectInput,
  fetchUserStudySessions
} from "@/lib/studyTimerServer";

export async function GET(request: Request) {
  const context = await requireApprovedUserFromRequest(request);

  if (!context.client || !context.profile) {
    return NextResponse.json({ message: context.error }, { status: context.status });
  }

  const subjectResult = await fetchSubjectInput(context.client, context.profile.id);

  if (!subjectResult.data) {
    return NextResponse.json(
      { message: subjectResult.error },
      { status: subjectResult.status }
    );
  }

  const now = new Date();
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

  return NextResponse.json(
    buildStudyTimerMeResponse(
      context.profile,
      subjectResult.data,
      sessionsResult.data,
      studyDate,
      now
    )
  );
}
