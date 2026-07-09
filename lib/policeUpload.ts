import type { SupabaseClient } from "@supabase/supabase-js";
import {
  allowedPoliceReportImageTypes,
  maxPoliceReportImageSize,
  policeReportImageBucket
} from "@/lib/police";

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

function getSafeFileName(file: File) {
  const extension = getUploadFileExtension(file);
  const baseName =
    file.name
      .replace(/\.[^.]+$/, "")
      .toLowerCase()
      .replace(/[^a-z0-9가-힣_-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 40) || "report-image";

  return `${baseName}.${extension}`;
}

function getStorageErrorMessage(error: { message?: string } | null) {
  return error?.message ? ` (${error.message})` : "";
}

export async function ensurePoliceReportImageBucket(client: SupabaseClient) {
  const { data } = await client.storage.getBucket(policeReportImageBucket);

  if (data) {
    return { ok: true as const };
  }

  const { error } = await client.storage.createBucket(policeReportImageBucket, {
    public: true,
    fileSizeLimit: maxPoliceReportImageSize,
    allowedMimeTypes: allowedPoliceReportImageTypes
  });

  if (error) {
    return {
      ok: false as const,
      message: `police-report-images 버킷을 만들거나 확인하지 못했습니다${getStorageErrorMessage(error)}. Supabase Storage에서 public bucket을 직접 생성해 주세요.`
    };
  }

  return { ok: true as const };
}

export async function uploadPoliceReportImage({
  client,
  file,
  reportId,
  userId
}: {
  client: SupabaseClient;
  file: File;
  reportId: string;
  userId: string;
}) {
  const bucketResult = await ensurePoliceReportImageBucket(client);

  if (!bucketResult.ok) {
    return bucketResult;
  }

  const storagePath = `${userId}/${reportId}/${Date.now()}-${getSafeFileName(file)}`;
  const { error: uploadError } = await client.storage
    .from(policeReportImageBucket)
    .upload(storagePath, file, {
      contentType: file.type,
      upsert: false
    });

  if (uploadError) {
    return {
      ok: false as const,
      message: `신고 이미지 업로드에 실패했습니다${getStorageErrorMessage(uploadError)}. Supabase Storage의 police-report-images 버킷 설정을 확인해 주세요.`
    };
  }

  const {
    data: { publicUrl }
  } = client.storage.from(policeReportImageBucket).getPublicUrl(storagePath);

  return {
    ok: true as const,
    imageUrl: publicUrl,
    storagePath
  };
}
