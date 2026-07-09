import { NextResponse } from "next/server";
import { requireApprovedUserFromRequest } from "@/lib/serverAuth";
import { getMonthDateRange, getStudyMonth, isValidStudyMonth } from "@/lib/studyDate";
import {
  buildStudyCalendarDays,
  fetchUserStudySessionsRange
} from "@/lib/studyTimerServer";

export async function GET(request: Request) {
  const context = await requireApprovedUserFromRequest(request);

  if (!context.client || !context.profile) {
    return NextResponse.json({ message: context.error }, { status: context.status });
  }

  const now = new Date();
  const requestedMonth =
    new URL(request.url).searchParams.get("month") ?? getStudyMonth(now);

  if (!isValidStudyMonth(requestedMonth)) {
    return NextResponse.json(
      { message: "월 형식을 확인해 주세요." },
      { status: 400 }
    );
  }

  const monthRange = getMonthDateRange(requestedMonth);
  const sessionsResult = await fetchUserStudySessionsRange(
    context.client,
    context.profile.id,
    monthRange.start,
    monthRange.end
  );

  if (!sessionsResult.data) {
    return NextResponse.json(
      { message: sessionsResult.error },
      { status: sessionsResult.status }
    );
  }

  return NextResponse.json({
    month: requestedMonth,
    server_now: now.toISOString(),
    days: buildStudyCalendarDays(monthRange.days, sessionsResult.data, now)
  });
}
