"use client";

import { useCallback, useEffect, useState } from "react";
import { getSupabaseBrowserClient, getSupabaseConfigMessage } from "@/lib/supabase/client";
import { formatSubjectSummary } from "@/lib/subjects";
import type { SignupRequest, SubjectPreferenceInput } from "@/lib/supabase/types";

type RequestsState = {
  loading: boolean;
  message: string;
  requests: SignupRequest[];
};

const initialRequestsState: RequestsState = {
  loading: true,
  message: "",
  requests: []
};

function toSubjectInput(request: SignupRequest): SubjectPreferenceInput | null {
  if (!request.subjects) {
    return null;
  }

  return {
    korean_subject: request.subjects.korean_subject,
    math_subject: request.subjects.math_subject,
    english_subject: request.subjects.english_subject,
    history_subject: request.subjects.history_subject,
    inquiry_subject_1: request.subjects.inquiry_subject_1,
    inquiry_subject_2: request.subjects.inquiry_subject_2,
    second_language_subject: request.subjects.second_language_subject
  };
}

export function SignupRequestsTable() {
  const [state, setState] = useState(initialRequestsState);
  const [processingId, setProcessingId] = useState("");

  const loadRequests = useCallback(async () => {
    const supabase = getSupabaseBrowserClient();

    if (!supabase) {
      setState({
        loading: false,
        message: getSupabaseConfigMessage(),
        requests: []
      });
      return;
    }

    const {
      data: { session }
    } = await supabase.auth.getSession();

    if (!session) {
      setState({
        loading: false,
        message: "로그인이 필요합니다.",
        requests: []
      });
      return;
    }

    const response = await fetch("/api/admin/signup-requests", {
      headers: {
        Authorization: `Bearer ${session.access_token}`
      }
    });
    const result = (await response.json()) as {
      message?: string;
      requests?: SignupRequest[];
    };

    if (!response.ok) {
      setState({
        loading: false,
        message: result.message ?? "회원가입 신청 목록을 불러올 수 없습니다.",
        requests: []
      });
      return;
    }

    setState({
      loading: false,
      message: "",
      requests: result.requests ?? []
    });
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadRequests();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadRequests]);

  const handleDecision = async (id: string, action: "approve" | "reject") => {
    const supabase = getSupabaseBrowserClient();
    const {
      data: { session }
    } = (await supabase?.auth.getSession()) ?? { data: { session: null } };

    if (!session) {
      setState((current) => ({ ...current, message: "로그인이 필요합니다." }));
      return;
    }

    setProcessingId(id);

    const response = await fetch(`/api/admin/signup-requests/${id}/${action}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.access_token}`
      }
    });
    const result = (await response.json()) as { message?: string };

    if (!response.ok) {
      setState((current) => ({
        ...current,
        message: result.message ?? "처리 중 오류가 발생했습니다."
      }));
      setProcessingId("");
      return;
    }

    await loadRequests();
    setProcessingId("");
  };

  if (state.loading) {
    return (
      <div className="rounded-xl border border-brand-line bg-white p-6 text-sm font-bold text-brand-muted">
        가입 신청 목록을 불러오는 중입니다.
      </div>
    );
  }

  if (state.message) {
    return (
      <div className="rounded-xl border border-brand-line bg-white p-6">
        <h2 className="text-2xl font-black text-brand-ink">안내</h2>
        <p className="mt-3 text-sm leading-6 text-brand-muted">{state.message}</p>
      </div>
    );
  }

  if (state.requests.length === 0) {
    return (
      <div className="rounded-xl border border-brand-line bg-white p-6 text-sm font-bold text-brand-muted">
        가입 대기 회원이 없습니다.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {state.requests.map((request) => {
        const subjects = toSubjectInput(request);

        return (
          <article
            key={request.profile.id}
            className="rounded-xl border border-brand-line bg-white p-6"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-brand-blue">
                  {request.profile.username}
                </p>
                <h2 className="mt-1 text-xl font-black text-brand-ink">
                  {request.profile.name}
                </h2>
                <p className="mt-2 text-sm font-semibold text-brand-muted">
                  {request.profile.grade}학년 {request.profile.class_number}반{" "}
                  {request.profile.student_number}번 · 신청일{" "}
                  {request.profile.created_at.slice(0, 10)}
                </p>
              </div>
              <span className="rounded-full bg-blue-50 px-4 py-2 text-sm font-black text-brand-blue">
                {request.profile.status}
              </span>
            </div>
            <div className="mt-5 grid gap-2 text-sm font-semibold leading-6 text-brand-muted sm:grid-cols-2">
              {(subjects ? formatSubjectSummary(subjects) : ["선택과목 정보 없음"]).map(
                (line) => (
                  <p key={line}>{line}</p>
                )
              )}
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                disabled={processingId === request.profile.id}
                onClick={() => handleDecision(request.profile.id, "approve")}
                className="focus-ring rounded-md bg-brand-blue px-5 py-3 text-sm font-black text-white hover:bg-brand-deep disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                승인
              </button>
              <button
                type="button"
                disabled={processingId === request.profile.id}
                onClick={() => handleDecision(request.profile.id, "reject")}
                className="focus-ring rounded-md border border-red-700 px-5 py-3 text-sm font-black text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:border-slate-300 disabled:text-slate-400"
              >
                반려
              </button>
            </div>
          </article>
        );
      })}
    </div>
  );
}
