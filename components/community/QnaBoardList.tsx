"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Image as ImageIcon,
  MessageSquare,
  Pencil,
  Search,
  ThumbsUp
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { CommunityNoticeCard } from "@/components/community/CommunityNoticeCard";
import { formatCommunityDate } from "@/components/community/communityFormat";
import { QnaStatusBadge } from "@/components/community/QnaStatusBadge";
import { useCommunityAuth } from "@/components/community/useCommunityAuth";
import {
  normalizePage,
  normalizeQnaSort,
  normalizeQnaStatus,
  qnaSortOptions,
  qnaStatusOptions,
  type QnaPostsResponse
} from "@/lib/community";
import { qnaSubjectAreas } from "@/lib/qnaSubjects";

type BoardListState =
  | { status: "loading"; data: null; message: "" }
  | { status: "ready"; data: QnaPostsResponse; message: "" }
  | { status: "error"; data: null; message: string };

function buildQueryString({
  q,
  status,
  subjectArea,
  sort,
  page
}: {
  q: string;
  status: string;
  subjectArea: string;
  sort: string;
  page: number;
}) {
  const params = new URLSearchParams();

  if (q.trim()) {
    params.set("q", q.trim());
  }

  if (status !== "all") {
    params.set("status", status);
  }

  if (subjectArea !== "all") {
    params.set("subjectArea", subjectArea);
  }

  if (sort !== "latest") {
    params.set("sort", sort);
  }

  if (page > 1) {
    params.set("page", String(page));
  }

  return params.toString();
}

