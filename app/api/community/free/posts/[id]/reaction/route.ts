import { NextResponse } from "next/server";
import { freeBoardType, getReactionCounts } from "@/lib/community";
import { requireApprovedUserFromRequest } from "@/lib/serverAuth";
import type {
  CommunityPost,
  CommunityReaction,
  CommunityReactionType
} from "@/lib/supabase/types";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function isReactionType(value: unknown): value is CommunityReactionType {
  return value === "like" || value === "dislike";
}

export async function POST(request: Request, context: RouteContext) {
  const auth = await requireApprovedUserFromRequest(request);

  if (!auth.client || !auth.profile) {
    return NextResponse.json({ message: auth.error }, { status: auth.status });
  }

  const { id } = await context.params;
  const body = (await request.json().catch(() => ({}))) as {
    reaction_type?: unknown;
  };

  if (!isReactionType(body.reaction_type)) {
    return NextResponse.json({ message: "반응 값을 확인해 주세요." }, { status: 400 });
  }

  const { data: post, error: postError } = await auth.client
    .from("community_posts")
    .select("*")
    .eq("id", id)
    .eq("board_type", freeBoardType)
    .eq("status", "published")
    .maybeSingle<CommunityPost>();

  if (postError || !post) {
    return NextResponse.json({ message: "게시글을 찾을 수 없습니다." }, { status: 404 });
  }

  const { data: existingReaction } = await auth.client
    .from("community_reactions")
    .select("*")
    .eq("target_type", "post")
    .eq("target_id", post.id)
    .eq("user_id", auth.profile.id)
    .maybeSingle<CommunityReaction>();

  let myReaction: CommunityReactionType | null = body.reaction_type;

  if (existingReaction?.reaction_type === body.reaction_type) {
    await auth.client
      .from("community_reactions")
      .delete()
      .eq("id", existingReaction.id);
    myReaction = null;
  } else if (existingReaction) {
    await auth.client
      .from("community_reactions")
      .update({ reaction_type: body.reaction_type })
      .eq("id", existingReaction.id);
  } else {
    await auth.client.from("community_reactions").insert({
      target_type: "post",
      target_id: post.id,
      user_id: auth.profile.id,
      reaction_type: body.reaction_type
    });
  }

  const reactionCounts = await getReactionCounts(auth.client, [post.id]);
  const counts = reactionCounts.get(post.id) ?? {
    like_count: 0,
    dislike_count: 0
  };

  return NextResponse.json({
    ...counts,
    my_reaction: myReaction
  });
}
