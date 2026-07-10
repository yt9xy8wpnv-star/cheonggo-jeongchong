import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { usernameToInternalEmail } from "@/lib/auth";
import { requireApprovedUserFromRequest } from "@/lib/serverAuth";

type PasswordBody = {
  current_password?: string;
  new_password?: string;
  new_password_confirm?: string;
};

function getSupabasePasswordCheckClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return {
      client: null,
      error: "Supabase 공개 환경변수가 설정되지 않았습니다."
    };
  }

  return {
    client: createClient(url, anonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }),
    error: null
  };
}

export async function POST(request: Request) {
  const auth = await requireApprovedUserFromRequest(request);

  if (!auth.client || !auth.profile) {
    return NextResponse.json({ message: auth.error }, { status: auth.status });
  }

  const body = (await request.json().catch(() => ({}))) as PasswordBody;
  const currentPassword = body.current_password ?? "";
  const newPassword = body.new_password ?? "";
  const newPasswordConfirm = body.new_password_confirm ?? "";

  if (!currentPassword || !newPassword || !newPasswordConfirm) {
    return NextResponse.json(
      { message: "비밀번호를 모두 입력해 주세요." },
      { status: 400 }
    );
  }

  if (newPassword.length < 6) {
    return NextResponse.json(
      { message: "새 비밀번호는 6자 이상이어야 합니다." },
      { status: 400 }
    );
  }

  if (newPassword !== newPasswordConfirm) {
    return NextResponse.json(
      { message: "새 비밀번호와 확인 값이 일치하지 않습니다." },
      { status: 400 }
    );
  }

  if (currentPassword === newPassword) {
    return NextResponse.json(
      { message: "이전 비밀번호와 다른 비밀번호를 입력해 주세요." },
      { status: 400 }
    );
  }

  const { client, error } = getSupabasePasswordCheckClient();

  if (!client) {
    return NextResponse.json({ message: error }, { status: 500 });
  }

  const { error: signInError } = await client.auth.signInWithPassword({
    email: usernameToInternalEmail(auth.profile.username),
    password: currentPassword
  });

  if (signInError) {
    return NextResponse.json(
      { message: "이전 비밀번호가 올바르지 않습니다." },
      { status: 400 }
    );
  }

  await client.auth.signOut();

  const { error: updateError } = await auth.client.auth.admin.updateUserById(
    auth.profile.id,
    { password: newPassword }
  );

  if (updateError) {
    return NextResponse.json(
      { message: "비밀번호를 변경하지 못했습니다." },
      { status: 500 }
    );
  }

  return NextResponse.json({ message: "비밀번호가 변경되었습니다." });
}
