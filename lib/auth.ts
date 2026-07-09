import type { User } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/supabase/types";

export const internalAuthDomain = "cgjc.local";

export function normalizeUsername(username: string) {
  return username.trim().toLowerCase();
}

export function usernameToInternalEmail(username: string) {
  return `${normalizeUsername(username)}@${internalAuthDomain}`;
}

export async function getCurrentUser() {
  const supabase = getSupabaseBrowserClient();

  if (!supabase) {
    return null;
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  return user;
}

export async function getCurrentProfile() {
  const supabase = getSupabaseBrowserClient();
  const user = await getCurrentUser();

  if (!supabase || !user) {
    return null;
  }

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle<Profile>();

  return data ?? null;
}

export async function requireApprovedUser() {
  const user = await getCurrentUser();
  const profile = await getCurrentProfile();

  if (!user || !profile || profile.status !== "approved") {
    return null;
  }

  return { user: user as User, profile };
}

export async function requireAdmin() {
  const approvedUser = await requireApprovedUser();

  if (!approvedUser || approvedUser.profile.role !== "admin") {
    return null;
  }

  return approvedUser;
}
