// deno-lint-ignore-file
import { generateObject, OCR_SYSTEM, getModel } from "../_shared/ai.ts";
import { ocrParsedSchema } from "../_shared/schemas.ts";
import { getAdminClient } from "../_shared/supabase.ts";

const ENABLE_MATHPIX = Deno.env.get("ENABLE_MATHPIX") === "true";

const OCR_PROMPT =
  "이 문제 이미지에서 문제 본문, 선지, 조건, 수식(LaTeX), 그림 설명, 학생 표시(밑줄·동그라미·메모)를 분리해서 JSON으로 추출하라. " +
  "수식은 LaTeX로, 학생 필기/메모는 student_note로 분리. 인식 불가 영역은 extracted_text에 [불명] 표기.";

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  // 인증: Bearer JWT 검증으로 호출자 신원 확인
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response("Unauthorized", { status: 401 });
  }
  const token = authHeader.slice(7);

  let source_id: string;
  try {
    ({ source_id } = await req.json());
  } catch {
    return new Response("invalid JSON body", { status: 400 });
  }
  if (!source_id) return new Response("source_id required", { status: 400 });

  const supabase = getAdminClient();

  // JWT로 호출자 user_id 확인 (admin client의 auth.getUser로 토큰 검증)
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) return new Response("Unauthorized", { status: 401 });

  // 1) 소스 조회 — DB 오류와 404를 구분
  const { data: source, error: sourceError } = await supabase
    .from("external_sources")
    .select("source_id, user_id, raw_url, source_type, metadata")
    .eq("source_id", source_id)
    .maybeSingle();

  if (sourceError) return new Response(`DB error: ${sourceError.message}`, { status: 500 });
  if (!source) return new Response("source not found", { status: 404 });

  // 소유권 검증: 인증된 사용자의 소스만 처리
  if (source.user_id !== user.id) return new Response("Forbidden", { status: 403 });

  if (!source.raw_url) return new Response("no raw_url — text-only source not supported yet", { status: 422 });

  // 2) signed URL 발급 (60초) — Storage 오류와 빈 URL 구분
  const { data: signed, error: storageError } = await supabase.storage
    .from("uploads")
    .createSignedUrl(source.raw_url, 60);

  if (storageError) return new Response(`storage error: ${storageError.message}`, { status: 500 });
  if (!signed?.signedUrl) return new Response("storage signed URL empty", { status: 500 });

  // 3) Claude vision 호출 (exponential backoff는 _shared/ai.ts 내 callWithBackoff)
  let ocrResult;
  try {
    const { object } = await generateObject({
      model: getModel("fast"),
      schema: ocrParsedSchema,
      system: [OCR_SYSTEM],
      toolDescription: "수능 문제 이미지 OCR 결과를 구조화된 형식으로 반환합니다.",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: OCR_PROMPT },
            {
              type: "image",
              source: {
                type: "url",
                url: signed.signedUrl,
              },
            } as any,
          ],
        },
      ],
    });
    ocrResult = object;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return new Response(`vision OCR failed: ${msg}`, { status: 502 });
  }

  // 4) Mathpix 폴백 (수식 영역 보강) — ENABLE_MATHPIX=false 이면 stub 유지
  let mathpixLatex: string | null = null;
  if (ENABLE_MATHPIX && ocrResult.contains_math_formula) {
    mathpixLatex = await callMathpixStub(signed.signedUrl);
  }

  // 5) parsed_learning_objects 적재
  const insertPayload = {
    source_id: source.source_id,
    user_id: source.user_id,
    object_type: ocrResult.object_type,
    subject: ocrResult.subject,
    unit: ocrResult.unit ?? null,
    topic: ocrResult.topic ?? null,
    question_type: ocrResult.question_type ?? null,
    difficulty_level: ocrResult.difficulty_level ?? null,
    extracted_text: mathpixLatex
      ? `${ocrResult.extracted_text}\n\n[Mathpix LaTeX]\n${mathpixLatex}`
      : ocrResult.extracted_text,
    student_note: ocrResult.student_note ?? null,
    detected_wrong_reason: ocrResult.detected_wrong_reason,
    review_priority: ocrResult.review_priority,
    confidence_score: ocrResult.confidence_score,
    reviewer_status: "pending",
  };

  const { data: plo, error: insertError } = await supabase
    .from("parsed_learning_objects")
    .insert(insertPayload)
    .select()
    .single();

  if (insertError) return new Response(insertError.message, { status: 500 });

  return Response.json(plo);
});

// Mathpix stub — ENABLE_MATHPIX=true 전환 시 SOO-58에서 실연결
async function callMathpixStub(_imageUrl: string): Promise<string | null> {
  const appId = Deno.env.get("MATHPIX_APP_ID");
  const appKey = Deno.env.get("MATHPIX_APP_KEY");
  if (!appId || !appKey) return null;
  try {
    const res = await fetch("https://api.mathpix.com/v3/text", {
      method: "POST",
      headers: {
        "app_id": appId,
        "app_key": appKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ src: _imageUrl, formats: ["latex_styled"] }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) return null;
    const json = await res.json();
    return (json as { latex_styled?: string }).latex_styled ?? null;
  } catch {
    return null;
  }
}
