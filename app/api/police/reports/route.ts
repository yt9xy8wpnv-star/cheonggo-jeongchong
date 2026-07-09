import { NextResponse } from "next/server";
import {
  getPoliceReportReason,
  isAllowedPoliceReportImage,
  isPoliceReason,
  isPoliceReportType,
  isPoliceTargetType,
  maxPoliceReportImageCount,
  validatePoliceAccusedName,
  validatePoliceDetail
} from "@/lib/police";
import { uploadPoliceReportImage } from "@/lib/policeUpload";
import { requireApprovedUserFromRequest } from "@/lib/serverAuth";
import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  CommunityAnswer,
  CommunityComment,
  CommunityPost,
  PoliceReport,
  PoliceReportType,
  PoliceTargetType
} from "@/lib/supabase/types";

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function nullableTrimmed(value: FormDataEntryValue | null) {
  const trimmed = typeof value === "string" ? value.trim() : "";

  return trimmed || null;
}

async function validateReportTarget({
  client,
  targetType,
  targetId
}: {
  client: SupabaseClient;
  targetType: PoliceTargetType;
  targetId: string;
}) {
  if (targetType === "post") {
    const { data: post } = await client
      .from("community_posts")
      .select("*")
      .eq("id", targetId)
      .in("board_type", ["free", "study", "qna"])
      .eq("status", "published")
      .maybeSingle<CommunityPost>();

    return Boolean(post);
  }

  if (targetType === "comment") {
    const { data: comment } = await client
      .from("community_comments")
      .select("*")
      .eq("id", targetId)
      .eq("status", "published")
      .maybeSingle<CommunityComment>();

    if (!comment) {
      return false;
    }

    const { data: post } = await client
      .from("community_posts")
      .select("id")
      .eq("id", comment.post_id)
      .in("board_type", ["free", "study"])
      .eq("status", "published")
      .maybeSingle<Pick<CommunityPost, "id">>();

    return Boolean(post);
  }

  const { data: answer } = await client
    .from("community_answers")
    .select("*")
    .eq("id", targetId)
    .eq("status", "published")
    .maybeSingle<CommunityAnswer>();

  if (!answer) {
    return false;
  }

  const { data: post } = await client
    .from("community_posts")
    .select("id")
    .eq("id", answer.post_id)
    .eq("board_type", "qna")
    .eq("status", "published")
    .maybeSingle<Pick<CommunityPost, "id">>();

  return Boolean(post);
}

export async function POST(request: Request) {
  const auth = await requireApprovedUserFromRequest(request);

  if (!auth.client || !auth.profile) {
    return NextResponse.json({ message: auth.error }, { status: auth.status });
  }

  const formData = await request.formData();
  const reportType = String(formData.get("report_type") ?? "");
  const rawReason = String(formData.get("reason") ?? "");
  const detail = String(formData.get("detail") ?? "");
  const accusedName = nullableTrimmed(formData.get("accused_name"));
  const targetType = nullableTrimmed(formData.get("target_type"));
  const targetId = nullableTrimmed(formData.get("target_id"));
  const targetLabel = nullableTrimmed(formData.get("target_label"));
  const targetAuthorName = nullableTrimmed(formData.get("target_author_name"));
  const imageFiles = formData
    .getAll("image")
    .filter((entry): entry is File => entry instanceof File && entry.size > 0);

  if (!isPoliceReportType(reportType)) {
    return NextResponse.json({ message: "신고 유형을 확인해 주세요." }, { status: 400 });
  }

  const detailValidation = validatePoliceDetail(detail);

  if (!detailValidation.ok) {
    return NextResponse.json(
      { message: detailValidation.message },
      { status: 400 }
    );
  }

  if (imageFiles.length > maxPoliceReportImageCount) {
    return NextResponse.json(
      { message: "신고 이미지는 최대 1장까지 첨부할 수 있습니다." },
      { status: 400 }
    );
  }

  if (imageFiles.some((file) => !isAllowedPoliceReportImage(file))) {
    return NextResponse.json(
      { message: "이미지는 jpg, png, webp, gif 형식과 5MB 이하만 가능합니다." },
      { status: 400 }
    );
  }

  let nextTargetType: PoliceTargetType | null = null;
  let nextTargetId: string | null = null;

  if (reportType === "post_comment") {
    if (!targetType || !targetId || !isPoliceTargetType(targetType)) {
      return NextResponse.json(
        { message: "신고 대상을 선택해 주세요." },
        { status: 400 }
      );
    }

    if (!uuidPattern.test(targetId)) {
      return NextResponse.json(
        { message: "신고 대상 값을 확인해 주세요." },
        { status: 400 }
      );
    }

    const targetExists = await validateReportTarget({
      client: auth.client,
      targetType,
      targetId
    });

    if (!targetExists) {
      return NextResponse.json(
        { message: "신고 대상을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    if (!isPoliceReason(rawReason)) {
      return NextResponse.json(
        { message: "신고 사유를 선택해 주세요." },
        { status: 400 }
      );
    }

    nextTargetType = targetType;
    nextTargetId = targetId;
  } else {
    const nameValidation = validatePoliceAccusedName(
      accusedName ?? "",
      reportType !== "other"
    );

    if (!nameValidation.ok) {
      return NextResponse.json(
        { message: nameValidation.message },
        { status: 400 }
      );
    }
  }

  const reason = getPoliceReportReason(reportType as PoliceReportType, rawReason);

  if (!isPoliceReason(reason)) {
    return NextResponse.json({ message: "신고 사유를 확인해 주세요." }, { status: 400 });
  }

  const { data: report, error: insertError } = await auth.client
    .from("police_reports")
    .insert({
      reporter_id: auth.profile.id,
      report_type: reportType,
      target_type: nextTargetType,
      target_id: nextTargetId,
      target_label: targetLabel,
      target_author_name: targetAuthorName,
      accused_name: accusedName,
      reason,
      detail: detail.trim()
    })
    .select("*")
    .single<PoliceReport>();

  if (insertError || !report) {
    return NextResponse.json(
      { message: "신고를 접수하지 못했습니다." },
      { status: 500 }
    );
  }

  const [imageFile] = imageFiles;

  if (imageFile) {
    const uploadResult = await uploadPoliceReportImage({
      client: auth.client,
      file: imageFile,
      reportId: report.id,
      userId: auth.profile.id
    });

    if (!uploadResult.ok) {
      await auth.client.from("police_reports").delete().eq("id", report.id);

      return NextResponse.json(
        { message: uploadResult.message },
        { status: 500 }
      );
    }

    const { error: updateError } = await auth.client
      .from("police_reports")
      .update({
        image_url: uploadResult.imageUrl,
        storage_path: uploadResult.storagePath
      })
      .eq("id", report.id);

    if (updateError) {
      await auth.client.storage
        .from("police-report-images")
        .remove([uploadResult.storagePath]);
      await auth.client.from("police_reports").delete().eq("id", report.id);

      return NextResponse.json(
        { message: "신고 이미지 정보를 저장하지 못했습니다." },
        { status: 500 }
      );
    }
  }

  return NextResponse.json(
    { message: "제보가 접수되었습니다.", report_id: report.id },
    { status: 201 }
  );
}
