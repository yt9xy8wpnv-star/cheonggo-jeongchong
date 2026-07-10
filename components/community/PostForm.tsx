"use client";

/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ImagePlus, Trash2, X } from "lucide-react";
import { ChangeEvent, FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { CommunityNoticeCard } from "@/components/community/CommunityNoticeCard";
import { useCommunityAuth } from "@/components/community/useCommunityAuth";
import { getLoginRedirectHref } from "@/lib/redirect";
import {
  allowedPostImageTypes,
  isAllowedImageFile,
  maxPostImageCount,
  validatePostInput,
  type CommunityPostDetailResponse
} from "@/lib/community";
import type { CommunityPostImage } from "@/lib/supabase/types";

type PostFormProps = {
  mode: "create" | "edit";
  postId?: string;
};

type PendingImage = {
  id: string;
  file: File;
  previewUrl: string;
};

type MutationPayload = {
  message?: string;
  post_id?: string;
};

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("이미지를 읽지 못했습니다."));
    reader.readAsDataURL(file);
  });
}

export function PostForm({ mode, postId }: PostFormProps) {
  const router = useRouter();
  const auth = useCommunityAuth();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [pendingImages, setPendingImages] = useState<PendingImage[]>([]);
  const [existingImages, setExistingImages] = useState<CommunityPostImage[]>([]);
  const [deleteImageIds, setDeleteImageIds] = useState<string[]>([]);
  const [loadingPost, setLoadingPost] = useState(mode === "edit");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const acceptedImageTypes = useMemo(() => allowedPostImageTypes.join(","), []);
  const activeExistingImageCount = existingImages.filter(
    (image) => !deleteImageIds.includes(image.id)
  ).length;
  const remainingImageCount =
    maxPostImageCount - activeExistingImageCount - pendingImages.length;

  const loadPost = useCallback(async () => {
    if (mode !== "edit" || !postId || !auth.token) {
      return;
    }

    setLoadingPost(true);
    setMessage("");

    const response = await fetch(`/api/community/free/posts/${postId}`, {
      headers: {
        Authorization: `Bearer ${auth.token}`
      }
    });
    const payload = (await response.json().catch(() => ({}))) as
      | CommunityPostDetailResponse
      | { message?: string };

    setLoadingPost(false);

    if (!response.ok || !("post" in payload)) {
      setMessage(
        "message" in payload && payload.message
          ? payload.message
          : "게시글을 불러오지 못했습니다."
      );
      return;
    }

    if (!payload.post.can_edit) {
      setMessage("게시글을 수정할 권한이 없습니다.");
      return;
    }

    setTitle(payload.post.title);
    setContent(payload.post.content);
    setExistingImages(payload.post.images);
    setDeleteImageIds([]);
  }, [auth.token, mode, postId]);

  useEffect(() => {
    if (mode !== "edit" || auth.status !== "ready") {
      return;
    }

    const timer = window.setTimeout(() => {
      void loadPost();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [auth.status, loadPost, mode]);

  const handleImageChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    event.currentTarget.value = "";

    if (files.length === 0) {
      return;
    }

    const validFiles = files.filter(isAllowedImageFile);

    if (validFiles.length !== files.length) {
      setMessage("이미지는 jpg, png, webp, gif 형식과 5MB 이하만 가능합니다.");
    }

    if (remainingImageCount <= 0) {
      setMessage(`이미지는 최대 ${maxPostImageCount}개까지 첨부할 수 있습니다.`);
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

    setPendingImages((current) => [...current, ...previews]);
  };

  const toggleDeleteExistingImage = (imageId: string) => {
    setDeleteImageIds((current) =>
      current.includes(imageId)
        ? current.filter((id) => id !== imageId)
        : [...current, imageId]
    );
  };

  const removePendingImage = (imageId: string) => {
    setPendingImages((current) => current.filter((image) => image.id !== imageId));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!auth.token) {
      setMessage("로그인 후 작성할 수 있습니다.");
      return;
    }

    const validation = validatePostInput(title, content);

    if (!validation.ok) {
      setMessage(validation.message);
      return;
    }

    setSubmitting(true);
    setMessage("");

    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    pendingImages.forEach((image) => formData.append("images", image.file));

    if (mode === "edit") {
      formData.append("deleteImageIds", JSON.stringify(deleteImageIds));
    }

    const endpoint =
      mode === "create"
        ? "/api/community/free/posts"
        : `/api/community/free/posts/${postId}`;
    const response = await fetch(endpoint, {
      method: mode === "create" ? "POST" : "PATCH",
      headers: {
        Authorization: `Bearer ${auth.token}`
      },
      body: formData
    });
    const payload = (await response.json().catch(() => ({}))) as MutationPayload;

    setSubmitting(false);

    if (!response.ok) {
      setMessage(payload.message ?? "저장하지 못했습니다.");
      return;
    }

    router.push(`/community/free/${payload.post_id ?? postId}`);
  };

  if (auth.status === "loading" || loadingPost) {
    return (
      <main className="bg-white">
        <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
          <CommunityNoticeCard
            title="게시글을 준비하는 중입니다"
            description="회원 정보와 게시글 정보를 확인하고 있습니다."
          />
        </section>
      </main>
    );
  }

  if (auth.status === "config") {
    return (
      <main className="bg-white">
        <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
          <CommunityNoticeCard title="설정이 필요합니다" description={auth.message} />
        </section>
      </main>
    );
  }

  if (auth.status === "signed-out") {
    return (
      <main className="bg-white">
        <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
          <CommunityNoticeCard
            title="로그인 후 작성할 수 있습니다"
            description="청고정총 계정으로 로그인하면 자유게시판 글을 작성할 수 있습니다."
            actionHref={getLoginRedirectHref(
              mode === "edit" && postId
                ? `/community/free/${postId}/edit`
                : "/community/free/write"
            )}
            actionLabel="로그인"
          />
        </section>
      </main>
    );
  }

  if (auth.status === "approval") {
    return (
      <main className="bg-white">
        <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
          <CommunityNoticeCard title="작성 권한 승인 대기 중입니다" description={auth.message} />
        </section>
      </main>
    );
  }

  return (
    <main className="bg-white">
      <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <Link
          href={mode === "edit" && postId ? `/community/free/${postId}` : "/community/free"}
          className="focus-ring inline-flex items-center gap-2 rounded-md text-sm font-black text-brand-blue hover:text-brand-deep"
        >
          <ArrowLeft aria-hidden="true" className="h-4 w-4" />
          돌아가기
        </Link>

        <div className="mt-6 border-b border-brand-line pb-6">
          <p className="text-sm font-bold text-brand-blue">Free Board</p>
          <h1 className="mt-2 text-3xl font-black text-brand-ink">
            {mode === "create" ? "글쓰기" : "게시글 수정"}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div>
            <label htmlFor="post-title" className="text-sm font-black text-brand-ink">
              제목
            </label>
            <input
              id="post-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              maxLength={200}
              className="focus-ring mt-2 w-full rounded-md border border-brand-line px-4 py-3 text-base font-bold text-brand-ink"
            />
          </div>

          <div>
            <label htmlFor="post-content" className="text-sm font-black text-brand-ink">
              내용
            </label>
            <textarea
              id="post-content"
              value={content}
              onChange={(event) => setContent(event.target.value)}
              maxLength={5000}
              className="focus-ring mt-2 min-h-[320px] w-full resize-y rounded-md border border-brand-line px-4 py-3 text-base leading-8 text-brand-ink"
            />
          </div>

          <div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-black text-brand-ink">이미지</p>
                <p className="mt-1 text-sm text-brand-muted">
                  최대 {maxPostImageCount}개 · jpg/png/webp/gif · 5MB 이하
                </p>
              </div>
              <label className="focus-within:ring-brand-blue inline-flex cursor-pointer items-center gap-2 rounded-md border border-brand-blue px-4 py-2.5 text-sm font-black text-brand-blue hover:bg-blue-50 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2">
                <ImagePlus aria-hidden="true" className="h-4 w-4" />
                이미지 추가
                <input
                  type="file"
                  accept={acceptedImageTypes}
                  multiple
                  onChange={handleImageChange}
                  className="sr-only"
                />
              </label>
            </div>

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

          {message ? (
            <p className="rounded-md bg-red-50 px-4 py-3 text-sm font-black text-brand-red">
              {message}
            </p>
          ) : null}

          <div className="flex flex-col-reverse gap-2 border-t border-brand-line pt-6 sm:flex-row sm:justify-end">
            <Link
              href={mode === "edit" && postId ? `/community/free/${postId}` : "/community/free"}
              className="focus-ring rounded-md border border-brand-line px-5 py-3 text-center text-sm font-black text-slate-700 hover:bg-slate-50"
            >
              취소
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="focus-ring rounded-md bg-brand-blue px-5 py-3 text-sm font-black text-white hover:bg-brand-deep disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {submitting ? "저장 중" : mode === "create" ? "등록하기" : "수정하기"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
