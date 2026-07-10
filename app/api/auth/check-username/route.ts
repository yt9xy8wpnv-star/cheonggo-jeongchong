import { NextResponse } from "next/server";
import { normalizeUsername } from "@/lib/auth";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

const usernamePattern = /^[a-z0-9_]{2,32}$/;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = normalizeUsername(searchParams.get("username") ?? "");

  if (!username) {
    return NextResponse.json(
      { available: false, message: "아이디를 입력해 주세요." },
      { status: 400 }
    );
  }

  if (!usernamePattern.test(username)) {
    return NextResponse.json(
      {
        available: false,
        message: "아이디는 영문 소문자, 숫자, 밑줄을 사용해 2~32자로 입력해 주세요."
      },
      { status: 400 }
    );
  }

  const { client, error } = getSupabaseAdminClient();

  if (!client) {
    return NextResponse.json({ available: false, message: error }, { status: 500 });
  }

  const { data, error: queryError } = await client
    .from("profiles")
    .select("id")
    .eq("username", username)
    .maybeSingle();

  if (queryError) {
    return NextResponse.json(
      { available: false, message: "아이디 중복확인 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    available: !data,
    message: data ? "이미 사용 중인 아이디입니다." : "사용 가능한 아이디입니다."
  });
}
