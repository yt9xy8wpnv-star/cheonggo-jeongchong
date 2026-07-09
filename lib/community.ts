import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  CommunityComment,
  CommunityPost,
  CommunityPostImage,
  CommunityReaction,
  CommunityReactionType,
  Profile
} from "@/lib/supabase/types";

export const freeBoardType = "free";
export const communityImageBucket = "community-images";
export const maxPostImageCount = 5;
export const maxPostImageSize = 5 * 1024 * 1024;
export const allowedPostImageTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif"
];

export const communitySortOptions = [
  { value: "latest", label: "최신순" },
  { value: "popular", label: "인기순" },
  { value: "comments", label: "댓글 많은 순" },
  { value: "views", label: "조회수 순" },
  { value: "likes", label: "좋아요 순" }
] as const;

export type CommunitySort = (typeof communitySortOptions)[number]["value"];

export type CommunityPostListItem = {
  id: string;
  title: string;
  author_name: string;
  created_at: string;
  updated_at: string;
  view_count: number;
  comment_count: number;
  like_count: number;
  dislike_count: number;
  image_count: number;
  is_pinned: boolean;
};

export type CommunityPagination = {
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
};

export type CommunityCommentView = {
  id: string;
  content: string;
  author_name: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  can_delete: boolean;
};

export type CommunityPostDetail = {
  id: string;
  title: string;
  content: string;
  author_name: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  view_count: number;
  comment_count: number;
  like_count: number;
  dislike_count: number;
  my_reaction: CommunityReactionType | null;
  can_edit: boolean;
  can_delete: boolean;
  images: CommunityPostImage[];
  comments: CommunityCommentView[];
};

export type CommunityPostsResponse = {
  posts: CommunityPostListItem[];
  pagination: CommunityPagination;
  totalCount: number;
  page: number;
  pageSize: number;
  q: string;
  sort: CommunitySort;
};

export type CommunityPostDetailResponse = {
  post: CommunityPostDetail;
};

export type CommunityReactionResponse = {
  like_count: number;
  dislike_count: number;
  my_reaction: CommunityReactionType | null;
};

export function normalizeCommunitySort(value: string | null): CommunitySort {
  return communitySortOptions.some((option) => option.value === value)
    ? (value as CommunitySort)
    : "latest";
}

export function normalizePage(value: string | null) {
  const page = Number(value);
  return Number.isInteger(page) && page > 0 ? page : 1;
}

export function normalizePageSize(value: string | null) {
  const pageSize = Number(value);

  if (!Number.isInteger(pageSize)) {
    return 10;
  }

  return Math.min(Math.max(pageSize, 1), 20);
}

export function validatePostInput(title: string, content: string) {
  const trimmedTitle = title.trim();
  const trimmedContent = content.trim();

  if (trimmedTitle.length < 2 || trimmedTitle.length > 200) {
    return {
      ok: false,
      message: "제목은 2자 이상 200자 이하로 입력해 주세요."
    };
  }

  if (trimmedContent.length < 2 || trimmedContent.length > 5000) {
    return {
      ok: false,
      message: "본문은 2자 이상 5000자 이하로 입력해 주세요."
    };
  }

  return { ok: true, message: "" };
}

export function validateCommentInput(content: string) {
  const trimmedContent = content.trim();

  if (trimmedContent.length < 1 || trimmedContent.length > 2000) {
    return {
      ok: false,
      message: "댓글은 1자 이상 2000자 이하로 입력해 주세요."
    };
  }

  return { ok: true, message: "" };
}

export function isAllowedImageFile(file: File) {
  return (
    allowedPostImageTypes.includes(file.type) && file.size <= maxPostImageSize
  );
}

export function getCommunityAuthorName(
  profiles: Profile[],
  userId: string,
  fallback = "청고정총 회원"
) {
  return profiles.find((profile) => profile.id === userId)?.name ?? fallback;
}

export function canManageCommunityResource(
  profile: Profile | null,
  ownerId: string
) {
  return Boolean(
    profile &&
      profile.status === "approved" &&
      (profile.id === ownerId || profile.role === "admin")
  );
}

