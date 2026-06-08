import { createClient as createSupabase, type SupabaseClient } from "@supabase/supabase-js";

// DB 스키마 타입 생성 전까지 any 허용 — Supabase codegen 연결 시 교체
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyClient = SupabaseClient<any, any, any>;

let instance: AnyClient | null = null;

export function createClient(): AnyClient {
  if (!instance) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    instance = createSupabase(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    ) as AnyClient;
  }
  return instance;
}
