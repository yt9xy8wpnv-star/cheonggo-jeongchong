import { createClient } from "@supabase/supabase-js";

export function getSupabaseServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return { client: null, error: "Supabase public 환경변수가 설정되지 않았습니다." };
  }

  return {
    client: createClient(url, anonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }),
    error: null
  };
}
