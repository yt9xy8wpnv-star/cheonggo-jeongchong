import { NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  canManageCommunityResource,
  communityImageBucket,
  getCommunityAuthorName,
  getProfilesByIds,
  getReactionCounts,
  isAllowedImageFile,
  maxPostImageCount,
  studyBoardType,
  validateStudyPostInput
} from "@/lib/community";
import { getOptionalProfileFromAuthHeader, requireApprovedUserFromRequest } from "@/lib/serverAuth";
import type {
  CommunityComment,
  CommunityPost,
  CommunityPostImage,
  CommunityReaction,
  CommunityStudyCertification,
  Profile
} from "@/lib/supabase/types";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function getUploadFileExtension(file: File) {
  const fallbackByType: Record<string, string> = {
    "image/gif": "gif",
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp"
  };
  const extension = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "");

  return extension || fallbackByType[file.type] || "png";
}

function parseDeleteImageIds(formData: FormData) {
  const rawJsonValue = formData.get("deleteImageIds");
  const repeatedValues = formData
    .getAll("deleteImageIds[]")
    .filter((value): value is string => typeof value === "string");

  if (typeof rawJsonValue !== "string") {
    return repeatedValues;
  }

  try {
    const parsed = JSON.parse(rawJsonValue);

    if (Array.isArray(parsed)) {
      return [
        ...repeatedValues,
        ...parsed.filter((value): value is string => typeof value === "string")
      ];
    }
  } catch {
    return repeatedValues;
  }

  return repeatedValues;
}

async function uploadPostImages({
  client,
  files,
  postId,
  userId,
  startOrderIndex
}: {
  client: SupabaseClient;
  files: File[];
  postId: string;
  userId: string;
  startOrderIndex: number;
}) {
  const uploadedImages: Array<Omit<CommunityPostImage, "id" | "created_at">> = [];
  const uploadedPaths: string[] = [];

  for (let index = 0; index < files.length; index += 1) {
    const file = files[index];
    const extension = getUploadFileExtension(file);
    const storagePath = `${userId}/${postId}/${Date.now()}-${index}.${extension}`;
    const { error: uploadError } = await client.storage
      .from(communityImageBucket)
      .upload(storagePath, await file.arrayBuffer(), {
        contentType: file.type,
        upsert: false
      });

    if (uploadError) {
      if (uploadedPaths.length > 0) {
        await client.storage.from(communityImageBucket).remove(uploadedPaths);
      }

      return {
        ok: false as const,
        message:
          "이미지 업로드에 실패했습니다. Supabase Storage의 community-images 버킷을 확인해 주세요."
      };
    }

    const {
      data: { publicUrl }
    } = client.storage.from(communityImageBucket).getPublicUrl(storagePath);

    uploadedPaths.push(storagePath);
    uploadedImages.push({
      post_id: postId,
      image_url: publicUrl,
      storage_path: storagePath,
      order_index: startOrderIndex + index
    });
  }

  if (uploadedImages.length === 0) {
    return { ok: true as const };
  }

  const { error: imageInsertError } = await client
    .from("community_post_images")
    .insert(uploadedImages);

  if (imageInsertError) {
    await client.storage.from(communityImageBucket).remove(uploadedPaths);

    return {
      ok: false as const,
      message: "이미지 정보를 저장하지 못했습니다."
    };
  }

  return { ok: true as const };
}

async function getStudyPost(client: SupabaseClient, id: string) {
  const { data, error } = await client
    .from("community_posts")
    .select("*")
    .eq("id", id)
    .eq("board_type", studyBoardType)
    .maybeSingle<CommunityPost>();

  if (error || !data || data.status === "deleted") {
    return null;
  }

  return data;
}

async function buildStudyPostDetail({
  client,
  post,
  profile,
  viewCount
}: {
  client: SupabaseClient;
  post: CommunityPost;
  profile: Profile | null;
  viewCount: number;
}) {
  const [
    { data: images },
    { data: comments },
    { data: certification },
    reactionCounts
  ] = await Promise.all([
    client
      .from("community_post_images")
      .select("*")
      .eq("post_id", post.id)
      .order("order_index", { ascending: true }),
    client
      .from("community_comments")
      .select("*")
      .eq("post_id", post.id)
      .eq("status", "published")
      .order("created_at", { ascending: true }),
    client
      .from("community_study_certifications")
      .select("*")
      .eq("post_id", post.id)
      .maybeSingle<CommunityStudyCertification>(),
    getReactionCounts(client, [post.id])
  ]);

  const publishedComments = (comments ?? []) as CommunityComment[];
  const profiles = await getProfilesByIds(client, [
    post.user_id,
    ...publishedComments.map((comment) => comment.user_id)
  ]);
  let myReaction: CommunityReaction | null = null;

  if (profile) {
    const { data } = await client
      .from("community_reactions")
      .select("*")
      .eq("target_type", "post")
      .eq("target_id", post.id)
      .eq("user_id", profile.id)
      .maybeSingle<CommunityReaction>();

    myReaction = data ?? null;
  }

  const counts = reactionCounts.get(post.id) ?? {
    like_count: 0,
    dislike_count: 0
  };

  return {
    id: post.id,
    title: post.title,
    content: post.content,
    author_name: getCommunityAuthorName(profiles, post.user_id),
    user_id: post.user_id,
    created_at: post.created_at,
    updated_at: post.updated_at,
    view_count: viewCount,
    comment_count: publishedComments.length,
    like_count: counts.like_count,
    dislike_count: counts.dislike_count,
    my_reaction: myReaction?.reaction_type ?? null,
    can_edit: canManageCommunityResource(profile, post.user_id),
    can_delete: canManageCommunityResource(profile, post.user_id),
    images: (images ?? []) as CommunityPostImage[],
    certification: certification ?? null,
    comments: publishedComments.map((comment) => ({
      id: comment.id,
      content: comment.content,
      author_name: getCommunityAuthorName(profiles, comment.user_id),
      user_id: comment.user_id,
      created_at: comment.created_at,
      updated_at: comment.updated_at,
      can_delete: canManageCommunityResource(profile, comment.user_id)
    }))
  };
}

