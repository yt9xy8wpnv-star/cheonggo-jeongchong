"use client";

/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  BadgeCheck,
  Eye,
  MessageSquare,
  Pencil,
  ThumbsUp,
  Trash2
} from "lucide-react";
import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { CommunityNoticeCard } from "@/components/community/CommunityNoticeCard";
import { formatCommunityDateTime } from "@/components/community/communityFormat";
import {
  QnaImageUploader,
  type QnaPendingImage
} from "@/components/community/QnaImageUploader";
import { QnaStatusBadge } from "@/components/community/QnaStatusBadge";
import { useCommunityAuth } from "@/components/community/useCommunityAuth";
import { getLoginRedirectHref } from "@/lib/redirect";
import {
  validateQnaAnswerInput,
  type QnaAnswerView,
  type QnaPostDetail,
  type QnaPostDetailResponse
} from "@/lib/community";

type QnaQuestionDetailProps = {
  postId: string;
};

type ApiMessage = {
  message?: string;
};

type LikeResponse = {
  like_count: number;
  my_like: boolean;
};

type HelpfulResponse = {
  helpful_count: number;
  my_helpful: boolean;
};

function DeleteQuestionModal({
  open,
  busy,
  onClose,
  onConfirm
}: {
  open: boolean;
  busy: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    cancelButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !busy) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [busy, onClose, open]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 py-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-question-title"
    >
      <div className="w-full max-w-md rounded-xl border border-brand-line bg-white p-6 shadow-xl">
        <h2 id="delete-question-title" className="text-xl font-black text-brand-ink">
          질문을 삭제할까요?
        </h2>
        <p className="mt-3 text-sm leading-7 text-brand-muted">
          삭제된 질문과 답변은 목록과 상세 화면에 표시되지 않습니다.
        </p>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            ref={cancelButtonRef}
            type="button"
            onClick={onClose}
            disabled={busy}
            className="focus-ring rounded-md border border-brand-line px-5 py-3 text-sm font-black text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            취소
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className="focus-ring rounded-md bg-brand-red px-5 py-3 text-sm font-black text-white hover:bg-red-800 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {busy ? "삭제 중" : "삭제하기"}
          </button>
        </div>
      </div>
    </div>
  );
}

function AnswerArticle({
  answer,
  canAcceptAnswer,
  onHelpful,
  onAccept,
  onDelete
}: {
  answer: QnaAnswerView;
  canAcceptAnswer: boolean;
  onHelpful: (answer: QnaAnswerView) => void;
  onAccept: (answer: QnaAnswerView) => void;
  onDelete: (answer: QnaAnswerView) => void;
}) {
  return (
    <article
      className={`rounded-lg border p-5 ${
        answer.is_accepted
          ? "border-emerald-200 bg-emerald-50/60"
          : "border-brand-line bg-white"
      }`}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-black text-brand-ink">{answer.author_name}</p>
            {answer.is_accepted ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-white px-2.5 py-1 text-xs font-black text-emerald-700">
                <BadgeCheck aria-hidden="true" className="h-3.5 w-3.5" />
                채택 답변
              </span>
            ) : null}
          </div>
          <p className="mt-1 text-xs font-bold text-brand-muted">
            {formatCommunityDateTime(answer.created_at)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {canAcceptAnswer && !answer.is_accepted ? (
            <button
              type="button"
              onClick={() => onAccept(answer)}
              className="focus-ring inline-flex items-center gap-1 rounded-md border border-emerald-200 px-3 py-2 text-sm font-black text-emerald-700 hover:bg-emerald-50"
            >
              <BadgeCheck aria-hidden="true" className="h-4 w-4" />
              채택
            </button>
          ) : null}
          {answer.can_delete ? (
            <button
              type="button"
              onClick={() => onDelete(answer)}
              className="focus-ring inline-flex items-center gap-1 rounded-md text-sm font-black text-brand-red hover:text-red-800"
            >
              <Trash2 aria-hidden="true" className="h-4 w-4" />
              삭제
            </button>
          ) : null}
        </div>
      </div>
      <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-brand-ink">
        {answer.content}
      </p>
      {answer.images.length > 0 ? (
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {answer.images.map((image) => (
            <img
              key={image.id}
              src={image.image_url}
              alt="답변 첨부 이미지"
              className="w-full rounded-lg border border-brand-line object-cover"
            />
          ))}
        </div>
      ) : null}
      <div className="mt-5">
        <button
          type="button"
          onClick={() => onHelpful(answer)}
          className={`focus-ring inline-flex items-center gap-2 rounded-md border px-4 py-2.5 text-sm font-black ${
            answer.my_helpful
              ? "border-brand-blue bg-blue-50 text-brand-blue"
              : "border-brand-line text-slate-700 hover:bg-slate-50"
          }`}
        >
          <ThumbsUp aria-hidden="true" className="h-4 w-4" />
          도움돼요 {answer.helpful_count}
        </button>
      </div>
    </article>
  );
}

