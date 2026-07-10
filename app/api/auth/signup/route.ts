import { NextResponse } from "next/server";
import { normalizeUsername, usernameToInternalEmail } from "@/lib/auth";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  englishSubjects,
  inquirySubjects,
  koreanSubjects,
  mathSubjects,
  secondLanguageSubjects
} from "@/lib/subjects";
import { validateSubjectPreferences } from "@/lib/subjectValidation";
import type { SubjectPreferenceInput } from "@/lib/supabase/types";

const usernamePattern = /^[a-z0-9_]{2,32}$/;

type SignupBody = {
  username?: string;
  password?: string;
  name?: string;
  grade?: number;
  class_number?: number;
  student_number?: number;
  subjects?: SubjectPreferenceInput;
};

function isIntegerInRange(value: unknown, min: number, max: number) {
  return Number.isInteger(value) && Number(value) >= min && Number(value) <= max;
}

function isValidSubjects(subjects: SubjectPreferenceInput) {
  return (
    koreanSubjects.includes(subjects.korean_subject) &&
    mathSubjects.includes(subjects.math_subject) &&
    englishSubjects.includes(subjects.english_subject) &&
    subjects.history_subject === "응시" &&
    inquirySubjects.includes(subjects.inquiry_subject_1) &&
    inquirySubjects.includes(subjects.inquiry_subject_2) &&
    secondLanguageSubjects.includes(subjects.second_language_subject) &&
    validateSubjectPreferences(subjects).isValid
  );
}

export async function POST(request: Request) {
  const body = (await request.json()) as SignupBody;
  const username = normalizeUsername(body.username ?? "");
  const password = body.password ?? "";
  const name = body.name?.trim() ?? "";
  const subjects = body.subjects;

  if (!name || !username || !password || !subjects) {
    return NextResponse.json(
      { message: "필수 입력값을 모두 입력해 주세요." },
      { status: 400 }
    );
  }

  if (!usernamePattern.test(username)) {
    return NextResponse.json(
      { message: "아이디는 영문 소문자, 숫자, 밑줄을 사용해 2~32자로 입력해 주세요." },
      { status: 400 }
    );
  }

  if (password.length < 6) {
    return NextResponse.json(
      { message: "비밀번호는 6자 이상이어야 합니다." },
      { status: 400 }
    );
  }

  if (
    !isIntegerInRange(body.grade, 1, 3) ||
    !isIntegerInRange(body.class_number, 1, 20) ||
    !isIntegerInRange(body.student_number, 1, 40)
  ) {
    return NextResponse.json(
      { message: "학년, 반, 번호 범위를 확인해 주세요." },
      { status: 400 }
    );
  }

  if (!isValidSubjects(subjects)) {
    return NextResponse.json(
      { message: "선택과목 입력값을 확인해 주세요." },
      { status: 400 }
    );
  }

  const { client, error } = getSupabaseAdminClient();

  if (!client) {
    return NextResponse.json({ message: error }, { status: 500 });
  }

  const { data: existing } = await client
    .from("profiles")
    .select("id")
    .eq("username", username)
    .maybeSingle();

  if (existing) {
    return NextResponse.json(
      { message: "이미 사용 중인 아이디입니다." },
      { status: 409 }
    );
  }

  const { data: authData, error: authError } = await client.auth.admin.createUser({
    email: usernameToInternalEmail(username),
    password,
    email_confirm: true,
    user_metadata: {
      username,
      name
    }
  });

  const user = authData.user;

  if (authError || !user) {
    return NextResponse.json(
      { message: authError?.message ?? "회원가입 계정 생성 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }

  const { error: profileError } = await client.from("profiles").insert({
    id: user.id,
    username,
    name,
    grade: body.grade,
    class_number: body.class_number,
    student_number: body.student_number,
    role: "user",
    status: "pending"
  });

  if (profileError) {
    await client.auth.admin.deleteUser(user.id);
    return NextResponse.json(
      { message: "회원 프로필 저장 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }

  const { error: subjectsError } = await client.from("subject_preferences").insert({
    profile_id: user.id,
    ...subjects,
    history_subject: "응시"
  });

  if (subjectsError) {
    await client.from("profiles").delete().eq("id", user.id);
    await client.auth.admin.deleteUser(user.id);
    return NextResponse.json(
      { message: "선택과목 저장 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    message: "회원가입 신청이 완료되었습니다. 관리자 승인 후 로그인할 수 있습니다."
  });
}
