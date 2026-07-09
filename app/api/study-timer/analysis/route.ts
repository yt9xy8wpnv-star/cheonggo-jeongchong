import { NextResponse } from "next/server";
import { requireApprovedUserFromRequest } from "@/lib/serverAuth";
import { addDaysToStudyDate, getStudyDate } from "@/lib/studyDate";
import {
  buildStudyAnalysisResponse,
  fetchSubjectInput,
  fetchUserStudySessionsRange
} from "@/lib/studyTimerServer";

function getRecentStudyDates(endStudyDate: string, count: number) {
  return Array.from({ length: count }, (_, index) =>
    addDaysToStudyDate(endStudyDate, index - (count - 1))
  );
}

export async function GET(request: Request) {
  const context = await requireApprovedUserFromRequest(request);

  if (!context.client || !context.profile) {
    return NextResponse.json({ message: context.error }, { status: context.status });
  }

  const range = new URL(request.url).searchParams.get("range") ?? "7d";

  if (range !== "7d") {
    return NextResponse.json(
      { message: "지원하지 않는 분석 범위입니다." },
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

  const now = new Date();
  const endStudyDate = getStudyDate(now);
  const dailyDates = getRecentStudyDates(endStudyDate, 7);
  const startStudyDate = dailyDates[0];
  const sessionsResult = await fetchUserStudySessionsRange(
    context.client,
    context.profile.id,
    startStudyDate,
    endStudyDate
  );

  if (!sessionsResult.data) {
    return NextResponse.json(
      { message: sessionsResult.error },
      { status: sessionsResult.status }
    );
  }

  return NextResponse.json(
    buildStudyAnalysisResponse({
      subjects: subjectResult.data,
      sessions: sessionsResult.data,
      dailyDates,
      startStudyDate,
      endStudyDate,
      now
    })
  );
}
