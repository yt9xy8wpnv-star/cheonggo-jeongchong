import { NextResponse } from "next/server";
import {
  freeBoardType,
  getCommentCounts,
  getCommunityAuthorName,
  getImageCounts,
  getProfilesByIds,
  getReactionCounts,
  isAllowedImageFile,
  maxPostImageCount,
  normalizeCommunitySort,
  normalizePage,
  normalizePageSize,
  sortPostsWithCounts,
  toPostListItem,
  validatePostInput
} from "@/lib/community";
import { uploadPostImages } from "@/lib/communityUpload";
import { getOptionalProfileFromAuthHeader, requireApprovedUserFromRequest } from "@/lib/serverAuth";
import type { CommunityPost } from "@/lib/supabase/types";

export async function GET(request: Request) {
  const auth = await getOptionalProfileFromAuthHeader(request);

  if (!auth.client) {
    return NextResponse.json({ message: auth.error }, { status: auth.status });
  }

  const url = new URL(request.url);
  const q = (url.searchParams.get("q") ?? "").trim();
  const sort = normalizeCommunitySort(url.searchParams.get("sort"));
  const page = normalizePage(url.searchParams.get("page"));
  const pageSize = normalizePageSize(url.searchParams.get("pageSize"));

  let query = auth.client
    .from("community_posts")
    .select("*")
    .eq("board_type", freeBoardType)
    .eq("status", "published");

  if (q) {
    query = query.ilike("title", `%${q}%`);
  }

  const { data, error } = await query.order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json(
      { message: "게시글 목록을 불러오지 못했습니다." },
      { status: 500 }
    );
  }

  const posts = (data ?? []) as CommunityPost[];
  const postIds = posts.map((post) => post.id);

  const [profiles, reactionCounts, commentCounts, imageCounts] = await Promise.all([
    getProfilesByIds(
      auth.client,
      posts.map((post) => post.user_id)
    ),
    getReactionCounts(auth.client, postIds),
    getCommentCounts(auth.client, postIds),
    getImageCounts(auth.client, postIds)
  ]);

  const listItems = posts.map((post) =>
    toPostListItem({
      post,
      authorName: getCommunityAuthorName(profiles, post.user_id),
      commentCount: commentCounts.get(post.id) ?? 0,
      reactionCount: reactionCounts.get(post.id) ?? {
        like_count: 0,
        dislike_count: 0
      },
      imageCount: imageCounts.get(post.id) ?? 0
    })
  );

  const sortedPosts = sortPostsWithCounts(listItems, sort);
  const total = sortedPosts.length;
  const totalPages = Math.max(Math.ceil(total / pageSize), 1);
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * pageSize;

  return NextResponse.json({
    posts: sortedPosts.slice(start, start + pageSize),
    pagination: {
      page: safePage,
      page_size: pageSize,
      total,
      total_pages: totalPages
    },
    totalCount: total,
    page: safePage,
    pageSize,
    q,
    sort
  });
}

export async function POST(request: Request) {
  const auth = await requireApprovedUserFromRequest(request);

  if (!auth.client || !auth.profile) {
    return NextResponse.json({ message: auth.error }, { status: auth.status });
  }

  const formData = await request.formData();
  const title = String(formData.get("title") ?? "");
  const content = String(formData.get("content") ?? "");
  const files = formData
    .getAll("images")
    .filter((entry): entry is File => entry instanceof File && entry.size > 0);
  const validation = validatePostInput(title, content);

  if (!validation.ok) {
    return NextResponse.json({ message: validation.message }, { status: 400 });
  }

  if (files.length > maxPostImageCount) {
    return NextResponse.json(
      { message: `이미지는 최대 ${maxPostImageCount}개까지 첨부할 수 있습니다.` },
      { status: 400 }
    );
  }

  if (files.some((file) => !isAllowedImageFile(file))) {
    return NextResponse.json(
      { message: "이미지는 jpg, png, webp, gif 형식과 5MB 이하만 가능합니다." },
      { status: 400 }
    );
  }

  const { data: post, error } = await auth.client
    .from("community_posts")
    .insert({
      board_type: freeBoardType,
      user_id: auth.profile.id,
      title: title.trim(),
      content: content.trim()
    })
    .select("*")
    .single<CommunityPost>();

  if (error || !post) {
    return NextResponse.json(
      { message: "게시글을 저장하지 못했습니다." },
      { status: 500 }
    );
  }

  const uploadResult = await uploadPostImages({
    client: auth.client,
    files,
    postId: post.id,
    userId: auth.profile.id
  });

  if (!uploadResult.ok) {
    await auth.client.from("community_posts").delete().eq("id", post.id);

    return NextResponse.json(
      { message: uploadResult.message },
      { status: 500 }
    );
  }

  return NextResponse.json(
    { message: "게시글을 등록했습니다.", post_id: post.id },
    { status: 201 }
  );
}
