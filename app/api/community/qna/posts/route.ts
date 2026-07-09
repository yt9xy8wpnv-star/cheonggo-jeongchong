import { NextResponse } from "next/server";
import {
  getCommunityAuthorName,
  getImageCounts,
  getProfilesByIds,
  isAllowedImageFile,
  maxPostImageCount,
  normalizePage,
  normalizePageSize,
  normalizeQnaSort,
  normalizeQnaStatus,
  qnaBoardType,
  sortQnaPosts,
  toQnaPostListItem,
  validateQnaQuestionInput
} from "@/lib/community";
import { uploadPostImages } from "@/lib/communityUpload";
import { isQnaSubjectArea, isValidQnaSubject } from "@/lib/qnaSubjects";
import {
  getQnaAnswerCounts,
  getQnaHelpfulCountsByPost,
  getQnaLikeCounts
} from "@/lib/qnaServer";
import { getOptionalProfileFromAuthHeader, requireApprovedUserFromRequest } from "@/lib/serverAuth";
import type {
  CommunityAnswer,
  CommunityPost,
  CommunityQuestion
} from "@/lib/supabase/types";

export async function GET(request: Request) {
  const auth = await getOptionalProfileFromAuthHeader(request);

  if (!auth.client) {
    return NextResponse.json({ message: auth.error }, { status: auth.status });
  }

  const url = new URL(request.url);
  const q = (url.searchParams.get("q") ?? "").trim();
  const status = normalizeQnaStatus(url.searchParams.get("status"));
  const subjectArea = url.searchParams.get("subjectArea") ?? "all";
  const sort = normalizeQnaSort(url.searchParams.get("sort"));
  const page = normalizePage(url.searchParams.get("page"));
  const pageSize = normalizePageSize(url.searchParams.get("pageSize"));

  const { data, error } = await auth.client
    .from("community_posts")
    .select("*")
    .eq("board_type", qnaBoardType)
    .eq("status", "published")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json(
      { message: "질문 목록을 불러오지 못했습니다." },
      { status: 500 }
    );
  }

  const posts = (data ?? []) as CommunityPost[];
  const postIds = posts.map((post) => post.id);

  if (postIds.length === 0) {
    return NextResponse.json({
      posts: [],
      pagination: {
        page: 1,
        page_size: pageSize,
        total: 0,
        total_pages: 1
      },
      totalCount: 0,
      page: 1,
      pageSize,
      q,
      status,
      subjectArea,
      sort
    });
  }

  const [
    { data: questions },
    { data: answers },
    profiles,
    imageCounts,
    answerCounts,
    likeCounts
  ] = await Promise.all([
    auth.client
      .from("community_questions")
      .select("*")
      .in("post_id", postIds),
    auth.client
      .from("community_answers")
      .select("id, post_id")
      .eq("status", "published")
      .in("post_id", postIds),
    getProfilesByIds(
      auth.client,
      posts.map((post) => post.user_id)
    ),
    getImageCounts(auth.client, postIds),
    getQnaAnswerCounts(auth.client, postIds),
    getQnaLikeCounts(auth.client, postIds)
  ]);
  const questionsByPostId = new Map(
    ((questions ?? []) as CommunityQuestion[]).map((question) => [
      question.post_id,
      question
    ])
  );
  const helpfulCounts = await getQnaHelpfulCountsByPost(
    auth.client,
    (answers ?? []) as Pick<CommunityAnswer, "id" | "post_id">[]
  );
  const normalizedQuery = q.toLocaleLowerCase("ko");
  const filteredPosts = posts.filter((post) => {
    const question = questionsByPostId.get(post.id);

    if (!question) {
      return false;
    }

    if (status !== "all" && question.question_status !== status) {
      return false;
    }

    if (subjectArea !== "all" && question.subject_area !== subjectArea) {
      return false;
    }

    if (!normalizedQuery) {
      return true;
    }

    return [post.title, post.content, question.subject_area, question.subject_detail]
      .join(" ")
      .toLocaleLowerCase("ko")
      .includes(normalizedQuery);
  });

  const listItems = filteredPosts.map((post) =>
    toQnaPostListItem({
      post,
      authorName: getCommunityAuthorName(profiles, post.user_id),
      answerCount: answerCounts.get(post.id) ?? 0,
      helpfulCount: helpfulCounts.get(post.id) ?? 0,
      likeCount: likeCounts.get(post.id) ?? 0,
      imageCount: imageCounts.get(post.id) ?? 0,
      question: questionsByPostId.get(post.id) ?? null
    })
  );
  const sortedPosts = sortQnaPosts(listItems, sort);
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
    status,
    subjectArea,
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
  const subjectArea = String(formData.get("subject_area") ?? "");
  const subjectDetail = String(formData.get("subject_detail") ?? "");
  const files = formData
    .getAll("images")
    .filter((entry): entry is File => entry instanceof File && entry.size > 0);
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
      board_type: qnaBoardType,
      user_id: auth.profile.id,
      title: title.trim(),
      content: content.trim()
    })
    .select("*")
    .single<CommunityPost>();

  if (error || !post) {
    return NextResponse.json(
      { message: "질문을 저장하지 못했습니다." },
      { status: 500 }
    );
  }

  const { error: questionError } = await auth.client
    .from("community_questions")
    .insert({
      post_id: post.id,
      subject_area: subjectArea,
      subject_detail: subjectDetail
    });

  if (questionError) {
    await auth.client.from("community_posts").delete().eq("id", post.id);

    return NextResponse.json(
      { message: "질문 과목 정보를 저장하지 못했습니다." },
      { status: 500 }
    );
  }

  const uploadResult = await uploadPostImages({
    client: auth.client,
    files,
    postId: post.id,
    userId: auth.profile.id,
    pathPrefix: "qna/questions/"
  });

  if (!uploadResult.ok) {
    await auth.client.from("community_posts").delete().eq("id", post.id);

    return NextResponse.json(
      { message: uploadResult.message },
      { status: 500 }
    );
  }

  return NextResponse.json(
    { message: "질문을 등록했습니다.", post_id: post.id },
    { status: 201 }
  );
}