export function QnaBoardList() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const auth = useCommunityAuth();
  const currentQ = searchParams.get("q") ?? "";
  const currentStatus = normalizeQnaStatus(searchParams.get("status"));
  const currentSubjectArea = searchParams.get("subjectArea") ?? "all";
  const currentSort = normalizeQnaSort(searchParams.get("sort"));
  const currentPage = normalizePage(searchParams.get("page"));
  const [searchInput, setSearchInput] = useState(currentQ);
  const [state, setState] = useState<BoardListState>({
    status: "loading",
    data: null,
    message: ""
  });
  const requestUrl = useMemo(() => {
    const params = buildQueryString({
      q: currentQ,
      status: currentStatus,
      subjectArea: currentSubjectArea,
      sort: currentSort,
      page: currentPage
    });

    return `/api/community/qna/posts${params ? `?${params}` : ""}`;
  }, [currentPage, currentQ, currentSort, currentStatus, currentSubjectArea]);

  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setState({ status: "loading", data: null, message: "" });

      try {
        const response = await fetch(requestUrl, {
          signal: controller.signal
        });
        const payload = (await response.json().catch(() => ({}))) as
          | QnaPostsResponse
          | { message?: string };

        if (!response.ok) {
          setState({
            status: "error",
            data: null,
            message:
              "message" in payload && payload.message
                ? payload.message
                : "질문 목록을 불러오지 못했습니다."
          });
          return;
        }

        setState({
          status: "ready",
          data: payload as QnaPostsResponse,
          message: ""
        });
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          setState({
            status: "error",
            data: null,
            message: "네트워크 연결을 확인해 주세요."
          });
        }
      }
    }, 0);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [requestUrl]);

  const moveTo = (next: {
    q?: string;
    status?: string;
    subjectArea?: string;
    sort?: string;
    page?: number;
  }) => {
    const queryString = buildQueryString({
      q: next.q ?? currentQ,
      status: next.status ?? currentStatus,
      subjectArea: next.subjectArea ?? currentSubjectArea,
      sort: next.sort ?? currentSort,
      page: next.page ?? currentPage
    });

    router.push(`${pathname}${queryString ? `?${queryString}` : ""}`);
  };

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    moveTo({ q: searchInput, page: 1 });
  };

  const pagination = state.status === "ready" ? state.data.pagination : null;
  const posts = state.status === "ready" ? state.data.posts : [];

  return (
    <main className="bg-white">
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-5 border-b border-brand-line pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-bold text-brand-blue">Question Board</p>
            <h1 className="mt-2 text-3xl font-black text-brand-ink">질문 게시판</h1>
            <p className="mt-3 text-sm leading-7 text-brand-muted">
              과목별 질문을 올리고 청고정총 회원들의 답변을 받을 수 있습니다.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {auth.status === "ready" ? (
              <Link
                href="/community/qna/write"
                className="focus-ring inline-flex items-center gap-2 rounded-md bg-brand-blue px-5 py-3 text-sm font-black text-white hover:bg-brand-deep"
              >
                <Pencil aria-hidden="true" className="h-4 w-4" />
                질문하기
              </Link>
            ) : auth.status === "approval" ? (
              <span className="inline-flex items-center gap-2 rounded-md border border-brand-line px-5 py-3 text-sm font-black text-brand-muted">
                <Pencil aria-hidden="true" className="h-4 w-4" />
                승인 후 질문
              </span>
            ) : (
              <Link
                href="/login"
                className="focus-ring inline-flex items-center gap-2 rounded-md border border-brand-blue px-5 py-3 text-sm font-black text-brand-blue hover:bg-blue-50"
              >
                <Pencil aria-hidden="true" className="h-4 w-4" />
                로그인 후 질문
              </Link>
            )}
          </div>
        </div>

        <div className="mt-6 grid gap-3 lg:grid-cols-[1fr_auto_auto_auto] lg:items-center">
          <form onSubmit={handleSearch} className="relative w-full">
            <label htmlFor="qna-board-search" className="sr-only">
              질문 검색
            </label>
            <Search
              aria-hidden="true"
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            />
            <input
              id="qna-board-search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="제목, 내용, 과목 검색"
              className="focus-ring w-full rounded-md border border-brand-line bg-white py-3 pl-10 pr-4 text-sm font-bold text-brand-ink placeholder:text-slate-400"
            />
          </form>
          <label className="flex items-center gap-2 text-sm font-bold text-brand-muted">
            상태
            <select
              value={currentStatus}
              onChange={(event) => moveTo({ status: event.target.value, page: 1 })}
              className="focus-ring min-w-32 rounded-md border border-brand-line bg-white px-3 py-3 text-sm font-bold text-brand-ink"
            >
              {qnaStatusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-2 text-sm font-bold text-brand-muted">
            과목
            <select
              value={currentSubjectArea}
              onChange={(event) => moveTo({ subjectArea: event.target.value, page: 1 })}
              className="focus-ring min-w-36 rounded-md border border-brand-line bg-white px-3 py-3 text-sm font-bold text-brand-ink"
            >
              <option value="all">전체</option>
              {qnaSubjectAreas.map((area) => (
                <option key={area} value={area}>
                  {area}
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-2 text-sm font-bold text-brand-muted">
            정렬
            <select
              value={currentSort}
              onChange={(event) => moveTo({ sort: event.target.value, page: 1 })}
              className="focus-ring min-w-36 rounded-md border border-brand-line bg-white px-3 py-3 text-sm font-bold text-brand-ink"
            >
              {qnaSortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        {auth.status === "approval" ? (
          <div className="mt-5">
            <CommunityNoticeCard
              title="작성 권한 승인 대기 중입니다"
              description={auth.message}
            />
          </div>
        ) : null}

        <div className="mt-8 overflow-hidden border-y border-brand-line">
          {state.status === "loading" ? (
            <div className="py-16 text-center text-sm font-bold text-brand-muted">
              질문을 불러오는 중입니다.
            </div>
          ) : null}

          {state.status === "error" ? (
            <div className="py-16 text-center text-sm font-bold text-brand-red">
              {state.message}
            </div>
          ) : null}

          {state.status === "ready" && posts.length === 0 ? (
            <div className="flex flex-col items-center gap-4 py-16 text-center">
              <p className="text-sm font-bold text-brand-muted">
                등록된 질문이 없습니다.
              </p>
              {auth.status === "ready" ? (
                <Link
                  href="/community/qna/write"
                  className="focus-ring rounded-md bg-brand-blue px-5 py-3 text-sm font-black text-white hover:bg-brand-deep"
                >
                  질문하기
                </Link>
              ) : null}
            </div>
          ) : null}

          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/community/qna/${post.id}`}
              className="focus-ring group grid gap-3 border-b border-brand-line px-1 py-5 last:border-b-0 md:grid-cols-[1fr_260px] md:items-center"
            >
              <div className="min-w-0">
                <div className="flex min-w-0 flex-wrap items-center gap-2">
                  <QnaStatusBadge status={post.question?.question_status} />
                  {post.question ? (
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-black text-slate-700">
                      {post.question.subject_area} · {post.question.subject_detail}
                    </span>
                  ) : null}
                  {post.image_count > 0 ? (
                    <ImageIcon
                      aria-label="첨부 이미지 있음"
                      className="h-4 w-4 shrink-0 text-slate-400"
                    />
                  ) : null}
                </div>
                <h2 className="mt-3 truncate text-lg font-black text-brand-ink group-hover:text-brand-blue">
                  {post.title}
                </h2>
                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-brand-muted">
                  <span className="font-bold text-slate-700">{post.author_name}</span>
                  <span>{formatCommunityDate(post.created_at)}</span>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-sm font-bold text-brand-muted md:justify-end">
                <span className="inline-flex items-center gap-1">
                  <Eye aria-hidden="true" className="h-4 w-4" />
                  {post.view_count}
                </span>
                <span className="inline-flex items-center gap-1">
                  <MessageSquare aria-hidden="true" className="h-4 w-4" />
                  {post.answer_count}
                </span>
                <span className="inline-flex items-center gap-1">
                  <ThumbsUp aria-hidden="true" className="h-4 w-4" />
                  {post.helpful_count}
                </span>
              </div>
            </Link>
          ))}
        </div>

        {pagination ? (
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-bold text-brand-muted">
              총 {pagination.total}개 · {pagination.page}/{pagination.total_pages}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => moveTo({ page: pagination.page - 1 })}
                disabled={pagination.page <= 1}
                className="focus-ring inline-flex items-center gap-1 rounded-md border border-brand-line px-4 py-2.5 text-sm font-black text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft aria-hidden="true" className="h-4 w-4" />
                이전
              </button>
              <button
                type="button"
                onClick={() => moveTo({ page: pagination.page + 1 })}
                disabled={pagination.page >= pagination.total_pages}
                className="focus-ring inline-flex items-center gap-1 rounded-md border border-brand-line px-4 py-2.5 text-sm font-black text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                다음
                <ChevronRight aria-hidden="true" className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : null}
      </section>
    </main>
  );
}