export function QnaQuestionDetail({ postId }: QnaQuestionDetailProps) {
  const router = useRouter();
  const auth = useCommunityAuth();
  const [post, setPost] = useState<QnaPostDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [answerContent, setAnswerContent] = useState("");
  const [answerImages, setAnswerImages] = useState<QnaPendingImage[]>([]);
  const [answerSubmitting, setAnswerSubmitting] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [postDeleting, setPostDeleting] = useState(false);

  const loadPost = useCallback(async () => {
    setLoading(true);
    setMessage("");

    const response = await fetch(`/api/community/qna/posts/${postId}`, {
      headers: auth.token
        ? {
            Authorization: `Bearer ${auth.token}`
          }
        : undefined
    });
    const payload = (await response.json().catch(() => ({}))) as
      | QnaPostDetailResponse
      | ApiMessage;

    setLoading(false);

    if (!response.ok || !("post" in payload)) {
      setMessage(
        "message" in payload && payload.message
          ? payload.message
          : "질문을 불러오지 못했습니다."
      );
      return;
    }

    setPost(payload.post);
  }, [auth.token, postId]);

  useEffect(() => {
    if (auth.status === "loading") {
      return;
    }

    const timer = window.setTimeout(() => {
      void loadPost();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [auth.status, loadPost]);

  const handleLike = async () => {
    if (!auth.token || auth.status !== "ready" || !post) {
      setMessage(auth.status === "approval" ? auth.message : "로그인 후 이용할 수 있습니다.");
      return;
    }

    const response = await fetch(`/api/community/qna/posts/${post.id}/like`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${auth.token}`
      }
    });
    const payload = (await response.json().catch(() => ({}))) as
      | LikeResponse
      | ApiMessage;

    if (!response.ok || !("like_count" in payload)) {
      setMessage(
        "message" in payload && payload.message
          ? payload.message
          : "좋아요를 저장하지 못했습니다."
      );
      return;
    }

    setPost({
      ...post,
      like_count: payload.like_count,
      my_like: payload.my_like
    });
  };

  const handleAnswerSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!auth.token || auth.status !== "ready" || !post) {
      setMessage(auth.status === "approval" ? auth.message : "로그인 후 답변할 수 있습니다.");
      return;
    }

    const validation = validateQnaAnswerInput(answerContent);

    if (!validation.ok) {
      setMessage(validation.message);
      return;
    }

    setAnswerSubmitting(true);
    setMessage("");

    const formData = new FormData();
    formData.append("content", answerContent);
    answerImages.forEach((image) => formData.append("images", image.file));

    const response = await fetch(`/api/community/qna/posts/${post.id}/answers`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${auth.token}`
      },
      body: formData
    });
    const payload = (await response.json().catch(() => ({}))) as ApiMessage;

    setAnswerSubmitting(false);

    if (!response.ok) {
      setMessage(payload.message ?? "답변을 저장하지 못했습니다.");
      return;
    }

    setAnswerContent("");
    setAnswerImages([]);
    void loadPost();
  };

  const handleHelpful = async (answer: QnaAnswerView) => {
    if (!auth.token || auth.status !== "ready" || !post) {
      setMessage(auth.status === "approval" ? auth.message : "로그인 후 이용할 수 있습니다.");
      return;
    }

    const response = await fetch(`/api/community/qna/answers/${answer.id}/helpful`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${auth.token}`
      }
    });
    const payload = (await response.json().catch(() => ({}))) as
      | HelpfulResponse
      | ApiMessage;

    if (!response.ok || !("helpful_count" in payload)) {
      setMessage(
        "message" in payload && payload.message
          ? payload.message
          : "도움돼요를 저장하지 못했습니다."
      );
      return;
    }

    const nextAnswers = post.answers.map((item) =>
      item.id === answer.id
        ? {
            ...item,
            helpful_count: payload.helpful_count,
            my_helpful: payload.my_helpful
          }
        : item
    );

    setPost({
      ...post,
      helpful_count: nextAnswers.reduce((sum, item) => sum + item.helpful_count, 0),
      answers: nextAnswers
    });
  };

  const handleAcceptAnswer = async (answer: QnaAnswerView) => {
    if (!auth.token || !post) {
      return;
    }

    const response = await fetch(`/api/community/qna/answers/${answer.id}/accept`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${auth.token}`
      }
    });
    const payload = (await response.json().catch(() => ({}))) as ApiMessage;

    if (!response.ok) {
      setMessage(payload.message ?? "답변을 채택하지 못했습니다.");
      return;
    }

    void loadPost();
  };

  const handleDeleteAnswer = async (answer: QnaAnswerView) => {
    if (!auth.token || !window.confirm("답변을 삭제할까요?")) {
      return;
    }

    const response = await fetch(`/api/community/qna/answers/${answer.id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${auth.token}`
      }
    });
    const payload = (await response.json().catch(() => ({}))) as ApiMessage;

    if (!response.ok) {
      setMessage(payload.message ?? "답변을 삭제하지 못했습니다.");
      return;
    }

    void loadPost();
  };

  const handleDeletePost = async () => {
    if (!auth.token || !post) {
      return;
    }

    setPostDeleting(true);
    setMessage("");

    const response = await fetch(`/api/community/qna/posts/${post.id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${auth.token}`
      }
    });
    const payload = (await response.json().catch(() => ({}))) as ApiMessage;

    setPostDeleting(false);

    if (!response.ok) {
      setDeleteModalOpen(false);
      setMessage(payload.message ?? "질문을 삭제하지 못했습니다.");
      return;
    }

    router.push("/community/qna");
  };

  if (loading) {
    return (
      <main className="bg-white">
        <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
          <CommunityNoticeCard
            title="질문을 불러오는 중입니다"
            description="잠시만 기다려 주세요."
          />
        </section>
      </main>
    );
  }

  if (!post) {
    return (
      <main className="bg-white">
        <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
          <CommunityNoticeCard
            title="질문을 찾을 수 없습니다"
            description={message || "삭제되었거나 이동된 질문입니다."}
            actionHref="/community/qna"
            actionLabel="목록으로"
          />
        </section>
      </main>
    );
  }

  const showUpdatedAt =
    Math.abs(new Date(post.updated_at).getTime() - new Date(post.created_at).getTime()) >
    1000;

  return (
    <main className="bg-white">
      <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <Link
          href="/community/qna"
          className="focus-ring inline-flex items-center gap-2 rounded-md text-sm font-black text-brand-blue hover:text-brand-deep"
        >
          <ArrowLeft aria-hidden="true" className="h-4 w-4" />
          목록으로
        </Link>

        <article className="mt-6">
          <header className="border-b border-brand-line pb-6">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <QnaStatusBadge status={post.question?.question_status} />
              {post.question ? (
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-black text-slate-700">
                  {post.question.subject_area} · {post.question.subject_detail}
                </span>
              ) : null}
            </div>
            <h1 className="text-3xl font-black leading-tight text-brand-ink sm:text-4xl">
              {post.title}
            </h1>
            <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-brand-muted">
              <span className="font-bold text-slate-700">{post.author_name}</span>
              <span>{formatCommunityDateTime(post.created_at)}</span>
              {showUpdatedAt ? (
                <span>수정 {formatCommunityDateTime(post.updated_at)}</span>
              ) : null}
              <span className="inline-flex items-center gap-1">
                <Eye aria-hidden="true" className="h-4 w-4" />
                {post.view_count}
              </span>
              <span className="inline-flex items-center gap-1">
                <MessageSquare aria-hidden="true" className="h-4 w-4" />
                답변 {post.answer_count}
              </span>
            </div>
            {post.can_edit || post.can_delete ? (
              <div className="mt-5 flex flex-wrap gap-2">
                {post.can_edit ? (
                  <Link
                    href={`/community/qna/${post.id}/edit`}
                    className="focus-ring inline-flex items-center gap-2 rounded-md border border-brand-line px-4 py-2.5 text-sm font-black text-slate-700 hover:bg-slate-50"
                  >
                    <Pencil aria-hidden="true" className="h-4 w-4" />
                    수정
                  </Link>
                ) : null}
                {post.can_delete ? (
                  <button
                    type="button"
                    onClick={() => setDeleteModalOpen(true)}
                    className="focus-ring inline-flex items-center gap-2 rounded-md border border-red-200 px-4 py-2.5 text-sm font-black text-brand-red hover:bg-red-50"
                  >
                    <Trash2 aria-hidden="true" className="h-4 w-4" />
                    삭제
                  </button>
                ) : null}
              </div>
            ) : null}
          </header>

          <div className="whitespace-pre-wrap border-b border-brand-line py-10 text-base leading-8 text-brand-ink">
            {post.content}
          </div>

          {post.images.length > 0 ? (
            <div className="border-b border-brand-line py-8">
              <div className="grid gap-4 sm:grid-cols-2">
                {post.images.map((image) => (
                  <img
                    key={image.id}
                    src={image.image_url}
                    alt="질문 첨부 이미지"
                    className="w-full rounded-lg border border-brand-line object-cover"
                  />
                ))}
              </div>
            </div>
          ) : null}

          <div className="flex flex-wrap gap-2 border-b border-brand-line py-6">
            <button
              type="button"
              onClick={() => void handleLike()}
              className={`focus-ring inline-flex items-center gap-2 rounded-md border px-4 py-2.5 text-sm font-black ${
                post.my_like
                  ? "border-brand-blue bg-blue-50 text-brand-blue"
                  : "border-brand-line text-slate-700 hover:bg-slate-50"
              }`}
            >
              <ThumbsUp aria-hidden="true" className="h-4 w-4" />
              좋아요 {post.like_count}
            </button>
          </div>
        </article>

        <section className="py-8">
          <h2 className="text-2xl font-black text-brand-ink">답변 {post.answer_count}</h2>

          {auth.status === "ready" ? (
            <form onSubmit={handleAnswerSubmit} className="mt-5 space-y-4">
              <label htmlFor="answer-content" className="sr-only">
                답변
              </label>
              <textarea
                id="answer-content"
                value={answerContent}
                onChange={(event) => setAnswerContent(event.target.value)}
                maxLength={3000}
                placeholder="답변을 입력하세요."
                className="focus-ring min-h-36 w-full resize-y rounded-md border border-brand-line px-4 py-3 text-sm leading-7 text-brand-ink placeholder:text-slate-400"
              />
              <QnaImageUploader
                pendingImages={answerImages}
                onPendingImagesChange={setAnswerImages}
                onError={setMessage}
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={answerSubmitting}
                  className="focus-ring rounded-md bg-brand-blue px-5 py-3 text-sm font-black text-white hover:bg-brand-deep disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  {answerSubmitting ? "등록 중" : "답변 등록"}
                </button>
              </div>
            </form>
          ) : (
            <div className="mt-5 rounded-lg border border-brand-line bg-slate-50 px-4 py-4 text-sm font-bold text-brand-muted">
              <p>
                {auth.status === "approval"
                  ? auth.message
                  : "답변 작성은 로그인 후 가능합니다."}
              </p>
              {auth.status === "signed-out" ? (
                <Link
                  href={getLoginRedirectHref(`/community/qna/${postId}`)}
                  className="focus-ring mt-3 inline-flex rounded-md bg-brand-blue px-4 py-2 text-xs font-black text-white hover:bg-brand-deep"
                >
                  로그인
                </Link>
              ) : null}
            </div>
          )}

          {message ? (
            <p className="mt-4 rounded-md bg-red-50 px-4 py-3 text-sm font-black text-brand-red">
              {message}
            </p>
          ) : null}

          <div className="mt-8 space-y-4">
            {post.answers.length === 0 ? (
              <div className="rounded-lg border border-brand-line bg-white p-5 text-sm font-bold text-brand-muted">
                등록된 답변이 없습니다.
              </div>
            ) : null}

            {post.answers.map((answer) => (
              <AnswerArticle
                key={answer.id}
                answer={answer}
                canAcceptAnswer={post.can_accept_answer}
                onHelpful={handleHelpful}
                onAccept={handleAcceptAnswer}
                onDelete={handleDeleteAnswer}
              />
            ))}
          </div>
        </section>
      </section>

      <DeleteQuestionModal
        open={deleteModalOpen}
        busy={postDeleting}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeletePost}
      />
    </main>
  );
}