export async function GET(request: Request, context: RouteContext) {
  const auth = await getOptionalProfileFromAuthHeader(request);

  if (!auth.client) {
    return NextResponse.json({ message: auth.error }, { status: auth.status });
  }

  const { id } = await context.params;
  const post = await getStudyPost(auth.client, id);

  if (
    !post ||
    (post.status !== "published" &&
      !canManageCommunityResource(auth.profile, post.user_id))
  ) {
    return NextResponse.json({ message: "게시글을 찾을 수 없습니다." }, { status: 404 });
  }

  const viewCount = post.status === "published" ? post.view_count + 1 : post.view_count;

  if (post.status === "published") {
    await auth.client
      .from("community_posts")
      .update({ view_count: viewCount })
      .eq("id", post.id);
  }

  const detail = await buildStudyPostDetail({
    client: auth.client,
    post,
    profile: auth.profile,
    viewCount
  });

  return NextResponse.json({ post: detail });
}

export async function PATCH(request: Request, context: RouteContext) {
  const auth = await requireApprovedUserFromRequest(request);

  if (!auth.client || !auth.profile) {
    return NextResponse.json({ message: auth.error }, { status: auth.status });
  }

  const { id } = await context.params;
  const post = await getStudyPost(auth.client, id);

  if (!post) {
    return NextResponse.json({ message: "게시글을 찾을 수 없습니다." }, { status: 404 });
  }

  if (!canManageCommunityResource(auth.profile, post.user_id)) {
    return NextResponse.json({ message: "게시글을 수정할 권한이 없습니다." }, { status: 403 });
  }

  const formData = await request.formData();
  const title = String(formData.get("title") ?? "");
  const content = String(formData.get("content") ?? "");
  const files = formData
    .getAll("images")
    .filter((entry): entry is File => entry instanceof File && entry.size > 0);
  const deleteImageIds = new Set(parseDeleteImageIds(formData));
  const validation = validateStudyPostInput(title, content);

  if (!validation.ok) {
    return NextResponse.json({ message: validation.message }, { status: 400 });
  }

  if (files.some((file) => !isAllowedImageFile(file))) {
    return NextResponse.json(
      { message: "이미지는 jpg, png, webp, gif 형식과 5MB 이하만 가능합니다." },
      { status: 400 }
    );
  }

  const { data: existingImages } = await auth.client
    .from("community_post_images")
    .select("*")
    .eq("post_id", post.id)
    .order("order_index", { ascending: true });
  const images = (existingImages ?? []) as CommunityPostImage[];
  const imagesToDelete = images.filter((image) => deleteImageIds.has(image.id));
  const nextImageCount = images.length - imagesToDelete.length + files.length;

  if (nextImageCount > maxPostImageCount) {
    return NextResponse.json(
      { message: `이미지는 최대 ${maxPostImageCount}개까지 첨부할 수 있습니다.` },
      { status: 400 }
    );
  }

  const { error: updateError } = await auth.client
    .from("community_posts")
    .update({
      title: title.trim(),
      content: content.trim()
    })
    .eq("id", post.id);

  if (updateError) {
    return NextResponse.json(
      { message: "게시글을 수정하지 못했습니다." },
      { status: 500 }
    );
  }

  if (imagesToDelete.length > 0) {
    await auth.client.storage
      .from(communityImageBucket)
      .remove(imagesToDelete.map((image) => image.storage_path));
    await auth.client
      .from("community_post_images")
      .delete()
      .in(
        "id",
        imagesToDelete.map((image) => image.id)
      );
  }

  const uploadResult = await uploadPostImages({
    client: auth.client,
    files,
    postId: post.id,
    userId: auth.profile.id,
    startOrderIndex: images.length - imagesToDelete.length
  });

  if (!uploadResult.ok) {
    return NextResponse.json(
      { message: uploadResult.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ message: "게시글을 수정했습니다.", post_id: post.id });
}

export async function DELETE(request: Request, context: RouteContext) {
  const auth = await requireApprovedUserFromRequest(request);

  if (!auth.client || !auth.profile) {
    return NextResponse.json({ message: auth.error }, { status: auth.status });
  }

  const { id } = await context.params;
  const post = await getStudyPost(auth.client, id);

  if (!post) {
    return NextResponse.json({ message: "게시글을 찾을 수 없습니다." }, { status: 404 });
  }

  if (!canManageCommunityResource(auth.profile, post.user_id)) {
    return NextResponse.json({ message: "게시글을 삭제할 권한이 없습니다." }, { status: 403 });
  }

  const { error } = await auth.client
    .from("community_posts")
    .update({
      status: "deleted",
      deleted_at: new Date().toISOString()
    })
    .eq("id", post.id);

  if (error) {
    return NextResponse.json(
      { message: "게시글을 삭제하지 못했습니다." },
      { status: 500 }
    );
  }

  return NextResponse.json({ message: "게시글을 삭제했습니다." });
}
