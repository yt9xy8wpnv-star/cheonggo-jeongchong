import { NextResponse } from "next/server";
import { studyBoardType, validateCommentInput } from "@/lib/community";
import { requireApprovedUserFromRequest } from "@/lib/serverAuth";
import type { CommunityPost } from "@/lib/supabase/types";

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
    .eq("board_type", studyBoardType)
    .eq("status", "published")
    .maybeSingle<CommunityPost>();

  if (postError || !post) {
    return NextResponse.json({ message: "게시글을 찾을 수 없습니다." }, { status: 404 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    content?: string;
  };
  const content = body.content ?? "";
  const validation = validateCommentInput(content);

  if (!validation.ok) {
    return NextResponse.json({ message: validation.message }, { status: 400 });
  }

  const { error } = await auth.client.from("community_comments").insert({
    post_id: post.id,
    user_id: auth.profile.id,
    content: content.trim()
  });

  if (error) {
    return NextResponse.json(
      { message: "댓글을 저장하지 못했습니다." },
      { status: 500 }
    );
  }

  return NextResponse.json({ message: "댓글을 등록했습니다." }, { status: 201 });
}
