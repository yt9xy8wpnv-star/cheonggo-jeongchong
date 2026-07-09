import { NextResponse } from "next/server";
import { qnaBoardType } from "@/lib/community";
import { requireApprovedUserFromRequest } from "@/lib/serverAuth";
import type {
  CommunityAnswer,
  CommunityPost,
  CommunityQuestion
} from "@/lib/supabase/types";

type RouteContext = {
  params: Promise<{ answerId: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  const auth = await requireApprovedUserFromRequest(request);

  if (!auth.client || !auth.profile) {
    return NextResponse.json({ message: auth.error }, { status: auth.status });
  }

  const { answerId } = await context.params;
  const { data: answer, error: answerError } = await auth.client
    .from("community_answers")
    .select("*")
    .eq("id", answerId)
    .eq("status", "published")
    .maybeSingle<CommunityAnswer>();

  if (answerError || !answer) {
    return NextResponse.json({ message: "답변을 찾을 수 없습니다." }, { status: 404 });
  }

  const [{ data: post }, { data: question }] = await Promise.all([
    auth.client
      .from("community_posts")
      .select("*")
      .eq("id", answer.post_id)
      .eq("board_type", qnaBoardType)
      .eq("status", "published")
      .maybeSingle<CommunityPost>(),
    auth.client
      .from("community_questions")
      .select("*")
      .eq("post_id", answer.post_id)
      .maybeSingle<CommunityQuestion>()
  ]);

  if (!post || !question) {
    return NextResponse.json({ message: "질문을 찾을 수 없습니다." }, { status: 404 });
  }

  if (post.user_id !== auth.profile.id) {
    return NextResponse.json({ message: "질문 작성자만 답변을 채택할 수 있습니다." }, { status: 403 });
  }

  await auth.client
    .from("community_answers")
    .update({ is_accepted: false })
    .eq("post_id", post.id);

  const { error: acceptError } = await auth.client
    .from("community_answers")
    .update({ is_accepted: true })
    .eq("id", answer.id);

  if (acceptError) {
    return NextResponse.json(
      { message: "답변을 채택하지 못했습니다." },
      { status: 500 }
    );
  }

  const { error: questionError } = await auth.client
    .from("community_questions")
    .update({
      accepted_answer_id: answer.id,
      question_status: "accepted"
    })
    .eq("id", question.id);

  if (questionError) {
    return NextResponse.json(
      { message: "질문 상태를 수정하지 못했습니다." },
      { status: 500 }
    );
  }

  return NextResponse.json({ message: "답변을 채택했습니다." });
}
