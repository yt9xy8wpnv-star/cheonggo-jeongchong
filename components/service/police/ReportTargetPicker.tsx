"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Search, X } from "lucide-react";
import { formatCommunityDate } from "@/components/community/communityFormat";
import {
  policeTargetBoards,
  type PoliceTargetChildItem,
  type PoliceTargetDetailResponse,
  type PoliceTargetListItem,
  type PoliceTargetsResponse
} from "@/lib/police";
import type { PoliceTargetType } from "@/lib/supabase/types";

export type SelectedPoliceTarget = {
  target_type: PoliceTargetType;
  target_id: string;
  target_label: string;
  target_author_name: string;
  board_label: string;
  content_preview?: string;
};

type ReportTargetPickerProps = {
  token: string;
  selectedTarget: SelectedPoliceTarget | null;
  onSelect: (target: SelectedPoliceTarget) => void;
  onError: (message: string) => void;
};

type TargetListState =
  | { status: "idle"; data: null; message: "" }
  | { status: "loading"; data: null; message: "" }
  | { status: "ready"; data: PoliceTargetsResponse; message: "" }
  | { status: "error"; data: null; message: string };

function getTargetTypeLabel(type: PoliceTargetType) {
  if (type === "post") {
    return "게시글";
  }

  if (type === "answer") {
    return "답변";
  }

  return "댓글";
}

function getPreview(value: string) {
  const normalized = value.replace(/\s+/g, " ").trim();

  return normalized.length > 80 ? `${normalized.slice(0, 80)}...` : normalized;
}

