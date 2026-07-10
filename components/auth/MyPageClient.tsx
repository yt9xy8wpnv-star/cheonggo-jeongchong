"use client";

import Link from "next/link";
import {
  ClipboardList,
  LogOut,
  Package,
  ShieldAlert,
  UserCircle,
  Users
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/common/Badge";
import { getSupabaseBrowserClient, getSupabaseConfigMessage } from "@/lib/supabase/client";
import { getLoginRedirectHref } from "@/lib/redirect";
import { formatSubjectSummary } from "@/lib/subjects";
import type { Profile, SubjectPreferenceInput, SubjectPreferences } from "@/lib/supabase/types";

const myPageCards: Array<[LucideIcon, string, string]> = [
  [ClipboardList, "내 게시글", "작성 글과 댓글을 확인합니다."],
  [ClipboardList, "내 모의고사 결과", "최근 점수와 문항별 분석을 확인합니다."],
  [Package, "내 주문 내역", "굿즈 신청 및 주문 상태를 확인합니다."],
  [ShieldAlert, "신고 내역", "정시파출소 접수 상태를 확인합니다."]
];

type MyPageState = {
  loading: boolean;
  message: string;
  profile: Profile | null;
  subjects: SubjectPreferenceInput | null;
  signedIn: boolean;
};

const initialState: MyPageState = {
  loading: true,
  message: "",
  profile: null,
  subjects: null,
  signedIn: false
};

function toSubjectInput(subjects: SubjectPreferences): SubjectPreferenceInput {
  return {
    korean_subject: subjects.korean_subject,
    math_subject: subjects.math_subject,
    english_subject: subjects.english_subject,
    history_subject: subjects.history_subject,
    inquiry_subject_1: subjects.inquiry_subject_1,
    inquiry_subject_2: subjects.inquiry_subject_2,
    second_language_subject: subjects.second_language_subject
  };
}

export function MyPageClient() {
  const [state, setState] = useState(initialState);

  useEffect(() => {
    let mounted = true;

    async function loadMyPage() {
      const supabase = getSupabaseBrowserClient();

      if (!supabase) {
        if (mounted) {
          setState({
            ...initialState,
            loading: false,
            message: getSupabaseConfigMessage()
          });
        }
        return;
      }

      const {
        data: { user }
      } = await supabase.auth.getUser();

      if (!user) {
        if (mounted) {
          setState({ ...initialState, loading: false, signedIn: false });
        }
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle<Profile>();

      const { data: subjects } = await supabase
        .from("subject_preferences")
        .select("*")
        .eq("profile_id", user.id)
        .maybeSingle<SubjectPreferences>();

      if (mounted) {
        setState({
          loading: false,
          message: "",
          profile: profile ?? null,
          subjects: subjects ? toSubjectInput(subjects) : null,
          signedIn: true
        });
      }
    }

    loadMyPage();

    return () => {
      mounted = false;
    };
  }, []);

  const handleSignOut = async () => {
    const supabase = getSupabaseBrowserClient();
    await supabase?.auth.signOut();
    setState({ ...initialState, loading: false, signedIn: false });
  };

  if (state.loading) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-xl border border-brand-line bg-white p-6 text-sm font-bold text-brand-muted">
          로그인 상태를 확인하고 있습니다.
        </div>
      </section>
    );
  }

  if (state.message) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-xl border border-brand-line bg-white p-6">
          <h2 className="text-2xl font-black text-brand-ink">설정 안내</h2>
          <p className="mt-3 text-sm leading-6 text-brand-muted">{state.message}</p>
        </div>
      </section>
    );
  }

  if (!state.signedIn || !state.profile) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-xl border border-brand-line bg-white p-6">
          <UserCircle aria-hidden="true" className="h-12 w-12 text-brand-blue" />
          <h2 className="mt-5 text-2xl font-black text-brand-ink">로그인이 필요합니다</h2>
          <p className="mt-3 text-sm leading-7 text-brand-muted">
            청고정총 계정으로 로그인하면 내 정보와 선택과목을 확인할 수 있습니다.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href={getLoginRedirectHref("/mypage")}
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
          </div>
        </div>
      </section>
    );
  }

  if (state.profile.status === "pending") {
    return (
      <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-xl border border-brand-line bg-white p-6">
          <Badge tone="운영">승인 대기</Badge>
          <h2 className="mt-4 text-2xl font-black text-brand-ink">
            회원가입 승인 대기 중입니다
          </h2>
          <p className="mt-3 text-sm leading-7 text-brand-muted">
            관리자 승인 후 청고정총 서비스를 이용할 수 있습니다.
          </p>
          <button
            type="button"
            onClick={handleSignOut}
            className="focus-ring mt-5 inline-flex items-center gap-2 rounded-md border border-brand-line px-5 py-3 text-sm font-black text-slate-700 hover:bg-slate-50"
          >
            <LogOut aria-hidden="true" className="h-4 w-4" />
            로그아웃
          </button>
        </div>
      </section>
    );
  }

  if (state.profile.status === "rejected") {
    return (
      <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-xl border border-red-200 bg-white p-6">
          <Badge tone="굿즈">반려</Badge>
          <h2 className="mt-4 text-2xl font-black text-brand-ink">
            회원가입 신청이 반려되었습니다
          </h2>
          <p className="mt-3 text-sm leading-7 text-brand-muted">
            자세한 내용은 관리자에게 문의하세요.
          </p>
          <button
            type="button"
            onClick={handleSignOut}
            className="focus-ring mt-5 inline-flex items-center gap-2 rounded-md border border-brand-line px-5 py-3 text-sm font-black text-slate-700 hover:bg-slate-50"
          >
            <LogOut aria-hidden="true" className="h-4 w-4" />
            로그아웃
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[360px_1fr] lg:px-8">
      <aside className="rounded-xl border border-brand-line bg-white p-6">
        <UserCircle aria-hidden="true" className="h-12 w-12 text-brand-blue" />
        <p className="mt-5 text-sm font-bold text-brand-blue">
          {state.profile.role === "admin" ? "관리자" : "일반 회원"}
        </p>
        <h2 className="mt-1 text-2xl font-black text-brand-ink">{state.profile.name}</h2>
        <p className="mt-3 text-sm leading-7 text-brand-muted">
          {state.profile.grade}학년 {state.profile.class_number}반{" "}
          {state.profile.student_number}번 · {state.profile.username}
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Link
            href="/mypage/profile"
            className="focus-ring rounded-md bg-brand-blue px-4 py-3 text-sm font-black text-white hover:bg-brand-deep"
          >
            내 정보 수정
          </Link>
          <button
            type="button"
            onClick={handleSignOut}
            className="focus-ring rounded-md border border-brand-line px-4 py-3 text-sm font-black text-slate-700 hover:bg-slate-50"
          >
            로그아웃
          </button>
        </div>
      </aside>

      <div className="space-y-6">
        <section className="rounded-xl border border-brand-line bg-white p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-brand-blue">Subject Preferences</p>
              <h2 className="mt-1 text-2xl font-black text-brand-ink">선택과목 요약</h2>
            </div>
            <Badge tone="자료">저장됨</Badge>
          </div>
          <div className="mt-5 grid gap-2 text-sm font-semibold leading-6 text-brand-muted sm:grid-cols-2">
            {(state.subjects
              ? formatSubjectSummary(state.subjects)
              : ["선택과목 정보가 아직 없습니다."]
            ).map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
        </section>

        {state.profile.role === "admin" ? (
          <Link
            href="/mypage/admin/signup-requests"
            className="focus-ring block rounded-xl border border-brand-line bg-white p-6 hover:border-brand-blue"
          >
            <Users aria-hidden="true" className="mb-4 h-7 w-7 text-brand-blue" />
            <h3 className="text-xl font-black text-brand-ink">회원가입 관리</h3>
            <p className="mt-2 text-sm leading-6 text-brand-muted">
              가입 대기 회원을 확인하고 승인 또는 반려합니다.
            </p>
          </Link>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2">
          {myPageCards.map(([Icon, title, text]) => (
            <article
              key={title}
              className="rounded-xl border border-brand-line bg-white p-5"
            >
              <Icon aria-hidden="true" className="mb-4 h-6 w-6 text-brand-blue" />
              <h3 className="font-black text-brand-ink">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-brand-muted">{text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
