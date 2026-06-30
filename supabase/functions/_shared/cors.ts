// 공용 CORS 헬퍼 — 모든 Edge Function 응답에 CORS 헤더를 부여하고 OPTIONS 프리플라이트를 처리한다.
// 브라우저(vercel 프론트)에서 supabase.functions.invoke 호출이 차단되지 않도록 한다.

const PROD_ORIGIN = "https://soongong-web.vercel.app";

// 허용 오리진: 프로덕션 + vercel 프리뷰(*.vercel.app) + 로컬 개발. 그 외는 프로덕션으로 폴백.
function resolveOrigin(origin: string | null): string {
  if (!origin) return PROD_ORIGIN;
  if (origin === PROD_ORIGIN) return origin;
  if (origin === "http://localhost:3000" || origin === "https://localhost:3000") return origin;
  if (/^https:\/\/[a-z0-9-]+\.vercel\.app$/.test(origin)) return origin;
  return PROD_ORIGIN;
}

export function corsHeaders(origin: string | null): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": resolveOrigin(origin),
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };
}

// 핸들러를 감싸 (1) OPTIONS 프리플라이트 응답 (2) 모든 응답에 CORS 헤더 부여
// (3) 미처리 예외를 CORS 헤더 포함 500으로 변환한다.
export function withCors(
  handler: (req: Request) => Response | Promise<Response>,
): (req: Request) => Promise<Response> {
  return async (req: Request): Promise<Response> => {
    const cors = corsHeaders(req.headers.get("origin"));
    if (req.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors });
    }
    try {
      const res = await handler(req);
      const headers = new Headers(res.headers);
      for (const [k, v] of Object.entries(cors)) headers.set(k, v);
      return new Response(res.body, { status: res.status, statusText: res.statusText, headers });
    } catch (err) {
      const headers = new Headers(cors);
      headers.set("content-type", "application/json");
      return new Response(
        JSON.stringify({ error: err instanceof Error ? err.message : String(err) }),
        { status: 500, headers },
      );
    }
  };
}
