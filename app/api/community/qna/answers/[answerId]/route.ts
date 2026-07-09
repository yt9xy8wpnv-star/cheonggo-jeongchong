import { NextResponse } from "next/server";
import { canManageCommunityResource } from "@/lib/community";
import { recalculateQuestionStatus } from "@/lib/qnaServer";
import { requireApprovedUserFromRequest } from "@/lib/serverAuth";
import type { CommunityAnswer } from "@/lib/supabase/types";

type RouteContext = {
  params: Promise<{ answerId: string }>;
};

export async function DELETE(request: Request, context: RouteContext) {
  const auth = await requireApprovedUserFromRequest(request);

  if (!auth.client || !auth.profile) {
    return NextResponse.json({ message: auth.error }, { status: auth.status });
  }

  const { answerId } = await context.params;
  const { data: answer, error: answerError } = await auth.client
    .from("community_answers")
    .select("*")
    .eq("id", answerId)
    .neq("status", "deleted")
    .maybeSingle<CommunityAnswer>();

  if (answerError || !answer) {
    return NextResponse.json({ message: "답변을 찾을 수 없습니다." }, { status: 404 });
  }

  if (!canManageCommunityResource(auth.profile, answer.user_id)) {
    return NextResponse.json({ message: "답변을 삭제할 권한이 없습니다." }, { status: 403 });
  }

  const { error } = await auth.client
    .from("community_answers")
    .update({
      status: "deleted",
      is_accepted: false,
      deleted_at: new Date().toISOString()
    })
    .eq("id", answer.id);

  if (error) {
    return NextResponse.json(
      { message: "답변을 삭제하지 못했습니다." },
      { status: 500 }
    );
  }

  if (answer.is_accepted) {
    await auth.client
      .from("community_questions")
      .update({ accepted_answer_id: null })
      .eq("post_id", answer.post_id)
      .eq("accepted_answer_id", answer.id);
  }

  await recalculateQuestionStatus(auth.client, answer.post_id);

  return NextResponse.json({ message: "답변을 삭제했습니다." });
}
