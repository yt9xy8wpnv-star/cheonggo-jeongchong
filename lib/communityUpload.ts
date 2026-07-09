import type { SupabaseClient } from "@supabase/supabase-js";
import {
  allowedPostImageTypes,
  communityImageBucket,
  maxPostImageSize
} from "@/lib/community";
import type { CommunityPostImage } from "@/lib/supabase/types";

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

function getStorageErrorMessage(error: { message?: string } | null) {
  return error?.message ? ` (${error.message})` : "";
}

export async function ensureCommunityImageBucket(client: SupabaseClient) {
  const { data } = await client.storage.getBucket(communityImageBucket);

  if (data) {
    return { ok: true as const };
  }

  const { error } = await client.storage.createBucket(communityImageBucket, {
    public: true,
    fileSizeLimit: maxPostImageSize,
    allowedMimeTypes: allowedPostImageTypes
  });

  if (error) {
    return {
      ok: false as const,
      message: `community-images 버킷을 만들거나 확인하지 못했습니다${getStorageErrorMessage(error)}. Supabase Storage에서 public bucket을 직접 생성해 주세요.`
    };
  }

  return { ok: true as const };
}

export async function uploadPostImages({
  client,
  files,
  postId,
  userId,
  startOrderIndex = 0
}: {
  client: SupabaseClient;
  files: File[];
  postId: string;
  userId: string;
  startOrderIndex?: number;
}) {
  if (files.length === 0) {
    return { ok: true as const, images: [] };
  }

  const bucketResult = await ensureCommunityImageBucket(client);

  if (!bucketResult.ok) {
    return bucketResult;
  }

  const uploadedImages: Array<Omit<CommunityPostImage, "id" | "created_at">> = [];
  const uploadedPaths: string[] = [];

  for (let index = 0; index < files.length; index += 1) {
    const file = files[index];
    const extension = getUploadFileExtension(file);
    const storagePath = `${userId}/${postId}/${Date.now()}-${index}.${extension}`;
    const { error: uploadError } = await client.storage
      .from(communityImageBucket)
      .upload(storagePath, file, {
        contentType: file.type,
        upsert: false
      });

    if (uploadError) {
      if (uploadedPaths.length > 0) {
        await client.storage.from(communityImageBucket).remove(uploadedPaths);
      }

      return {
        ok: false as const,
        message: `이미지 업로드에 실패했습니다${getStorageErrorMessage(uploadError)}. Supabase Storage의 community-images 버킷 설정을 확인해 주세요.`
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

  return { ok: true as const, images: uploadedImages };
}
