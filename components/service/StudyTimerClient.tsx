"use client";

import Link from "next/link";
import { AlertTriangle, Clock3, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { StudyRanking } from "@/components/service/StudyRanking";
import { SubjectTimerRow } from "@/components/service/SubjectTimerRow";
import { getSupabaseBrowserClient, getSupabaseConfigMessage } from "@/lib/supabase/client";
import { formatDurationShort, formatSeconds } from "@/lib/time";
import {
  getLiveActiveElapsedSeconds,
  getLiveSubjectTotals,
  getLiveTotalSeconds,
  type StudyRankingResponse,
  type StudySubjectOption,
  type StudyTimerMeResponse
} from "@/lib/studyTimer";
import type { Profile, ProfileStatus } from "@/lib/supabase/types";

type ViewState = "loading" | "config" | "signed-out" | "approval" | "ready" | "error";

type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; message: string; status: number };

type MutationResponse = {
  message: string;
  snapshot: StudyTimerMeResponse;
};

async function apiRequest<T>(
  token: string,
  url: string,
  init?: RequestInit
): Promise<ApiResult<T>> {
  try {
    const response = await fetch(url, {
      ...init,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });
    const payload = (await response.json().catch(() => ({}))) as {
      message?: string;
    };

    if (!response.ok) {
      return {
        ok: false,
        status: response.status,
        message: payload.message ?? "요청을 처리하지 못했습니다."
      };
    }

    return { ok: true, data: payload as T };
  } catch {
    return {
      ok: false,
      status: 0,
      message: "네트워크 연결을 확인해 주세요."
    };
  }
}

function AccessCard({
  title,
  description,
  actions
}: {
  title: string;
  description: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-brand-line bg-white p-6">
      <h2 className="text-2xl font-black text-brand-ink">{title}</h2>
      <p className="mt-3 text-sm leading-7 text-brand-muted">{description}</p>
      {actions ? <div className="mt-5 flex flex-wrap gap-3">{actions}</div> : null}
    </div>
  );
}

