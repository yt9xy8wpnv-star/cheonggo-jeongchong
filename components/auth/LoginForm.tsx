"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { LogIn } from "lucide-react";
import { useState } from "react";
import { FormField } from "@/components/common/FormField";
import { getSupabaseBrowserClient, getSupabaseConfigMessage } from "@/lib/supabase/client";
import { usernameToInternalEmail } from "@/lib/auth";
import { getSafeRedirectPath } from "@/lib/redirect";
import type { Profile } from "@/lib/supabase/types";

type LoginState = {
  username: string;
  password: string;
};

const initialLoginState: LoginState = {
  username: "",
  password: ""
};

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = getSafeRedirectPath(searchParams.get("redirect"));
  const [form, setForm] = useState(initialLoginState);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (name: string, value: string) => {
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");
    setLoading(true);

    const supabase = getSupabaseBrowserClient();

    if (!supabase) {
      setMessage(getSupabaseConfigMessage());
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: usernameToInternalEmail(form.username),
      password: form.password
    });

    if (error) {
      setMessage("아이디 또는 비밀번호가 올바르지 않습니다.");
      setLoading(false);
      return;
    }

    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      setMessage("로그인 정보를 확인할 수 없습니다.");
      setLoading(false);
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle<Profile>();

    if (!profile) {
      await supabase.auth.signOut();
      setMessage("프로필 정보가 없습니다. 관리자에게 문의하세요.");
      setLoading(false);
      return;
    }

    if (profile.status === "pending") {
      await supabase.auth.signOut();
      setMessage("회원가입 승인 대기 중입니다. 관리자 승인 후 이용할 수 있습니다.");
      setLoading(false);
      return;
    }

    if (profile.status === "rejected") {
      await supabase.auth.signOut();
      setMessage("회원가입 신청이 반려되었습니다. 관리자에게 문의하세요.");
      setLoading(false);
      return;
    }

    router.push(redirectPath);
    router.refresh();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-brand-line bg-white p-6"
    >
      <div className="mb-6 flex items-center gap-3">
        <LogIn aria-hidden="true" className="h-6 w-6 text-brand-blue" />
        <h2 className="text-2xl font-black text-brand-ink">계정 로그인</h2>
      </div>
      <div className="grid gap-5">
        <FormField
          label="아이디"
          name="username"
          value={form.username}
          placeholder="fighter01"
          required
          autoComplete="username"
          onChange={handleChange}
        />
        <FormField
          label="비밀번호"
          name="password"
          type="password"
          value={form.password}
          placeholder="비밀번호"
          required
          autoComplete="current-password"
          onChange={handleChange}
        />
        <div className="rounded-md bg-slate-50 p-4 text-sm leading-6 text-brand-muted">
          관리자 승인 후 로그인할 수 있습니다.
        </div>
        {message ? (
          <p className="rounded-md border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">
            {message}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={loading}
          className="focus-ring rounded-md bg-brand-blue px-5 py-3 text-sm font-black text-white hover:bg-brand-deep disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {loading ? "로그인 중" : "로그인"}
        </button>
        <Link
          href="/signup"
          className="focus-ring text-center text-sm font-bold text-slate-500 hover:text-brand-blue"
        >
          회원가입
        </Link>
      </div>
    </form>
  );
}
