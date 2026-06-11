import { createClient } from "@supabase/supabase-js";

/**
 * Service role client — RLS 우회. 파이프라인 단계 INSERT 전용.
 * 서버 사이드(Server Action / API Route)에서만 호출할 것.
 * 절대 클라이언트 번들에 포함되지 않도록 NEXT_PUBLIC_ prefix 없는 키 사용.
 */
export function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}
