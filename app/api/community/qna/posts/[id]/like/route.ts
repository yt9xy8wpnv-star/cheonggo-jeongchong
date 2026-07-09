import { NextResponse } from "next/server";
import { qnaBoardType } from "@/lib/community";
import { getQnaLikeCounts } from "@/lib/qnaServer";
import { requireApprovedUserFromRequest } from "@/lib/serverAuth";
import type { CommunityPost, CommunityReaction } from "@/lib/supabase/types";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  const auth = await requireApprovedUserFromRequest(request);

  if (!auth.client || !auth.profile) {
    return NextResponse.json({ message: auth.error }, { status: auth.status });
  }

  const { id } = await context.params;
  const { data: post, error: postError } = await auth.client
    .from("community_posts")
    .select("*")
    .eq("id", id)
    .eq("board_type", qnaBoardType)
    .eq("status", "published")
    .maybeSingle<CommunityPost>();

  if (postError || !post) {
    return NextResponse.json({ message: "질문을 찾을 수 없습니다." }, { status: 404 });
  }

  const { data: existingReaction } = await auth.client
    .from("community_reactions")
    .select("*")
    .eq("target_type", "post")
    .eq("target_id", post.id)
    .eq("user_id", auth.profile.id)
    .maybeSingle<CommunityReaction>();

  let myLike = true;

  if (existingReaction?.reaction_type === "like") {
    await auth.client
      .from("community_reactions")
      .delete()
      .eq("id", existingReaction.id);
    myLike = false;
  } else if (existingReaction) {
    await auth.client
      .from("community_reactions")
      .update({ reaction_type: "like" })
      .eq("id", existingReaction.id);
  } else {
    await auth.client.from("community_reactions").insert({
      target_type: "post",
      target_id: post.id,
      user_id: auth.profile.id,
      reaction_type: "like"
    });
  }

  const likeCounts = await getQnaLikeCounts(auth.client, [post.id]);

  return NextResponse.json({
    like_count: likeCounts.get(post.id) ?? 0,
    my_like: myLike
  });
}
