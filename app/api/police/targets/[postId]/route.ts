import { NextResponse } from "next/server";
import { getCommunityAuthorName, getProfilesByIds } from "@/lib/community";
import { getPoliceBoardLabel } from "@/lib/police";
import { requireApprovedUserFromRequest } from "@/lib/serverAuth";
import type {
  CommunityAnswer,
  CommunityComment,
  CommunityPost
} from "@/lib/supabase/types";

type RouteContext = {
  params: Promise<{ postId: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  const auth = await requireApprovedUserFromRequest(request);

  if (!auth.client || !auth.profile) {
    return NextResponse.json({ message: auth.error }, { status: auth.status });
  }

  const { postId } = await context.params;
  const { data: post, error: postError } = await auth.client
    .from("community_posts")
    .select("*")
    .eq("id", postId)
    .in("board_type", ["free", "study", "qna"])
    .eq("status", "published")
    .maybeSingle<CommunityPost>();

  if (postError || !post) {
    return NextResponse.json({ message: "신고 대상을 찾을 수 없습니다." }, { status: 404 });
  }

  const [{ data: comments }, { data: answers }] = await Promise.all([
    post.board_type === "free" || post.board_type === "study"
      ? auth.client
          .from("community_comments")
          .select("*")
          .eq("post_id", post.id)
          .eq("status", "published")
          .order("created_at", { ascending: true })
      : Promise.resolve({ data: [] }),
    post.board_type === "qna"
      ? auth.client
          .from("community_answers")
          .select("*")
          .eq("post_id", post.id)
          .eq("status", "published")
          .order("created_at", { ascending: true })
      : Promise.resolve({ data: [] })
  ]);
  const publishedComments = (comments ?? []) as CommunityComment[];
  const publishedAnswers = (answers ?? []) as CommunityAnswer[];
  const profiles = await getProfilesByIds(auth.client, [
    post.user_id,
    ...publishedComments.map((comment) => comment.user_id),
    ...publishedAnswers.map((answer) => answer.user_id)
  ]);

  return NextResponse.json({
    post: {
      id: post.id,
      board_type: post.board_type,
      board_label: getPoliceBoardLabel(post.board_type),
      title: post.title,
      author_name: getCommunityAuthorName(profiles, post.user_id),
      created_at: post.created_at
    },
    comments: publishedComments.map((comment) => ({
      id: comment.id,
      target_type: "comment",
      author_name: getCommunityAuthorName(profiles, comment.user_id),
      content: comment.content,
      created_at: comment.created_at
    })),
    answers: publishedAnswers.map((answer) => ({
      id: answer.id,
      target_type: "answer",
      author_name: getCommunityAuthorName(profiles, answer.user_id),
      content: answer.content,
      created_at: answer.created_at
    }))
  });
}
