import { NextResponse } from "next/server";
import { getAnswerHelpfulCounts } from "@/lib/qnaServer";
import { requireApprovedUserFromRequest } from "@/lib/serverAuth";
import type { CommunityAnswer, CommunityReaction } from "@/lib/supabase/types";

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

  const { data: existingReaction } = await auth.client
    .from("community_reactions")
    .select("*")
    .eq("target_type", "answer")
    .eq("target_id", answer.id)
    .eq("user_id", auth.profile.id)
    .maybeSingle<CommunityReaction>();

  let myHelpful = true;

  if (existingReaction?.reaction_type === "helpful") {
    await auth.client
      .from("community_reactions")
      .delete()
      .eq("id", existingReaction.id);
    myHelpful = false;
  } else if (existingReaction) {
    await auth.client
      .from("community_reactions")
      .update({ reaction_type: "helpful" })
      .eq("id", existingReaction.id);
  } else {
    await auth.client.from("community_reactions").insert({
      target_type: "answer",
      target_id: answer.id,
      user_id: auth.profile.id,
      reaction_type: "helpful"
    });
  }

  const helpfulCounts = await getAnswerHelpfulCounts(auth.client, [answer.id]);

  return NextResponse.json({
    helpful_count: helpfulCounts.get(answer.id) ?? 0,
    my_helpful: myHelpful
  });
}
