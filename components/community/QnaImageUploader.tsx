"use client";

/* eslint-disable @next/next/no-img-element */

import { ImagePlus, Trash2, X } from "lucide-react";
import { ChangeEvent, DragEvent, useMemo, useState } from "react";
import {
  allowedPostImageTypes,
  isAllowedImageFile,
  maxPostImageCount
} from "@/lib/community";

export type QnaPendingImage = {
  id: string;
  file: File;
  previewUrl: string;
};

type ExistingImage = {
  id: string;
  image_url: string;
};

type QnaImageUploaderProps = {
  pendingImages: QnaPendingImage[];
  onPendingImagesChange: (images: QnaPendingImage[]) => void;
  existingImages?: ExistingImage[];
  deleteImageIds?: string[];
  onDeleteImageIdsChange?: (ids: string[]) => void;
  onError: (message: string) => void;
};

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("이미지를 읽지 못했습니다."));
    reader.readAsDataURL(file);
  });
}

export function QnaImageUploader({
  pendingImages,
  onPendingImagesChange,
  existingImages = [],
  deleteImageIds = [],
  onDeleteImageIdsChange,
  onError
}: QnaImageUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const acceptedImageTypes = useMemo(() => allowedPostImageTypes.join(","), []);
  const activeExistingImageCount = existingImages.filter(
    (image) => !deleteImageIds.includes(image.id)
  ).length;
  const remainingImageCount =
    maxPostImageCount - activeExistingImageCount - pendingImages.length;

  const appendFiles = async (files: File[]) => {
    if (files.length === 0) {
      return;
    }

    const validFiles = files.filter(isAllowedImageFile);

    if (validFiles.length !== files.length) {
      onError("이미지는 jpg, png, webp, gif 형식과 5MB 이하만 가능합니다.");
    }

    if (remainingImageCount <= 0) {
      onError(`이미지는 최대 ${maxPostImageCount}개까지 첨부할 수 있습니다.`);
      return;
    }

    const limitedFiles = validFiles.slice(0, remainingImageCount);
    const previews = await Promise.all(
      limitedFiles.map(async (file) => ({
        id: crypto.randomUUID(),
        file,
        previewUrl: await readFileAsDataUrl(file)
      }))
    );

    onPendingImagesChange([...pendingImages, ...previews]);
  };

  const handleImageChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);

    event.currentTarget.value = "";
    await appendFiles(files);
  };

  const handleDrop = async (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setDragActive(false);
    await appendFiles(Array.from(event.dataTransfer.files ?? []));
  };

  const toggleDeleteExistingImage = (imageId: string) => {
    if (!onDeleteImageIdsChange) {
      return;
    }

    onDeleteImageIdsChange(
      deleteImageIds.includes(imageId)
        ? deleteImageIds.filter((id) => id !== imageId)
        : [...deleteImageIds, imageId]
    );
  };

  const removePendingImage = (imageId: string) => {
    onPendingImagesChange(pendingImages.filter((image) => image.id !== imageId));
  };

  return (
    <div>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-black text-brand-ink">이미지</p>
          <p className="mt-1 text-sm text-brand-muted">
            최대 {maxPostImageCount}개 · jpg/png/webp/gif · 5MB 이하
          </p>
        </div>
      </div>

      <label
        onDragEnter={(event) => {
          event.preventDefault();
          setDragActive(true);
        }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        className={`focus-within:ring-brand-blue mt-3 flex cursor-pointer flex-col items-center justify-center rounded-md border border-dashed px-4 py-8 text-center transition focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 ${
          dragActive
            ? "border-brand-blue bg-blue-50"
            : "border-brand-line bg-slate-50 hover:bg-white"
        }`}
      >
        <ImagePlus aria-hidden="true" className="h-6 w-6 text-brand-blue" />
        <span className="mt-2 text-sm font-black text-brand-ink">
          이미지를 추가하거나 여기로 끌어오세요
        </span>
        <span className="mt-1 text-xs font-bold text-brand-muted">
          남은 첨부 가능 수 {Math.max(remainingImageCount, 0)}개
        </span>
        <input
          type="file"
          accept={acceptedImageTypes}
          multiple
          onChange={handleImageChange}
          className="sr-only"
        />
      </label>

      {existingImages.length > 0 || pendingImages.length > 0 ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          {existingImages.map((image) => {
            const markedForDelete = deleteImageIds.includes(image.id);

            return (
              <div
                key={image.id}
                className="relative overflow-hidden rounded-lg border border-brand-line bg-slate-50"
              >
                <img
                  src={image.image_url}
                  alt="첨부 이미지"
                  className={`h-36 w-full object-cover ${markedForDelete ? "opacity-30" : ""}`}
                />
                {onDeleteImageIdsChange ? (
                  <button
                    type="button"
                    onClick={() => toggleDeleteExistingImage(image.id)}
                    className="focus-ring absolute right-2 top-2 rounded-md bg-white/90 p-2 text-brand-red shadow-sm hover:bg-red-50"
                    aria-label={markedForDelete ? "이미지 삭제 취소" : "이미지 삭제"}
                  >
                    {markedForDelete ? (
                      <X aria-hidden="true" className="h-4 w-4" />
                    ) : (
                      <Trash2 aria-hidden="true" className="h-4 w-4" />
                    )}
                  </button>
                ) : null}
              </div>
            );
          })}
          {pendingImages.map((image) => (
            <div
              key={image.id}
              className="relative overflow-hidden rounded-lg border border-brand-line bg-slate-50"
            >
              <img
                src={image.previewUrl}
                alt="새 첨부 이미지"
                className="h-36 w-full object-cover"
              />
              <button
                type="button"
                onClick={() => removePendingImage(image.id)}
                className="focus-ring absolute right-2 top-2 rounded-md bg-white/90 p-2 text-brand-red shadow-sm hover:bg-red-50"
                aria-label="새 이미지 제거"
              >
                <Trash2 aria-hidden="true" className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
