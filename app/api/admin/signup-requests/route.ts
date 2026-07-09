import { NextResponse } from "next/server";
import { requireApprovedAdminFromRequest } from "@/lib/serverAuth";
import type { Profile, SubjectPreferences } from "@/lib/supabase/types";

export async function GET(request: Request) {
  const context = await requireApprovedAdminFromRequest(request);

  if (!context.client || !context.profile) {
    return NextResponse.json({ message: context.error }, { status: context.status });
  }

  const { data: profiles, error: profilesError } = await context.client
    .from("profiles")
    .select("*")
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  if (profilesError) {
    return NextResponse.json(
      { message: "가입 신청 목록을 불러오지 못했습니다." },
      { status: 500 }
    );
  }

  const typedProfiles = (profiles ?? []) as Profile[];
  const ids = typedProfiles.map((profile) => profile.id);
  let subjects: SubjectPreferences[] = [];

  if (ids.length > 0) {
    const { data: subjectRows } = await context.client
      .from("subject_preferences")
      .select("*")
      .in("profile_id", ids);

    subjects = (subjectRows ?? []) as SubjectPreferences[];
  }

  return NextResponse.json({
    requests: typedProfiles.map((profile) => ({
      profile,
      subjects:
        subjects.find((subject) => subject.profile_id === profile.id) ?? null
    }))
  });
}