export function StudyTimerClient() {
  const [viewState, setViewState] = useState<ViewState>("loading");
  const [authToken, setAuthToken] = useState("");
  const [myTimerData, setMyTimerData] = useState<StudyTimerMeResponse | null>(null);
  const [rankingData, setRankingData] = useState<StudyRankingResponse | null>(null);
  const [approvalStatus, setApprovalStatus] = useState<ProfileStatus | null>(null);
  const [message, setMessage] = useState("");
  const [busySubject, setBusySubject] = useState("");
  const [rankingLoading, setRankingLoading] = useState(false);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  const loadProfileStatus = useCallback(async () => {
    const supabase = getSupabaseBrowserClient();

    if (!supabase) {
      setViewState("config");
      setMessage(getSupabaseConfigMessage());
      return;
    }

    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      setViewState("signed-out");
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle<Profile>();

    if (profile?.status === "pending" || profile?.status === "rejected") {
      setApprovalStatus(profile.status);
      setViewState("approval");
      return;
    }

    setViewState("error");
    setMessage("정시타이머 사용 권한을 확인하지 못했습니다.");
  }, []);

  const loadRanking = useCallback(
    async (token = authToken) => {
      if (!token) {
        return;
      }

      setRankingLoading(true);
      const result = await apiRequest<StudyRankingResponse>(
        token,
        "/api/study-timer/ranking?scope=today"
      );
      setRankingLoading(false);

      if (result.ok) {
        setRankingData(result.data);
      }
    },
    [authToken]
  );

  const loadTimer = useCallback(async () => {
    setViewState("loading");
    setMessage("");

    const supabase = getSupabaseBrowserClient();

    if (!supabase) {
      setViewState("config");
      setMessage(getSupabaseConfigMessage());
      return;
    }

    const {
      data: { session }
    } = await supabase.auth.getSession();

    if (!session) {
      setAuthToken("");
      setMyTimerData(null);
      setRankingData(null);
      setViewState("signed-out");
      return;
    }

    setAuthToken(session.access_token);

    const [timerResult, rankingResult] = await Promise.all([
      apiRequest<StudyTimerMeResponse>(session.access_token, "/api/study-timer/me"),
      apiRequest<StudyRankingResponse>(
        session.access_token,
        "/api/study-timer/ranking?scope=today"
      )
    ]);

    if (!timerResult.ok) {
      if (timerResult.status === 401) {
        setViewState("signed-out");
        return;
      }

      if (timerResult.status === 403) {
        await loadProfileStatus();
        return;
      }

      setViewState("error");
      setMessage(timerResult.message);
      return;
    }

    if (!rankingResult.ok) {
      setViewState("error");
      setMessage(rankingResult.message);
      return;
    }

    setMyTimerData(timerResult.data);
    setRankingData(rankingResult.data);
    setViewState("ready");
  }, [loadProfileStatus]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadTimer();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadTimer]);

  useEffect(() => {
    if (viewState !== "ready" || !authToken) {
      return;
    }

    const supabase = getSupabaseBrowserClient();

    if (!supabase) {
      return;
    }

    const channel = supabase
      .channel("study-timer-ranking")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "study_sessions" },
        () => {
          void loadRanking(authToken);
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [authToken, loadRanking, viewState]);

  const liveTimer = useMemo(() => {
    if (!myTimerData) {
      return null;
    }

    const subjectTotals = getLiveSubjectTotals(
      myTimerData.subject_totals_seconds,
      myTimerData.active_session,
      myTimerData.server_now,
      now
    );
    const totalSeconds = getLiveTotalSeconds(
      myTimerData.total_seconds,
      myTimerData.active_session,
      myTimerData.server_now,
      now
    );
    const activeElapsed = getLiveActiveElapsedSeconds(
      myTimerData.active_session,
      myTimerData.server_now,
      now
    );

    return { subjectTotals, totalSeconds, activeElapsed };
  }, [myTimerData, now]);

  const handleStart = async (option: StudySubjectOption) => {
    if (!authToken || !myTimerData) {
      return;
    }

    if (
      myTimerData.active_session &&
      myTimerData.active_session.subject_key !== option.key
    ) {
      const confirmed = window.confirm(
        `${myTimerData.active_session.subject_label} 타이머를 정지하고 ${option.label} 타이머를 시작할까요?`
      );

      if (!confirmed) {
        return;
      }
    }

    setBusySubject(option.key);
    setMessage("");

    const result = await apiRequest<MutationResponse>(
      authToken,
      "/api/study-timer/start",
      {
        method: "POST",
        body: JSON.stringify({ subject_key: option.key })
      }
    );

    setBusySubject("");

    if (!result.ok) {
      setMessage(result.message);
      return;
    }

    setMyTimerData(result.data.snapshot);
    setMessage(result.data.message);
    void loadRanking();
  };

  const handleStop = async () => {
    if (!authToken) {
      return;
    }

    setBusySubject("stop");
    setMessage("");

    const result = await apiRequest<MutationResponse>(
      authToken,
      "/api/study-timer/stop",
      { method: "POST" }
    );

    setBusySubject("");

    if (!result.ok) {
      setMessage(result.message);
      return;
    }

    setMyTimerData(result.data.snapshot);
    setMessage(result.data.message);
    void loadRanking();
  };

  if (viewState === "loading") {
    return (
      <AccessCard
        title="정시타이머를 불러오는 중입니다"
        description="로그인 상태와 오늘의 공부 기록을 확인하고 있습니다."
      />
    );
  }

  if (viewState === "config") {
    return <AccessCard title="설정이 필요합니다" description={message} />;
  }

  if (viewState === "signed-out") {
    return (
      <AccessCard
        title="정시타이머는 로그인 후 사용할 수 있습니다"
        description="청고정총 계정으로 로그인하면 선택과목별 순공 시간과 오늘의 랭킹을 확인할 수 있습니다."
        actions={
          <>
            <Link
              href="/login"
              className="focus-ring rounded-md bg-brand-blue px-5 py-3 text-sm font-black text-white hover:bg-brand-deep"
            >
              로그인
            </Link>
            <Link
              href="/signup"
              className="focus-ring rounded-md border border-brand-blue px-5 py-3 text-sm font-black text-brand-blue hover:bg-blue-50"
            >
              회원가입
            </Link>
          </>
        }
      />
    );
  }

  if (viewState === "approval") {
    return (
      <AccessCard
        title="회원가입 승인 후 정시타이머를 사용할 수 있습니다"
        description={
          approvalStatus === "rejected"
            ? "회원가입 신청이 반려된 상태입니다. 관리자에게 문의해 주세요."
            : "현재 회원가입 승인 대기 중입니다. 승인 완료 후 과목별 타이머와 랭킹을 이용할 수 있습니다."
        }
      />
    );
  }

  if (viewState === "error" || !myTimerData || !liveTimer) {
    return (
      <AccessCard
        title="정시타이머를 불러오지 못했습니다"
        description={message || "잠시 후 다시 시도해 주세요."}
        actions={
          <button
            type="button"
            onClick={loadTimer}
            className="focus-ring inline-flex items-center gap-2 rounded-md bg-brand-blue px-5 py-3 text-sm font-black text-white hover:bg-brand-deep"
          >
            <RefreshCw aria-hidden="true" className="h-4 w-4" />
            다시 불러오기
          </button>
        }
      />
    );
  }

  const activeLongWarning =
    myTimerData.active_session && liveTimer.activeElapsed >= 86400
      ? "타이머가 24시간 이상 실행 중입니다. 정지 여부를 확인하세요."
      : myTimerData.active_session && liveTimer.activeElapsed >= 43200
        ? "장시간 실행 중"
        : "";

  return (
    <div className="space-y-8">
      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="rounded-xl border border-brand-line bg-white p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-bold text-brand-blue">
                {myTimerData.profile_name} · {myTimerData.study_date}
              </p>
              <h2 className="mt-2 text-2xl font-black text-brand-ink">
                오늘의 순공 시간
              </h2>
              <p className="mt-4 font-mono text-5xl font-black text-brand-ink sm:text-6xl">
                {formatSeconds(liveTimer.totalSeconds)}
              </p>
            </div>
            <div className="rounded-xl border border-brand-line bg-slate-50 px-4 py-3">
              <p className="text-xs font-black text-brand-blue">기준</p>
              <p className="mt-1 text-sm font-bold text-brand-muted">
                오전 5시 기준 집계
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-brand-line bg-slate-50 p-4">
            <div className="flex items-start gap-3">
              <Clock3 aria-hidden="true" className="mt-0.5 h-5 w-5 text-brand-blue" />
              <div>
                {myTimerData.active_session ? (
                  <>
                    <p className="font-black text-brand-ink">
                      {myTimerData.active_session.subject_label} 공부 중 ·{" "}
                      {formatSeconds(liveTimer.activeElapsed)} 진행 중
                    </p>
                    {activeLongWarning ? (
                      <p className="mt-2 inline-flex items-center gap-1 text-sm font-black text-brand-red">
                        <AlertTriangle aria-hidden="true" className="h-4 w-4" />
                        {activeLongWarning}
                      </p>
                    ) : null}
                  </>
                ) : (
                  <p className="font-black text-brand-muted">
                    현재 실행 중인 타이머가 없습니다.
                  </p>
                )}
              </div>
            </div>
          </div>

          {message ? (
            <p className="mt-4 rounded-md bg-blue-50 px-4 py-3 text-sm font-black text-brand-blue">
              {message}
            </p>
          ) : null}
        </div>

        <div className="rounded-xl border border-brand-line bg-white p-5 sm:p-6">
          <p className="text-sm font-bold text-brand-blue">Guide</p>
          <h2 className="mt-1 text-2xl font-black text-brand-ink">기록 방식</h2>
          <p className="mt-4 text-sm leading-7 text-brand-muted">
            시작과 정지 시점만 저장하고, 진행 중인 시간은 화면에서 실시간으로
            계산합니다. 새로고침하거나 창을 내려도 실행 중 타이머는 유지됩니다.
          </p>
          <button
            type="button"
            onClick={loadTimer}
            className="focus-ring mt-5 inline-flex items-center gap-2 rounded-md border border-brand-line px-4 py-2.5 text-sm font-black text-slate-700 hover:bg-slate-50"
          >
            <RefreshCw aria-hidden="true" className="h-4 w-4" />
            새로고침
          </button>
        </div>
      </section>

      <section className="rounded-xl border border-brand-line bg-white p-5 sm:p-6">
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-bold text-brand-blue">Subject Timer</p>
            <h2 className="mt-1 text-2xl font-black text-brand-ink">
              과목별 타이머
            </h2>
          </div>
          <p className="text-sm font-bold text-brand-muted">
            오늘 누적 {formatDurationShort(liveTimer.totalSeconds)}
          </p>
        </div>
        <div className="space-y-3">
          {myTimerData.subject_options.map((option) => (
            <SubjectTimerRow
              key={option.key}
              option={option}
              seconds={liveTimer.subjectTotals[option.key]}
              isActive={myTimerData.active_session?.subject_key === option.key}
              busy={busySubject === option.key || busySubject === "stop"}
              onStart={handleStart}
              onStop={handleStop}
            />
          ))}
        </div>
      </section>

      <StudyRanking
        ranking={rankingData}
        now={now}
        loading={rankingLoading}
      />
    </div>
  );
}
