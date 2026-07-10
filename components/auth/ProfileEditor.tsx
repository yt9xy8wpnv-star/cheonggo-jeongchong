"use client";

import Link from "next/link";
import { CheckCircle2, KeyRound, Save, UserCog } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { FormField } from "@/components/common/FormField";
import { SubjectPreferenceForm } from "@/components/auth/SubjectPreferenceForm";
import { getSupabaseBrowserClient, getSupabaseConfigMessage } from "@/lib/supabase/client";
import { defaultSubjectPreferences, formatSubjectSummary } from "@/lib/subjects";
import { validateSubjectPreferences } from "@/lib/subjectValidation";
import { getLoginRedirectHref } from "@/lib/redirect";
import type { Profile, SubjectPreferenceInput, SubjectPreferences } from "@/lib/supabase/types";

type ProfileEditorState = {
  loading: boolean;
  message: string;
  token: string;
  profile: Profile | null;
  subjects: SubjectPreferenceInput;
  signedIn: boolean;
};

type PasswordState = {
  current_password: string;
  new_password: string;
  new_password_confirm: string;
};

const initialState: ProfileEditorState = {
  loading: true,
  message: "",
  token: "",
  profile: null,
  subjects: defaultSubjectPreferences,
  signedIn: false
};

const initialPasswordState: PasswordState = {
  current_password: "",
  new_password: "",
  new_password_confirm: ""
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

type ApiMessage = {
  message?: string;
  username?: string;
};

export function ProfileEditor() {
  const [state, setState] = useState(initialState);
  const [newUsername, setNewUsername] = useState("");
  const [usernameStatus, setUsernameStatus] = useState<"idle" | "available" | "taken">("idle");
  const [usernameMessage, setUsernameMessage] = useState("");
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [usernameSaving, setUsernameSaving] = useState(false);
  const [passwordForm, setPasswordForm] = useState<PasswordState>(initialPasswordState);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState("");
  const [subjectsSaving, setSubjectsSaving] = useState(false);
  const [subjectsMessage, setSubjectsMessage] = useState("");
  const subjectValidation = useMemo(
    () => validateSubjectPreferences(state.subjects),
    [state.subjects]
  );

  useEffect(() => {
    let mounted = true;

    async function loadProfile() {
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
        data: { session }
      } = await supabase.auth.getSession();

      if (!session) {
        if (mounted) {
          setState({ ...initialState, loading: false, signedIn: false });
        }
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .maybeSingle<Profile>();
      const { data: subjects } = await supabase
        .from("subject_preferences")
        .select("*")
        .eq("profile_id", session.user.id)
        .maybeSingle<SubjectPreferences>();

      if (mounted) {
        setState({
          loading: false,
          message: "",
          token: session.access_token,
          profile: profile ?? null,
          subjects: subjects ? toSubjectInput(subjects) : defaultSubjectPreferences,
          signedIn: true
        });
        setNewUsername(profile?.username ?? "");
      }
    }

    void loadProfile();

    return () => {
      mounted = false;
    };
  }, []);

  const handlePasswordChange = (name: string, value: string) => {
    setPasswordForm((current) => ({ ...current, [name]: value }));
    setPasswordMessage("");
  };

  const handleCheckUsername = async () => {
    const username = newUsername.trim().toLowerCase();

    setUsernameMessage("");

    if (!state.profile) {
      return;
    }

    if (username === state.profile.username) {
      setUsernameStatus("taken");
      setUsernameMessage("현재 아이디와 다른 아이디를 입력해 주세요.");
      return;
    }

    setCheckingUsername(true);

    const response = await fetch(
      `/api/auth/check-username?username=${encodeURIComponent(username)}`
    );
    const result = (await response.json().catch(() => ({}))) as ApiMessage & {
      available?: boolean;
    };

    setCheckingUsername(false);

    if (response.ok && result.available) {
      setUsernameStatus("available");
      setUsernameMessage(result.message ?? "사용 가능한 아이디입니다.");
    } else {
      setUsernameStatus("taken");
      setUsernameMessage(result.message ?? "이미 사용 중인 아이디입니다.");
    }
  };

  const handleSaveUsername = async () => {
    if (!state.token || usernameStatus !== "available") {
      setUsernameMessage("아이디 중복확인을 완료해 주세요.");
      return;
    }

    setUsernameSaving(true);
    setUsernameMessage("");

    const response = await fetch("/api/mypage/profile/username", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${state.token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ new_username: newUsername })
    });
    const result = (await response.json().catch(() => ({}))) as ApiMessage;

    setUsernameSaving(false);

    if (!response.ok || !result.username) {
      setUsernameStatus("taken");
      setUsernameMessage(result.message ?? "아이디를 변경하지 못했습니다.");
      return;
    }

    setState((current) => ({
      ...current,
      profile: current.profile
        ? { ...current.profile, username: result.username ?? current.profile.username }
        : current.profile
    }));
    setNewUsername(result.username);
    setUsernameStatus("idle");
    setUsernameMessage(result.message ?? "아이디가 변경되었습니다.");
  };

  const handleSavePassword = async () => {
    if (!state.token) {
      return;
    }

    setPasswordSaving(true);
    setPasswordMessage("");

    const response = await fetch("/api/mypage/profile/password", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${state.token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(passwordForm)
    });
    const result = (await response.json().catch(() => ({}))) as ApiMessage;

    setPasswordSaving(false);

    if (!response.ok) {
      setPasswordMessage(result.message ?? "비밀번호를 변경하지 못했습니다.");
      return;
    }

    setPasswordForm(initialPasswordState);
    setPasswordMessage(result.message ?? "비밀번호가 변경되었습니다.");
  };

  const handleSaveSubjects = async () => {
    const supabase = getSupabaseBrowserClient();

    if (!supabase || !state.profile || !subjectValidation.isValid) {
      return;
    }

    setSubjectsSaving(true);
    setSubjectsMessage("");

    const { error } = await supabase
      .from("subject_preferences")
      .update({
        ...state.subjects,
        history_subject: "응시",
        updated_at: new Date().toISOString()
      })
      .eq("profile_id", state.profile.id);

    setSubjectsSaving(false);
    setSubjectsMessage(error ? "저장 중 오류가 발생했습니다." : "선택과목이 저장되었습니다.");
  };

  if (state.loading) {
    return (
      <div className="rounded-xl border border-brand-line bg-white p-6 text-sm font-bold text-brand-muted">
        내 정보를 불러오는 중입니다.
      </div>
    );
  }

  if (state.message) {
    return (
      <div className="rounded-xl border border-brand-line bg-white p-6">
        <h2 className="text-2xl font-black text-brand-ink">설정 안내</h2>
        <p className="mt-3 text-sm leading-6 text-brand-muted">{state.message}</p>
      </div>
    );
  }

  if (!state.signedIn || !state.profile) {
    return (
      <div className="rounded-xl border border-brand-line bg-white p-6">
        <h2 className="text-2xl font-black text-brand-ink">로그인이 필요합니다</h2>
        <p className="mt-3 text-sm leading-7 text-brand-muted">
          내 정보 수정은 로그인 후 이용할 수 있습니다.
        </p>
        <Link
          href={getLoginRedirectHref("/mypage/profile")}
          className="focus-ring mt-5 inline-flex rounded-md bg-brand-blue px-5 py-3 text-sm font-black text-white hover:bg-brand-deep"
        >
          로그인
        </Link>
      </div>
    );
  }

  if (state.profile.status !== "approved") {
    return (
      <div className="rounded-xl border border-brand-line bg-white p-6">
        <h2 className="text-2xl font-black text-brand-ink">
          회원가입 승인 후 이용할 수 있습니다
        </h2>
        <p className="mt-3 text-sm leading-7 text-brand-muted">
          승인된 회원만 내 정보를 수정할 수 있습니다.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-brand-line bg-white p-6">
        <div className="flex items-center gap-3">
          <UserCog aria-hidden="true" className="h-6 w-6 text-brand-blue" />
          <div>
            <p className="text-sm font-bold text-brand-blue">Username</p>
            <h2 className="text-2xl font-black text-brand-ink">아이디 변경</h2>
          </div>
        </div>
        <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_1fr_auto_auto] lg:items-end">
          <label className="grid gap-2">
            <span className="text-sm font-bold text-brand-ink">현재 아이디</span>
            <input
              value={state.profile.username}
              readOnly
              className="rounded-md border border-brand-line bg-slate-50 px-3 py-3 text-sm font-bold text-brand-muted"
            />
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-bold text-brand-ink">새 아이디</span>
            <input
              value={newUsername}
              onChange={(event) => {
                setNewUsername(event.target.value);
                setUsernameStatus("idle");
                setUsernameMessage("");
              }}
              className="focus-ring rounded-md border border-brand-line bg-white px-3 py-3 text-sm text-brand-ink"
            />
          </label>
          <button
            type="button"
            onClick={handleCheckUsername}
            disabled={checkingUsername}
            className="focus-ring rounded-md border border-brand-blue px-4 py-3 text-sm font-black text-brand-blue hover:bg-blue-50 disabled:cursor-not-allowed disabled:border-slate-300 disabled:text-slate-400"
          >
            {checkingUsername ? "확인 중" : "중복확인"}
          </button>
          <button
            type="button"
            onClick={() => void handleSaveUsername()}
            disabled={usernameSaving || usernameStatus !== "available"}
            className="focus-ring rounded-md bg-brand-blue px-4 py-3 text-sm font-black text-white hover:bg-brand-deep disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {usernameSaving ? "변경 중" : "변경하기"}
          </button>
        </div>
        {usernameMessage ? (
          <p
            className={[
              "mt-4 rounded-md px-4 py-3 text-sm font-bold",
              usernameStatus === "available"
                ? "bg-blue-50 text-brand-blue"
                : "bg-red-50 text-brand-red"
            ].join(" ")}
          >
            {usernameMessage}
          </p>
        ) : null}
      </section>

      <section className="rounded-xl border border-brand-line bg-white p-6">
        <div className="flex items-center gap-3">
          <KeyRound aria-hidden="true" className="h-6 w-6 text-brand-blue" />
          <div>
            <p className="text-sm font-bold text-brand-blue">Password</p>
            <h2 className="text-2xl font-black text-brand-ink">비밀번호 변경</h2>
          </div>
        </div>
        <div className="mt-6 grid gap-5 md:grid-cols-3">
          <FormField
            label="이전 비밀번호"
            name="current_password"
            type="password"
            value={passwordForm.current_password}
            autoComplete="current-password"
            onChange={handlePasswordChange}
          />
          <FormField
            label="새 비밀번호"
            name="new_password"
            type="password"
            value={passwordForm.new_password}
            autoComplete="new-password"
            onChange={handlePasswordChange}
          />
          <FormField
            label="새 비밀번호 확인"
            name="new_password_confirm"
            type="password"
            value={passwordForm.new_password_confirm}
            autoComplete="new-password"
            onChange={handlePasswordChange}
          />
        </div>
        {passwordMessage ? (
          <p className="mt-4 rounded-md bg-slate-50 px-4 py-3 text-sm font-bold text-brand-blue">
            {passwordMessage}
          </p>
        ) : null}
        <button
          type="button"
          onClick={() => void handleSavePassword()}
          disabled={passwordSaving}
          className="focus-ring mt-6 rounded-md bg-brand-blue px-5 py-3 text-sm font-black text-white hover:bg-brand-deep disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {passwordSaving ? "변경 중" : "비밀번호 변경"}
        </button>
      </section>

      <section className="rounded-xl border border-brand-line bg-white p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-brand-blue">Subjects</p>
            <h2 className="text-2xl font-black text-brand-ink">선택과목 수정</h2>
            <div className="mt-3 grid gap-1 text-sm font-semibold text-brand-muted sm:grid-cols-2">
              {formatSubjectSummary(state.subjects).map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
          </div>
          <CheckCircle2 aria-hidden="true" className="h-6 w-6 text-brand-blue" />
        </div>
        <div className="mt-6">
          <SubjectPreferenceForm
            value={state.subjects}
            onChange={(nextSubjects) =>
              setState((current) => ({
                ...current,
                subjects:
                  typeof nextSubjects === "function"
                    ? nextSubjects(current.subjects)
                    : nextSubjects
              }))
            }
            disabled={subjectsSaving}
          />
        </div>
        {[...subjectValidation.warnings].length > 0 ? (
          <div className="mt-5 rounded-md border border-red-200 bg-red-50 p-4 text-sm font-semibold leading-6 text-red-700">
            {subjectValidation.warnings.map((warning) => (
              <p key={warning}>{warning}</p>
            ))}
          </div>
        ) : null}
        {subjectsMessage ? (
          <p className="mt-5 rounded-md bg-slate-50 p-3 text-sm font-bold text-brand-blue">
            {subjectsMessage}
          </p>
        ) : null}
        <button
          type="button"
          onClick={() => void handleSaveSubjects()}
          disabled={!subjectValidation.isValid || subjectsSaving}
          className="focus-ring mt-6 inline-flex items-center gap-2 rounded-md bg-brand-blue px-5 py-3 text-sm font-black text-white hover:bg-brand-deep disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          <Save aria-hidden="true" className="h-4 w-4" />
          {subjectsSaving ? "저장 중" : "선택과목 저장"}
        </button>
      </section>
    </div>
  );
}
