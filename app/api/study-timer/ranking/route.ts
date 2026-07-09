import { NextResponse } from "next/server";
import { requireApprovedUserFromRequest } from "@/lib/serverAuth";
import { getStudyDate } from "@/lib/studyDate";
import {
  buildStudyRankingUsers,
  fetchApprovedProfiles,
  fetchTodayStudySessions
} from "@/lib/studyTimerServer";

export async function GET(request: Request) {
  const context = await requireApprovedUserFromRequest(request);

  if (!context.client || !context.profile) {
    return NextResponse.json({ message: context.error }, { status: context.status });
  }

  const now = new Date();
  const studyDate = getStudyDate(now);
  const profileResult = await fetchApprovedProfiles(context.client);

  if (!profileResult.data) {
    return NextResponse.json(
      { message: profileResult.error },
      { status: profileResult.status }
    );
  }

  const sessionsResult = await fetchTodayStudySessions(context.client, studyDate);

  if (!sessionsResult.data) {
    return NextResponse.json(
      { message: sessionsResult.error },
      { status: sessionsResult.status }
    );
  }

  const users = buildStudyRankingUsers(
    profileResult.data,
    sessionsResult.data,
    now
  );

  return NextResponse.json({
    study_date: studyDate,
    server_now: now.toISOString(),
    top5: users.slice(0, 5),
    allUsers: users,
    users
  });
}
