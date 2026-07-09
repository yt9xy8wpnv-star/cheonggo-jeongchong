import { NextResponse } from "next/server";
import {
  getPoliceBoardLabel,
  normalizePolicePage,
  normalizePolicePageSize,
  normalizePoliceTargetBoard
} from "@/lib/police";
import { getCommunityAuthorName, getProfilesByIds } from "@/lib/community";
import { requireApprovedUserFromRequest } from "@/lib/serverAuth";
import type { CommunityPost } from "@/lib/supabase/types";

export async function GET(request: Request) {
  const auth = await requireApprovedUserFromRequest(request);

  if (!auth.client || !auth.profile) {
    return NextResponse.json({ message: auth.error }, { status: auth.status });
  }

  const url = new URL(request.url);
  const q = (url.searchParams.get("q") ?? "").trim();
  const board = normalizePoliceTargetBoard(url.searchParams.get("board"));
  const page = normalizePolicePage(url.searchParams.get("page"));
  const pageSize = normalizePolicePageSize(url.searchParams.get("pageSize"));
  const allowedBoards = board === "all" ? ["free", "study", "qna"] : [board];

  const { data, error } = await auth.client
    .from("community_posts")
    .select("*")
    .eq("status", "published")
    .in("board_type", allowedBoards)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json(
      { message: "신고 대상 목록을 불러오지 못했습니다." },
      { status: 500 }
    );
  }

  const posts = (data ?? []) as CommunityPost[];
  const profiles = await getProfilesByIds(
    auth.client,
    posts.map((post) => post.user_id)
  );
  const normalizedQuery = q.toLocaleLowerCase("ko");
  const filteredPosts = normalizedQuery
    ? posts.filter((post) =>
        [post.title, getCommunityAuthorName(profiles, post.user_id)]
          .join(" ")
          .toLocaleLowerCase("ko")
          .includes(normalizedQuery)
      )
    : posts;
  const total = filteredPosts.length;
  const totalPages = Math.max(Math.ceil(total / pageSize), 1);
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * pageSize;
  const pagePosts = filteredPosts.slice(start, start + pageSize);

  return NextResponse.json({
    posts: pagePosts.map((post) => ({
      id: post.id,
      board_type: post.board_type,
      board_label: getPoliceBoardLabel(post.board_type),
      title: post.title,
      author_name: getCommunityAuthorName(profiles, post.user_id),
      created_at: post.created_at
    })),
    pagination: {
      page: safePage,
      page_size: pageSize,
      total,
      total_pages: totalPages
    },
    q,
    board
  });
}
