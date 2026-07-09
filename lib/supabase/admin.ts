import { createClient } from "@supabase/supabase-js";

// 서버 전용입니다. SUPABASE_SERVICE_ROLE_KEY를 사용하는 이 파일은
// 클라이언트 컴포넌트에서 import하지 마세요.
export function getSupabaseAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    return {
      client: null,
      error:
        "Supabase 관리자 환경변수가 설정되지 않았습니다. SUPABASE_SERVICE_ROLE_KEY를 서버 환경변수로 입력해 주세요."
    };
  }

  return {
    client: createClient(url, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }),
    error: null
  };
}