export function ReportTargetPicker({
  token,
  selectedTarget,
  onSelect,
  onError
}: ReportTargetPickerProps) {
  const [open, setOpen] = useState(false);
  const [queryInput, setQueryInput] = useState("");
  const [query, setQuery] = useState("");
  const [board, setBoard] = useState("all");
  const [page, setPage] = useState(1);
  const [state, setState] = useState<TargetListState>({
    status: "idle",
    data: null,
    message: ""
  });
  const [expandedPostId, setExpandedPostId] = useState("");
  const [detail, setDetail] = useState<PoliceTargetDetailResponse | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const loadTargets = useCallback(async () => {
    if (!open) {
      return;
    }

    setState({ status: "loading", data: null, message: "" });

    const params = new URLSearchParams();

    if (query.trim()) {
      params.set("q", query.trim());
    }

    if (board !== "all") {
      params.set("board", board);
    }

    if (page > 1) {
      params.set("page", String(page));
    }

    const response = await fetch(`/api/police/targets?${params.toString()}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    const payload = (await response.json().catch(() => ({}))) as
      | PoliceTargetsResponse
      | { message?: string };

    if (!response.ok || !("posts" in payload)) {
      setState({
        status: "error",
        data: null,
        message:
          "message" in payload && payload.message
            ? payload.message
            : "신고 대상 목록을 불러오지 못했습니다."
      });
      return;
    }

    setState({ status: "ready", data: payload, message: "" });
  }, [board, open, page, query, token]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadTargets();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadTargets]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setQuery(queryInput);
    setPage(1);
    setExpandedPostId("");
    setDetail(null);
  };

  const openPostDetail = async (postId: string) => {
    if (expandedPostId === postId) {
      setExpandedPostId("");
      setDetail(null);
      return;
    }

    setExpandedPostId(postId);
    setDetail(null);
    setDetailLoading(true);

    const response = await fetch(`/api/police/targets/${postId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    const payload = (await response.json().catch(() => ({}))) as
      | PoliceTargetDetailResponse
      | { message?: string };

    setDetailLoading(false);

    if (!response.ok || !("post" in payload)) {
      onError(
        "message" in payload && payload.message
          ? payload.message
          : "게시글 세부 대상을 불러오지 못했습니다."
      );
      return;
    }

    setDetail(payload);
  };

  const selectPost = (post: PoliceTargetListItem) => {
    onSelect({
      target_type: "post",
      target_id: post.id,
      target_label: `[${post.board_label}] ${post.title}`,
      target_author_name: post.author_name,
      board_label: post.board_label
    });
    setOpen(false);
  };

  const selectChild = (
    post: PoliceTargetListItem,
    item: PoliceTargetChildItem
  ) => {
    onSelect({
      target_type: item.target_type,
      target_id: item.id,
      target_label: `[${post.board_label}] ${getTargetTypeLabel(item.target_type)}`,
      target_author_name: item.author_name,
      board_label: post.board_label,
      content_preview: getPreview(item.content)
    });
    setOpen(false);
  };

  const posts = state.status === "ready" ? state.data.posts : [];
  const pagination = state.status === "ready" ? state.data.pagination : null;

  return (
    <div>
      <div className="flex flex-col gap-3 rounded-lg border border-brand-line bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-black text-brand-ink">신고대상</p>
          {selectedTarget ? (
            <div className="mt-2 text-sm leading-6">
              <p className="font-black text-brand-blue">{selectedTarget.target_label}</p>
              <p className="text-brand-muted">
                작성자: {selectedTarget.target_author_name} · 대상 유형:{" "}
                {getTargetTypeLabel(selectedTarget.target_type)}
              </p>
              {selectedTarget.content_preview ? (
                <p className="mt-1 text-brand-muted">
                  내용: {selectedTarget.content_preview}
                </p>
              ) : null}
            </div>
          ) : (
            <p className="mt-1 text-sm text-brand-muted">
              신고할 게시글, 댓글 또는 답변을 선택해 주세요.
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="focus-ring rounded-md bg-brand-blue px-5 py-3 text-sm font-black text-white hover:bg-brand-deep"
        >
          신고대상 선택
        </button>
      </div>

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 py-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="police-target-picker-title"
        >
          <div className="flex max-h-[86vh] w-full max-w-4xl flex-col rounded-xl border border-brand-line bg-white">
            <div className="flex items-center justify-between border-b border-brand-line px-5 py-4">
              <div>
                <h2
                  id="police-target-picker-title"
                  className="text-xl font-black text-brand-ink"
                >
                  신고할 게시물 또는 댓글 선택
                </h2>
                <p className="mt-1 text-sm text-brand-muted">
                  자유게시판, 공부 인증, 질문 게시판의 공개 글만 표시됩니다.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="focus-ring rounded-md border border-brand-line p-2 text-slate-600 hover:bg-slate-50"
                aria-label="닫기"
              >
                <X aria-hidden="true" className="h-5 w-5" />
              </button>
            </div>

            <div className="border-b border-brand-line p-5">
              <form onSubmit={handleSearch} className="grid gap-3 md:grid-cols-[1fr_auto]">
                <label className="relative">
                  <span className="sr-only">신고 대상 검색</span>
                  <Search
                    aria-hidden="true"
                    className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    value={queryInput}
                    onChange={(event) => setQueryInput(event.target.value)}
                    placeholder="제목 또는 작성자 검색"
                    className="focus-ring w-full rounded-md border border-brand-line py-3 pl-10 pr-4 text-sm font-bold text-brand-ink"
                  />
                </label>
                <div className="flex gap-2">
                  <select
                    value={board}
                    onChange={(event) => {
                      setBoard(event.target.value);
                      setPage(1);
                      setExpandedPostId("");
                      setDetail(null);
                    }}
                    className="focus-ring rounded-md border border-brand-line bg-white px-3 py-3 text-sm font-bold text-brand-ink"
                  >
                    {policeTargetBoards.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <button
                    type="submit"
                    className="focus-ring rounded-md border border-brand-blue px-4 py-3 text-sm font-black text-brand-blue hover:bg-blue-50"
                  >
                    검색
                  </button>
                </div>
              </form>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-5">
              {state.status === "loading" ? (
                <div className="py-12 text-center text-sm font-bold text-brand-muted">
                  신고 대상을 불러오는 중입니다.
                </div>
              ) : null}

              {state.status === "error" ? (
                <div className="py-12 text-center text-sm font-bold text-brand-red">
                  {state.message}
                </div>
              ) : null}

              {state.status === "ready" && posts.length === 0 ? (
                <div className="py-12 text-center text-sm font-bold text-brand-muted">
                  선택할 수 있는 신고 대상이 없습니다.
                </div>
              ) : null}

              <div className="space-y-3">
                {posts.map((post) => (
                  <article
                    key={post.id}
                    className="rounded-lg border border-brand-line bg-white p-4"
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div className="min-w-0">
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-black text-slate-700">
                          {post.board_label}
                        </span>
                        <h3 className="mt-3 truncate text-base font-black text-brand-ink">
                          {post.title}
                        </h3>
                        <p className="mt-1 text-sm text-brand-muted">
                          {post.author_name} · {formatCommunityDate(post.created_at)}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => selectPost(post)}
                          className="focus-ring rounded-md bg-brand-blue px-4 py-2.5 text-sm font-black text-white hover:bg-brand-deep"
                        >
                          게시글 신고
                        </button>
                        <button
                          type="button"
                          onClick={() => void openPostDetail(post.id)}
                          className="focus-ring rounded-md border border-brand-line px-4 py-2.5 text-sm font-black text-slate-700 hover:bg-slate-50"
                        >
                          댓글/답변 보기
                        </button>
                      </div>
                    </div>

                    {expandedPostId === post.id ? (
                      <div className="mt-4 border-t border-brand-line pt-4">
                        {detailLoading ? (
                          <p className="text-sm font-bold text-brand-muted">
                            세부 대상을 불러오는 중입니다.
                          </p>
                        ) : null}

                        {detail && detail.post.id === post.id ? (
                          <div className="space-y-2">
                            {[...detail.comments, ...detail.answers].length === 0 ? (
                              <p className="text-sm font-bold text-brand-muted">
                                선택할 댓글 또는 답변이 없습니다.
                              </p>
                            ) : null}
                            {[...detail.comments, ...detail.answers].map((item) => (
                              <button
                                key={`${item.target_type}-${item.id}`}
                                type="button"
                                onClick={() => selectChild(detail.post, item)}
                                className="focus-ring block w-full rounded-md border border-brand-line bg-slate-50 p-3 text-left hover:bg-white"
                              >
                                <p className="text-xs font-black text-brand-blue">
                                  {getTargetTypeLabel(item.target_type)} · {item.author_name} ·{" "}
                                  {formatCommunityDate(item.created_at)}
                                </p>
                                <p className="mt-1 text-sm leading-6 text-brand-ink">
                                  {getPreview(item.content)}
                                </p>
                              </button>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    ) : null}
                  </article>
                ))}
              </div>
            </div>

            {pagination ? (
              <div className="flex items-center justify-between border-t border-brand-line px-5 py-4">
                <p className="text-sm font-bold text-brand-muted">
                  총 {pagination.total}개 · {pagination.page}/{pagination.total_pages}
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPage((current) => Math.max(current - 1, 1))}
                    disabled={pagination.page <= 1}
                    className="focus-ring inline-flex items-center gap-1 rounded-md border border-brand-line px-3 py-2 text-sm font-black text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronLeft aria-hidden="true" className="h-4 w-4" />
                    이전
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setPage((current) =>
                        Math.min(current + 1, pagination.total_pages)
                      )
                    }
                    disabled={pagination.page >= pagination.total_pages}
                    className="focus-ring inline-flex items-center gap-1 rounded-md border border-brand-line px-3 py-2 text-sm font-black text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    다음
                    <ChevronRight aria-hidden="true" className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
