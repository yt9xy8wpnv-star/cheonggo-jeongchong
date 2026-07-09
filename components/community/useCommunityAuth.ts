"use client";

import { useCallback, useEffect, useState } from "react";
import { getSupabaseBrowserClient, getSupabaseConfigMessage } from "@/lib/supabase/client";
import type { Profile } from "@/lib/supabase/types";

export type CommunityAuthStatus =
  | "loading"
  | "config"
  | "signed-out"
  | "approval"
  | "ready"
  | "error";

export function useCommunityAuth() {
  const [status, setStatus] = useState<CommunityAuthStatus>("loading");
  const [token, setToken] = useState("");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [message, setMessage] = useState("");

  const loadAuth = useCallback(async () => {
    const supabase = getSupabaseBrowserClient();

    if (!supabase) {
      setStatus("config");
      setMessage(getSupabaseConfigMessage());
      return;
    }

    const {
      data: { session }
    } = await supabase.auth.getSession();

    if (!session) {
      setToken("");
      setProfile(null);
      setStatus("signed-out");
      return;
    }

    const { data: nextProfile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .maybeSingle<Profile>();

    setToken(session.access_token);
    setProfile(nextProfile ?? null);

    if (nextProfile?.status === "approved") {
      setStatus("ready");
      setMessage("");
      return;
    }

    if (nextProfile?.status === "pending" || nextProfile?.status === "rejected") {
      setStatus("approval");
      setMessage(
        nextProfile.status === "pending"
          ? "회원가입 승인 후 작성할 수 있습니다."
          : "회원가입 신청이 반려된 상태입니다."
      );
      return;
    }

    setStatus("error");
    setMessage("회원 정보를 확인하지 못했습니다.");
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadAuth();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadAuth]);

  return {
    status,
    token,
    profile,
    message,
    reload: loadAuth
  };
}
