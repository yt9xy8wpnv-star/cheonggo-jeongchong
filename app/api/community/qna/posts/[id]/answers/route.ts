import { NextResponse } from "next/server";
import {
  isAllowedImageFile,
  maxPostImageCount,
  qnaBoardType,
  validateQnaAnswerInput
} from "@/lib/community";
import { uploadAnswerImages } from "@/lib/communityUpload";
import { recalculateQuestionStatus } from "@/lib/qnaServer";
import { requireApprovedUserFromRequest } from "@/lib/serverAuth";
import type { CommunityAnswer, CommunityPost } from "@/lib/supabase/types";

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
    .eq("board_type", qnaBoardType)
    .eq("status", "published")
    .maybeSingle<CommunityPost>();

  if (postError || !post) {
    return NextResponse.json({ message: "질문을 찾을 수 없습니다." }, { status: 404 });
  }

  const formData = await request.formData();
  const content = String(formData.get("content") ?? "");
  const files = formData
    .getAll("images")
    .filter((entry): entry is File => entry instanceof File && entry.size > 0);
  const validation = validateQnaAnswerInput(content);

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

  const { data: answer, error: answerError } = await auth.client
    .from("community_answers")
    .insert({
      post_id: post.id,
      user_id: auth.profile.id,
      content: content.trim()
    })
    .select("*")
    .single<CommunityAnswer>();

  if (answerError || !answer) {
    return NextResponse.json(
      { message: "답변을 저장하지 못했습니다." },
      { status: 500 }
    );
  }

  const uploadResult = await uploadAnswerImages({
    client: auth.client,
    files,
    answerId: answer.id,
    userId: auth.profile.id
  });

  if (!uploadResult.ok) {
    await auth.client.from("community_answers").delete().eq("id", answer.id);

    return NextResponse.json(
      { message: uploadResult.message },
      { status: 500 }
    );
  }

  await recalculateQuestionStatus(auth.client, post.id);

  return NextResponse.json(
    { message: "답변을 등록했습니다.", answer_id: answer.id },
    { status: 201 }
  );
}
