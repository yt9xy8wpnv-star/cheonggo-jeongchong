import { NextResponse } from "next/server";
import { requireApprovedAdminFromRequest } from "@/lib/serverAuth";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  const auth = await requireApprovedAdminFromRequest(request);

  if (!auth.client || !auth.profile) {
    return NextResponse.json({ message: auth.error }, { status: auth.status });
  }

  const { id } = await context.params;
  const { error } = await auth.client
    .from("profiles")
    .update({
      status: "rejected",
      rejected_at: new Date().toISOString()
    })
    .eq("id", id);

  if (error) {
    return NextResponse.json(
      { message: "회원 반려 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }

  return NextResponse.json({ message: "회원가입 신청을 반려했습니다." });
}
