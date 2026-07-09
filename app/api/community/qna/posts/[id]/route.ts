import { NextResponse } from "next/server";
import {
  canManageCommunityResource,
  communityImageBucket,
  getCommunityAuthorName,
  getProfilesByIds,
  isAllowedImageFile,
  maxPostImageCount,
  qnaBoardType,
  validateQnaQuestionInput
} from "@/lib/community";
import { uploadPostImages } from "@/lib/communityUpload";
import { isQnaSubjectArea, isValidQnaSubject } from "@/lib/qnaSubjects";
import {
  getAnswerHelpfulCounts,
  getMyHelpfulAnswerIds,
  getQnaLikeCounts
} from "@/lib/qnaServer";
import { getOptionalProfileFromAuthHeader, requireApprovedUserFromRequest } from "@/lib/serverAuth";
import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  CommunityAnswer,
  CommunityAnswerImage,
  CommunityPost,
  CommunityPostImage,
  CommunityQuestion,
  CommunityReaction,
  Profile
} from "@/lib/supabase/types";

type RouteContext = {
  params: Promise<{ id: string }>;
};

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

async function getQnaPost(client: SupabaseClient, id: string) {
  const { data, error } = await client
    .from("community_posts")
    .select("*")
    .eq("id", id)
    .eq("board_type", qnaBoardType)
    .maybeSingle<CommunityPost>();

  if (error || !data || data.status === "deleted") {
    return null;
  }

  return data;
}

async function buildQnaDetail({
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
    { data: question },
    { data: images },
    { data: answers },
    likeCounts
  ] = await Promise.all([
    client
      .from("community_questions")
      .select("*")
      .eq("post_id", post.id)
      .maybeSingle<CommunityQuestion>(),
    client
      .from("community_post_images")
      .select("*")
      .eq("post_id", post.id)
      .order("order_index", { ascending: true }),
    client
      .from("community_answers")
      .select("*")
      .eq("post_id", post.id)
      .eq("status", "published")
      .order("created_at", { ascending: true }),
    getQnaLikeCounts(client, [post.id])
  ]);
  const publishedAnswers = ((answers ?? []) as CommunityAnswer[]).sort((a, b) => {
    if (a.is_accepted !== b.is_accepted) {
      return a.is_accepted ? -1 : 1;
    }

    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
  });
  const answerIds = publishedAnswers.map((answer) => answer.id);
  const [{ data: answerImages }, helpfulCounts, myHelpfulAnswerIds, profiles] =
    await Promise.all([
      answerIds.length > 0
        ? client
            .from("community_answer_images")
            .select("*")
            .in("answer_id", answerIds)
            .order("order_index", { ascending: true })
        : Promise.resolve({ data: [] }),
      getAnswerHelpfulCounts(client, answerIds),
      getMyHelpfulAnswerIds(client, answerIds, profile?.id ?? null),
      getProfilesByIds(client, [
        post.user_id,
        ...publishedAnswers.map((answer) => answer.user_id)
      ])
    ]);
  let myLike: CommunityReaction | null = null;

  if (profile) {
    const { data } = await client
      .from("community_reactions")
      .select("*")
      .eq("target_type", "post")
      .eq("target_id", post.id)
      .eq("reaction_type", "like")
      .eq("user_id", profile.id)
      .maybeSingle<CommunityReaction>();

    myLike = data ?? null;
  }

  const imagesByAnswerId = new Map<string, CommunityAnswerImage[]>();
  ((answerImages ?? []) as CommunityAnswerImage[]).forEach((image) => {
    imagesByAnswerId.set(image.answer_id, [
      ...(imagesByAnswerId.get(image.answer_id) ?? []),
      image
    ]);
  });

  return {
    id: post.id,
    title: post.title,
    content: post.content,
    author_name: getCommunityAuthorName(profiles, post.user_id),
    user_id: post.user_id,
    created_at: post.created_at,
    updated_at: post.updated_at,
    view_count: viewCount,
    answer_count: publishedAnswers.length,
    helpful_count: Array.from(helpfulCounts.values()).reduce(
      (sum, count) => sum + count,
      0
    ),
    like_count: likeCounts.get(post.id) ?? 0,
    can_edit: canManageCommunityResource(profile, post.user_id),
    can_delete: canManageCommunityResource(profile, post.user_id),
    can_accept_answer: Boolean(profile && profile.id === post.user_id),
    images: (images ?? []) as CommunityPostImage[],
    question: question ?? null,
    my_like: Boolean(myLike),
    answers: publishedAnswers.map((answer) => ({
      id: answer.id,
      post_id: answer.post_id,
      user_id: answer.user_id,
      content: answer.content,
      author_name: getCommunityAuthorName(profiles, answer.user_id),
      created_at: answer.created_at,
      updated_at: answer.updated_at,
      is_accepted: answer.is_accepted,
      helpful_count: helpfulCounts.get(answer.id) ?? 0,
      my_helpful: myHelpfulAnswerIds.has(answer.id),
      can_delete: canManageCommunityResource(profile, answer.user_id),
      images: imagesByAnswerId.get(answer.id) ?? []
    }))
  };
}

