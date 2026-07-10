"use client";

/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Eye,
  MessageSquare,
  Pencil,
  ThumbsDown,
  ThumbsUp,
  Trash2
} from "lucide-react";
import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { CommunityNoticeCard } from "@/components/community/CommunityNoticeCard";
import { formatCommunityDateTime } from "@/components/community/communityFormat";
import { StudyCertificationCard } from "@/components/community/StudyCertificationCard";
import { useCommunityAuth } from "@/components/community/useCommunityAuth";
import { getLoginRedirectHref } from "@/lib/redirect";
import {
  validateCommentInput,
  type CommunityReactionResponse,
  type StudyPostDetail as StudyPostDetailType,
  type StudyPostDetailResponse
} from "@/lib/community";
import type { CommunityReactionType } from "@/lib/supabase/types";

type StudyPostDetailProps = {
  postId: string;
};

type ApiMessage = {
  message?: string;
};

function DeletePostModal({
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
      aria-labelledby="delete-study-post-title"
    >
      <div className="w-full max-w-md rounded-xl border border-brand-line bg-white p-6 shadow-xl">
        <h2 id="delete-study-post-title" className="text-xl font-black text-brand-ink">
          게시글을 삭제할까요?
        </h2>
        <p className="mt-3 text-sm leading-7 text-brand-muted">
          삭제된 게시글은 목록과 상세 화면에 표시되지 않습니다.
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

function ReactionButton({
  active,
  count,
  label,
  reactionType,
  onClick
}: {
  active: boolean;
  count: number;
  label: string;
  reactionType: CommunityReactionType;
  onClick: (reactionType: CommunityReactionType) => void;
}) {
  const Icon = reactionType === "like" ? ThumbsUp : ThumbsDown;

  return (
    <button
      type="button"
      onClick={() => onClick(reactionType)}
      className={`focus-ring inline-flex items-center gap-2 rounded-md border px-4 py-2.5 text-sm font-black ${
        active
          ? "border-brand-blue bg-blue-50 text-brand-blue"
          : "border-brand-line text-slate-700 hover:bg-slate-50"
      }`}
    >
      <Icon aria-hidden="true" className="h-4 w-4" />
      {label} {count}
    </button>
  );
}

export function StudyPostDetail({ postId }: StudyPostDetailProps) {
  const router = useRouter();
  const auth = useCommunityAuth();
  const [post, setPost] = useState<StudyPostDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [commentContent, setCommentContent] = useState("");
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [postDeleting, setPostDeleting] = useState(false);

  const loadPost = useCallback(async () => {
    setLoading(true);
    setMessage("");

    const response = await fetch(`/api/community/study/posts/${postId}`, {
      headers: auth.token
        ? {
            Authorization: `Bearer ${auth.token}`
          }
        : undefined
    });
    const payload = (await response.json().catch(() => ({}))) as
      | StudyPostDetailResponse
      | ApiMessage;

    setLoading(false);

    if (!response.ok || !("post" in payload)) {
      setMessage(
        "message" in payload && payload.message
          ? payload.message
          : "게시글을 불러오지 못했습니다."
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

  const handleReaction = async (reactionType: CommunityReactionType) => {
    if (!auth.token || auth.status !== "ready" || !post) {
      setMessage(auth.status === "approval" ? auth.message : "로그인 후 이용할 수 있습니다.");
      return;
    }

    const response = await fetch(`/api/community/study/posts/${post.id}/reaction`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${auth.token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ reaction_type: reactionType })
    });
    const payload = (await response.json().catch(() => ({}))) as
      | CommunityReactionResponse
      | ApiMessage;

    if (!response.ok || !("like_count" in payload)) {
      setMessage(
        "message" in payload && payload.message ? payload.message : "반응을 저장하지 못했습니다."
      );
      return;
    }

    setPost({
      ...post,
      like_count: payload.like_count,
      dislike_count: payload.dislike_count,
      my_reaction: payload.my_reaction
    });
  };

  const handleCommentSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!auth.token || auth.status !== "ready" || !post) {
      setMessage(auth.status === "approval" ? auth.message : "로그인 후 댓글을 작성할 수 있습니다.");
      return;
    }

    const validation = validateCommentInput(commentContent);

    if (!validation.ok) {
      setMessage(validation.message);
      return;
    }

    setCommentSubmitting(true);
    setMessage("");

    const response = await fetch(`/api/community/study/posts/${post.id}/comments`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${auth.token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ content: commentContent })
    });
    const payload = (await response.json().catch(() => ({}))) as ApiMessage;

    setCommentSubmitting(false);

    if (!response.ok) {
      setMessage(payload.message ?? "댓글을 저장하지 못했습니다.");
      return;
    }

    setCommentContent("");
    void loadPost();
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!auth.token || !window.confirm("댓글을 삭제할까요?")) {
      return;
    }

    const response = await fetch(`/api/community/study/comments/${commentId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${auth.token}`
      }
    });
    const payload = (await response.json().catch(() => ({}))) as ApiMessage;

    if (!response.ok) {
      setMessage(payload.message ?? "댓글을 삭제하지 못했습니다.");
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

    const response = await fetch(`/api/community/study/posts/${post.id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${auth.token}`
      }
    });
    const payload = (await response.json().catch(() => ({}))) as ApiMessage;

    setPostDeleting(false);

    if (!response.ok) {
      setDeleteModalOpen(false);
      setMessage(payload.message ?? "게시글을 삭제하지 못했습니다.");
      return;
    }

    router.push("/community/study");
  };

  if (loading) {
    return (
      <main className="bg-white">
        <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
          <CommunityNoticeCard
            title="게시글을 불러오는 중입니다"
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
            title="게시글을 찾을 수 없습니다"
            description={message || "삭제되었거나 이동된 게시글입니다."}
            actionHref="/community/study"
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
          href="/community/study"
          className="focus-ring inline-flex items-center gap-2 rounded-md text-sm font-black text-brand-blue hover:text-brand-deep"
        >
          <ArrowLeft aria-hidden="true" className="h-4 w-4" />
          목록으로
        </Link>

        <article className="mt-6">
          <header className="border-b border-brand-line pb-6">
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
                {post.comment_count}
              </span>
            </div>
          </header>

          <div className="border-b border-brand-line py-8">
            <StudyCertificationCard certification={post.certification} />
          </div>

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
                    alt="첨부 이미지"
                    className="w-full rounded-lg border border-brand-line object-cover"
                  />
                ))}
              </div>
            </div>
          ) : null}

          <div className="flex flex-wrap gap-2 border-b border-brand-line py-6">
            <ReactionButton
              active={post.my_reaction === "like"}
              count={post.like_count}
              label="좋아요"
              reactionType="like"
              onClick={handleReaction}
            />
            <ReactionButton
              active={post.my_reaction === "dislike"}
              count={post.dislike_count}
              label="싫어요"
              reactionType="dislike"
              onClick={handleReaction}
            />
          </div>

          {post.can_edit || post.can_delete ? (
            <div className="flex flex-wrap gap-2 border-b border-brand-line py-5">
              {post.can_edit ? (
                <Link
                  href={`/community/study/${post.id}/edit`}
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
        </article>

        <section className="py-8">
          <h2 className="text-2xl font-black text-brand-ink">댓글 {post.comment_count}</h2>

          {auth.status === "ready" ? (
            <form onSubmit={handleCommentSubmit} className="mt-5">
              <label htmlFor="study-comment-content" className="sr-only">
                댓글
              </label>
              <textarea
                id="study-comment-content"
                value={commentContent}
                onChange={(event) => setCommentContent(event.target.value)}
                maxLength={2000}
                className="focus-ring min-h-28 w-full resize-y rounded-md border border-brand-line px-4 py-3 text-sm leading-7 text-brand-ink"
              />
              <div className="mt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={commentSubmitting}
                  className="focus-ring rounded-md bg-brand-blue px-5 py-3 text-sm font-black text-white hover:bg-brand-deep disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  {commentSubmitting ? "등록 중" : "댓글 등록"}
                </button>
              </div>
            </form>
          ) : (
            <div className="mt-5 rounded-lg border border-brand-line bg-slate-50 px-4 py-4 text-sm font-bold text-brand-muted">
              <p>
                {auth.status === "approval"
                  ? auth.message
                  : "댓글 작성은 로그인 후 가능합니다."}
              </p>
              {auth.status === "signed-out" ? (
                <Link
                  href={getLoginRedirectHref(`/community/study/${postId}`)}
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
            {post.comments.length === 0 ? (
              <div className="rounded-lg border border-brand-line bg-white p-5 text-sm font-bold text-brand-muted">
                등록된 댓글이 없습니다.
              </div>
            ) : null}

            {post.comments.map((comment) => (
              <article
                key={comment.id}
                className="rounded-lg border border-brand-line bg-white p-5"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="font-black text-brand-ink">{comment.author_name}</p>
                    <p className="mt-1 text-xs font-bold text-brand-muted">
                      {formatCommunityDateTime(comment.created_at)}
                    </p>
                  </div>
                  {comment.can_delete ? (
                    <button
                      type="button"
                      onClick={() => void handleDeleteComment(comment.id)}
                      className="focus-ring inline-flex items-center gap-1 rounded-md text-sm font-black text-brand-red hover:text-red-800"
                    >
                      <Trash2 aria-hidden="true" className="h-4 w-4" />
                      삭제
                    </button>
                  ) : null}
                </div>
                <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-brand-ink">
                  {comment.content}
                </p>
              </article>
            ))}
          </div>
        </section>
      </section>

      <DeletePostModal
        open={deleteModalOpen}
        busy={postDeleting}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeletePost}
      />
    </main>
  );
}
