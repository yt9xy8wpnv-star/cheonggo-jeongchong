"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { CommunityNoticeCard } from "@/components/community/CommunityNoticeCard";
import {
  QnaImageUploader,
  type QnaPendingImage
} from "@/components/community/QnaImageUploader";
import { QnaSubjectSelect } from "@/components/community/QnaSubjectSelect";
import { useCommunityAuth } from "@/components/community/useCommunityAuth";
import { getLoginRedirectHref } from "@/lib/redirect";
import {
  validateQnaQuestionInput,
  type QnaPostDetailResponse
} from "@/lib/community";
import type { CommunityPostImage } from "@/lib/supabase/types";

type QnaQuestionFormProps = {
  mode: "create" | "edit";
  postId?: string;
};

type MutationPayload = {
  message?: string;
  post_id?: string;
};

export function QnaQuestionForm({ mode, postId }: QnaQuestionFormProps) {
  const router = useRouter();
  const auth = useCommunityAuth();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [subjectArea, setSubjectArea] = useState("");
  const [subjectDetail, setSubjectDetail] = useState("");
  const [pendingImages, setPendingImages] = useState<QnaPendingImage[]>([]);
  const [existingImages, setExistingImages] = useState<CommunityPostImage[]>([]);
  const [deleteImageIds, setDeleteImageIds] = useState<string[]>([]);
  const [loadingPost, setLoadingPost] = useState(mode === "edit");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const loadPost = useCallback(async () => {
    if (mode !== "edit" || !postId || !auth.token) {
      return;
    }

    setLoadingPost(true);
    setMessage("");

    const response = await fetch(`/api/community/qna/posts/${postId}`, {
      headers: {
        Authorization: `Bearer ${auth.token}`
      }
    });
    const payload = (await response.json().catch(() => ({}))) as
      | QnaPostDetailResponse
      | { message?: string };

    setLoadingPost(false);

    if (!response.ok || !("post" in payload)) {
      setMessage(
        "message" in payload && payload.message
          ? payload.message
          : "질문을 불러오지 못했습니다."
      );
      return;
    }

    if (!payload.post.can_edit) {
      setMessage("질문을 수정할 권한이 없습니다.");
      return;
    }

    setTitle(payload.post.title);
    setContent(payload.post.content);
    setSubjectArea(payload.post.question?.subject_area ?? "");
    setSubjectDetail(payload.post.question?.subject_detail ?? "");
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

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!auth.token) {
      setMessage("로그인 후 작성할 수 있습니다.");
      return;
    }

    const validation = validateQnaQuestionInput({
      title,
      content,
      subjectArea,
      subjectDetail
    });

    if (!validation.ok) {
      setMessage(validation.message);
      return;
    }

    setSubmitting(true);
    setMessage("");

    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    formData.append("subject_area", subjectArea);
    formData.append("subject_detail", subjectDetail);
    pendingImages.forEach((image) => formData.append("images", image.file));

    if (mode === "edit") {
      formData.append("deleteImageIds", JSON.stringify(deleteImageIds));
    }

    const endpoint =
      mode === "create"
        ? "/api/community/qna/posts"
        : `/api/community/qna/posts/${postId}`;
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

    router.push(`/community/qna/${payload.post_id ?? postId}`);
  };

  if (auth.status === "loading" || loadingPost) {
    return (
      <main className="bg-white">
        <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
          <CommunityNoticeCard
            title="질문을 준비하는 중입니다"
            description="회원 정보와 질문 정보를 확인하고 있습니다."
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
            title="로그인 후 질문할 수 있습니다"
            description="청고정총 계정으로 로그인하면 질문 게시판을 이용할 수 있습니다."
            actionHref={getLoginRedirectHref(
              mode === "edit" && postId
                ? `/community/qna/${postId}/edit`
                : "/community/qna/write"
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
          href={mode === "edit" && postId ? `/community/qna/${postId}` : "/community/qna"}
          className="focus-ring inline-flex items-center gap-2 rounded-md text-sm font-black text-brand-blue hover:text-brand-deep"
        >
          <ArrowLeft aria-hidden="true" className="h-4 w-4" />
          돌아가기
        </Link>

        <div className="mt-6 border-b border-brand-line pb-6">
          <p className="text-sm font-bold text-brand-blue">Question Board</p>
          <h1 className="mt-2 text-3xl font-black text-brand-ink">
            {mode === "create" ? "질문 작성" : "질문 수정"}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div>
            <label htmlFor="qna-title" className="text-sm font-black text-brand-ink">
              제목
            </label>
            <input
              id="qna-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              maxLength={120}
              className="focus-ring mt-2 w-full rounded-md border border-brand-line px-4 py-3 text-base font-bold text-brand-ink"
            />
          </div>

          <QnaSubjectSelect
            subjectArea={subjectArea}
            subjectDetail={subjectDetail}
            onSubjectAreaChange={setSubjectArea}
            onSubjectDetailChange={setSubjectDetail}
          />

          <div>
            <label htmlFor="qna-content" className="text-sm font-black text-brand-ink">
              질문 내용
            </label>
            <textarea
              id="qna-content"
              value={content}
              onChange={(event) => setContent(event.target.value)}
              maxLength={2000}
              className="focus-ring mt-2 min-h-[300px] w-full resize-y rounded-md border border-brand-line px-4 py-3 text-base leading-8 text-brand-ink"
            />
          </div>

          <QnaImageUploader
            pendingImages={pendingImages}
            onPendingImagesChange={setPendingImages}
            existingImages={existingImages}
            deleteImageIds={deleteImageIds}
            onDeleteImageIdsChange={setDeleteImageIds}
            onError={setMessage}
          />

          {message ? (
            <p className="rounded-md bg-red-50 px-4 py-3 text-sm font-black text-brand-red">
              {message}
            </p>
          ) : null}

          <div className="flex flex-col-reverse gap-2 border-t border-brand-line pt-6 sm:flex-row sm:justify-end">
            <Link
              href={mode === "edit" && postId ? `/community/qna/${postId}` : "/community/qna"}
              className="focus-ring rounded-md border border-brand-line px-5 py-3 text-center text-sm font-black text-slate-700 hover:bg-slate-50"
            >
              취소
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="focus-ring rounded-md bg-brand-blue px-5 py-3 text-sm font-black text-white hover:bg-brand-deep disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {submitting ? "저장 중" : mode === "create" ? "질문 등록" : "수정하기"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