export async function GET(request: Request, context: RouteContext) {
  const auth = await getOptionalProfileFromAuthHeader(request);

  if (!auth.client) {
    return NextResponse.json({ message: auth.error }, { status: auth.status });
  }

  const { id } = await context.params;
  const post = await getQnaPost(auth.client, id);

  if (
    !post ||
    (post.status !== "published" &&
      !canManageCommunityResource(auth.profile, post.user_id))
  ) {
    return NextResponse.json({ message: "질문을 찾을 수 없습니다." }, { status: 404 });
  }

  const viewCount = post.status === "published" ? post.view_count + 1 : post.view_count;

  if (post.status === "published") {
    await auth.client
      .from("community_posts")
      .update({ view_count: viewCount })
      .eq("id", post.id);
  }

  const detail = await buildQnaDetail({
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
  const post = await getQnaPost(auth.client, id);

  if (!post) {
    return NextResponse.json({ message: "질문을 찾을 수 없습니다." }, { status: 404 });
  }

  if (!canManageCommunityResource(auth.profile, post.user_id)) {
    return NextResponse.json({ message: "질문을 수정할 권한이 없습니다." }, { status: 403 });
  }

  const formData = await request.formData();
  const title = String(formData.get("title") ?? "");
  const content = String(formData.get("content") ?? "");
  const subjectArea = String(formData.get("subject_area") ?? "");
  const subjectDetail = String(formData.get("subject_detail") ?? "");
  const files = formData
    .getAll("images")
    .filter((entry): entry is File => entry instanceof File && entry.size > 0);
  const deleteImageIds = new Set(parseDeleteImageIds(formData));
  const validation = validateQnaQuestionInput({
    title,
    content,
    subjectArea,
    subjectDetail
  });

  if (!validation.ok) {
    return NextResponse.json({ message: validation.message }, { status: 400 });
  }

  if (!isQnaSubjectArea(subjectArea) || !isValidQnaSubject(subjectArea, subjectDetail)) {
    return NextResponse.json(
      { message: "과목 선택을 확인해 주세요." },
      { status: 400 }
    );
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

  const { error: postUpdateError } = await auth.client
    .from("community_posts")
    .update({
      title: title.trim(),
      content: content.trim()
    })
    .eq("id", post.id);

  if (postUpdateError) {
    return NextResponse.json(
      { message: "질문을 수정하지 못했습니다." },
      { status: 500 }
    );
  }

  const { error: questionUpdateError } = await auth.client
    .from("community_questions")
    .update({
      subject_area: subjectArea,
      subject_detail: subjectDetail
    })
    .eq("post_id", post.id);

  if (questionUpdateError) {
    return NextResponse.json(
      { message: "질문 과목 정보를 수정하지 못했습니다." },
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
    startOrderIndex: images.length - imagesToDelete.length,
    pathPrefix: "qna/questions/"
  });

  if (!uploadResult.ok) {
    return NextResponse.json(
      { message: uploadResult.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ message: "질문을 수정했습니다.", post_id: post.id });
}

export async function DELETE(request: Request, context: RouteContext) {
  const auth = await requireApprovedUserFromRequest(request);

  if (!auth.client || !auth.profile) {
    return NextResponse.json({ message: auth.error }, { status: auth.status });
  }

  const { id } = await context.params;
  const post = await getQnaPost(auth.client, id);

  if (!post) {
    return NextResponse.json({ message: "질문을 찾을 수 없습니다." }, { status: 404 });
  }

  if (!canManageCommunityResource(auth.profile, post.user_id)) {
    return NextResponse.json({ message: "질문을 삭제할 권한이 없습니다." }, { status: 403 });
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
      { message: "질문을 삭제하지 못했습니다." },
      { status: 500 }
    );
  }

  return NextResponse.json({ message: "질문을 삭제했습니다." });
}
