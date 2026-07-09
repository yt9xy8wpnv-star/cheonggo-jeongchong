import type { User } from "@supabase/supabase-js";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Profile } from "@/lib/supabase/types";

export async function getProfileFromAuthHeader(request: Request) {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  const { client, error } = getSupabaseAdminClient();

  if (!client) {
    return { client: null, user: null, profile: null, error, status: 500 };
  }

  if (!token) {
    return {
      client,
      user: null,
      profile: null,
      error: "로그인이 필요합니다.",
      status: 401
    };
  }

  const {
    data: { user },
    error: userError
  } = await client.auth.getUser(token);

  if (userError || !user) {
    return {
      client,
      user: null,
      profile: null,
      error: "로그인 정보를 확인할 수 없습니다.",
      status: 401
    };
  }

  const { data: profile, error: profileError } = await client
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle<Profile>();

  if (profileError || !profile) {
    return {
      client,
      user,
      profile: null,
      error: "프로필 정보를 확인할 수 없습니다.",
      status: 403
    };
  }

  return { client, user: user as User, profile, error: null, status: 200 };
}

export async function getOptionalProfileFromAuthHeader(request: Request) {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  const { client, error } = getSupabaseAdminClient();

  if (!client) {
    return { client: null, user: null, profile: null, error, status: 500 };
  }

  if (!token) {
    return { client, user: null, profile: null, error: null, status: 200 };
  }

  const {
    data: { user }
  } = await client.auth.getUser(token);

  if (!user) {
    return { client, user: null, profile: null, error: null, status: 200 };
  }

  const { data: profile } = await client
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle<Profile>();

  return {
    client,
    user: user as User,
    profile: profile ?? null,
    error: null,
    status: 200
  };
}

export async function requireApprovedAdminFromRequest(request: Request) {
  const context = await getProfileFromAuthHeader(request);

  if (!context.profile || context.profile.status !== "approved" || context.profile.role !== "admin") {
    return {
      ...context,
      error: context.error ?? "관리자만 접근할 수 있습니다.",
      status: context.status === 200 ? 403 : context.status
    };
  }

  return context;
}

export async function requireApprovedUserFromRequest(request: Request) {
  const context = await getProfileFromAuthHeader(request);

  if (!context.profile || context.profile.status !== "approved") {
    return {
      ...context,
      error: context.error ?? "승인된 회원만 접근할 수 있습니다.",
      status: context.status === 200 ? 403 : context.status
    };
  }

  return context;
}
