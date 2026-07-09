"use client";

/* eslint-disable @next/next/no-img-element */

import { ChangeEvent, DragEvent, useMemo, useState } from "react";
import { ImagePlus, Trash2 } from "lucide-react";
import {
  allowedPoliceReportImageTypes,
  isAllowedPoliceReportImage
} from "@/lib/police";

export type PolicePendingImage = {
  id: string;
  file: File;
  previewUrl: string;
};

type PoliceImageUploaderProps = {
  image: PolicePendingImage | null;
  onImageChange: (image: PolicePendingImage | null) => void;
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

export function PoliceImageUploader({
  image,
  onImageChange,
  onError
}: PoliceImageUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const acceptedImageTypes = useMemo(
    () => allowedPoliceReportImageTypes.join(","),
    []
  );

  const setFile = async (file: File | null) => {
    if (!file) {
      return;
    }

    if (!isAllowedPoliceReportImage(file)) {
      onError("이미지는 jpg, png, webp, gif 형식과 5MB 이하만 가능합니다.");
      return;
    }

    onImageChange({
      id: crypto.randomUUID(),
      file,
      previewUrl: await readFileAsDataUrl(file)
    });
  };

  const handleImageChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const [file] = Array.from(event.target.files ?? []);

    event.currentTarget.value = "";
    await setFile(file ?? null);
  };

  const handleDrop = async (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setDragActive(false);
    const [file] = Array.from(event.dataTransfer.files ?? []);

    await setFile(file ?? null);
  };

  return (
    <div>
      <div>
        <p className="text-sm font-black text-brand-ink">이미지 첨부</p>
        <p className="mt-1 text-sm text-brand-muted">
          선택 사항 · 최대 1장 · jpg/png/webp/gif · 5MB 이하
        </p>
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
          이미지를 선택하거나 여기로 끌어오세요
        </span>
        <input
          type="file"
          accept={acceptedImageTypes}
          onChange={handleImageChange}
          className="sr-only"
        />
      </label>

      {image ? (
        <div className="mt-4 max-w-sm overflow-hidden rounded-lg border border-brand-line bg-slate-50">
          <div className="relative">
            <img
              src={image.previewUrl}
              alt="신고 첨부 이미지"
              className="h-48 w-full object-cover"
            />
            <button
              type="button"
              onClick={() => onImageChange(null)}
              className="focus-ring absolute right-2 top-2 rounded-md bg-white/90 p-2 text-brand-red shadow-sm hover:bg-red-50"
              aria-label="이미지 삭제"
            >
              <Trash2 aria-hidden="true" className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