export async function getReactionCounts(
  client: SupabaseClient,
  targetIds: string[],
  targetType = "post"
) {
  if (targetIds.length === 0) {
    return new Map<string, { like_count: number; dislike_count: number }>();
  }

  const { data } = await client
    .from("community_reactions")
    .select("*")
    .eq("target_type", targetType)
    .in("target_id", targetIds);

  const counts = new Map<string, { like_count: number; dislike_count: number }>();

  targetIds.forEach((id) => {
    counts.set(id, { like_count: 0, dislike_count: 0 });
  });

  ((data ?? []) as CommunityReaction[]).forEach((reaction) => {
    const current = counts.get(reaction.target_id) ?? {
      like_count: 0,
      dislike_count: 0
    };

    if (reaction.reaction_type === "like") {
      current.like_count += 1;
    } else {
      current.dislike_count += 1;
    }

    counts.set(reaction.target_id, current);
  });

  return counts;
}

export async function getCommentCounts(client: SupabaseClient, postIds: string[]) {
  if (postIds.length === 0) {
    return new Map<string, number>();
  }

  const { data } = await client
    .from("community_comments")
    .select("post_id")
    .eq("status", "published")
    .in("post_id", postIds);

  const counts = new Map<string, number>();

  postIds.forEach((id) => counts.set(id, 0));

  ((data ?? []) as Pick<CommunityComment, "post_id">[]).forEach((comment) => {
    counts.set(comment.post_id, (counts.get(comment.post_id) ?? 0) + 1);
  });

  return counts;
}

export async function getImageCounts(client: SupabaseClient, postIds: string[]) {
  if (postIds.length === 0) {
    return new Map<string, number>();
  }

  const { data } = await client
    .from("community_post_images")
    .select("post_id")
    .in("post_id", postIds);

  const counts = new Map<string, number>();

  postIds.forEach((id) => counts.set(id, 0));

  ((data ?? []) as Pick<CommunityPostImage, "post_id">[]).forEach((image) => {
    counts.set(image.post_id, (counts.get(image.post_id) ?? 0) + 1);
  });

  return counts;
}

export async function getProfilesByIds(client: SupabaseClient, userIds: string[]) {
  const uniqueIds = Array.from(new Set(userIds));

  if (uniqueIds.length === 0) {
    return [];
  }

  const { data } = await client
    .from("profiles")
    .select("*")
    .in("id", uniqueIds);

  return (data ?? []) as Profile[];
}

export function sortPostsWithCounts(
  posts: CommunityPostListItem[],
  sort: CommunitySort
) {
  const byDate = (a: CommunityPostListItem, b: CommunityPostListItem) =>
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime();

  return [...posts].sort((a, b) => {
    if (a.is_pinned !== b.is_pinned) {
      return a.is_pinned ? -1 : 1;
    }

    if (sort === "comments") {
      return b.comment_count - a.comment_count || byDate(a, b);
    }

    if (sort === "views") {
      return b.view_count - a.view_count || byDate(a, b);
    }

    if (sort === "likes") {
      return b.like_count - a.like_count || byDate(a, b);
    }

    if (sort === "popular") {
      const popularA = a.like_count * 3 + a.comment_count * 2 + a.view_count;
      const popularB = b.like_count * 3 + b.comment_count * 2 + b.view_count;
      return popularB - popularA || byDate(a, b);
    }

    return byDate(a, b);
  });
}

export function toPostListItem({
  post,
  authorName,
  commentCount,
  reactionCount,
  imageCount
}: {
  post: CommunityPost;
  authorName: string;
  commentCount: number;
  reactionCount: { like_count: number; dislike_count: number };
  imageCount: number;
}): CommunityPostListItem {
  return {
    id: post.id,
    title: post.title,
    author_name: authorName,
    created_at: post.created_at,
    updated_at: post.updated_at,
    view_count: post.view_count,
    comment_count: commentCount,
    like_count: reactionCount.like_count,
    dislike_count: reactionCount.dislike_count,
    image_count: imageCount,
    is_pinned: post.is_pinned
  };
}
