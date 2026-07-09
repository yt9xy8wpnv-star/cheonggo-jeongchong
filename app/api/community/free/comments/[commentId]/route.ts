import { NextResponse } from "next/server";
import { canManageCommunityResource } from "@/lib/community";
import { requireApprovedUserFromRequest } from "@/lib/serverAuth";
import type { CommunityComment } from "@/lib/supabase/types";

type RouteContext = {
  params: Promise<{ commentId: string }>;
};

export async function DELETE(request: Request, context: RouteContext) {
  const auth = await requireApprovedUserFromRequest(request);

  if (!auth.client || !auth.profile) {
    return NextResponse.json({ message: auth.error }, { status: auth.status });
  }

  const { commentId } = await context.params;
  const { data: comment, error: commentError } = await auth.client
    .from("community_comments")
    .select("*")
    .eq("id", commentId)
    .neq("status", "deleted")
    .maybeSingle<CommunityComment>();

  if (commentError || !comment) {
    return NextResponse.json({ message: "댓글을 찾을 수 없습니다." }, { status: 404 });
  }

  if (!canManageCommunityResource(auth.profile, comment.user_id)) {
    return NextResponse.json({ message: "댓글을 삭제할 권한이 없습니다." }, { status: 403 });
  }

  const { error } = await auth.client
    .from("community_comments")
    .update({
      status: "deleted",
      deleted_at: new Date().toISOString()
    })
    .eq("id", comment.id);

  if (error) {
    return NextResponse.json(
      { message: "댓글을 삭제하지 못했습니다." },
      { status: 500 }
    );
  }

  return NextResponse.json({ message: "댓글을 삭제했습니다." });
}
