import { NextResponse } from "next/server";
import { normalizeUsername, usernameToInternalEmail } from "@/lib/auth";
import { requireApprovedUserFromRequest } from "@/lib/serverAuth";
import type { Profile } from "@/lib/supabase/types";

const usernamePattern = /^[a-z0-9_]{2,32}$/;

type UsernameBody = {
  new_username?: string;
};

export async function POST(request: Request) {
  const auth = await requireApprovedUserFromRequest(request);

  if (!auth.client || !auth.profile) {
    return NextResponse.json({ message: auth.error }, { status: auth.status });
  }

  const body = (await request.json().catch(() => ({}))) as UsernameBody;
  const newUsername = normalizeUsername(body.new_username ?? "");

  if (!usernamePattern.test(newUsername)) {
    return NextResponse.json(
      { message: "아이디는 영문 소문자, 숫자, 밑줄을 사용해 2~32자로 입력해 주세요." },
      { status: 400 }
    );
  }

  if (newUsername === auth.profile.username) {
    return NextResponse.json(
      { message: "현재 아이디와 다른 아이디를 입력해 주세요." },
      { status: 400 }
    );
  }

  const { data: existing } = await auth.client
    .from("profiles")
    .select("id")
    .eq("username", newUsername)
    .maybeSingle<Pick<Profile, "id">>();

  if (existing && existing.id !== auth.profile.id) {
    return NextResponse.json(
      { message: "이미 사용 중인 아이디입니다." },
      { status: 409 }
    );
  }

  const oldUsername = auth.profile.username;
  const { error: authError } = await auth.client.auth.admin.updateUserById(
    auth.profile.id,
    {
      email: usernameToInternalEmail(newUsername),
      user_metadata: {
        username: newUsername,
        name: auth.profile.name
      }
    }
  );

  if (authError) {
    return NextResponse.json(
      { message: "로그인 계정 아이디를 변경하지 못했습니다." },
      { status: 500 }
    );
  }

  const { error: profileError } = await auth.client
    .from("profiles")
    .update({ username: newUsername })
    .eq("id", auth.profile.id);

  if (profileError) {
    await auth.client.auth.admin.updateUserById(auth.profile.id, {
      email: usernameToInternalEmail(oldUsername),
      user_metadata: {
        username: oldUsername,
        name: auth.profile.name
      }
    });

    return NextResponse.json(
      { message: "프로필 아이디를 변경하지 못했습니다." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    message: "아이디가 변경되었습니다.",
    username: newUsername
  });
}
