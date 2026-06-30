// deno-lint-ignore-file
import { getAdminClient } from "../_shared/supabase.ts";
import { withCors } from "../_shared/cors.ts";
import { generateObject } from "../_shared/ai.ts";
import { complianceSchema } from "../_shared/schemas.ts";

const COMPLIANCE_PROMPT = `
다음 학습 소스를 한국 교육 서비스 운영 관점에서 분류하라.

판단 기준:
- 학생 본인 풀이/메모 → action=pass, copyright_risk=low
- 문제집 한 페이지 통째로 업로드 → action=admin_review
- 유료 인강 캡처 → contains_paid_lecture=true, action=derived_only (원본 장기저장 금지)
- 수능 기출 원문 → contains_exam_original=true, action=reject
- 학생 이름·전화번호 등 PII 노출 → contains_personal_info=true, action=redact
- 그 외 애매한 경우 → action=admin_review

응답은 한국어 reason 포함.
`.trim();

Deno.serve(withCors(async (req: Request) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  const { source_id } = await req.json();
  if (!source_id) return new Response("source_id required", { status: 400 });

  const supabase = getAdminClient();

  const { data: source } = await supabase
    .from("external_sources")
    .select("source_id, user_id, source_type, raw_url, raw_text, metadata")
    .eq("source_id", source_id)
    .single();
  if (!source) return new Response("source not found", { status: 404 });

  // 이미지 블록은 Anthropic SDK content 형식(source.url)을 따른다 — generateObject 가
  // messages 를 client.messages.create 로 그대로 전달하므로 Vercel AI-SDK 형식(image:URL)은 거부됨.
  const userContent: Array<
    | { type: "text"; text: string }
    | { type: "image"; source: { type: "url"; url: string } }
  > = [
    { type: "text", text: COMPLIANCE_PROMPT },
  ];

  if (source.raw_url) {
    const { data: signed } = await supabase.storage
      .from("uploads")
      .createSignedUrl(source.raw_url, 60);
    if (signed?.signedUrl) {
      userContent.push({
        type: "text",
        text: `source_type: ${source.source_type}\n학생 메모: ${source.metadata?.student_note ?? "없음"}`,
      });
      userContent.push({ type: "image", source: { type: "url", url: signed.signedUrl } });
    }
  } else if (source.raw_text) {
    userContent.push({
      type: "text",
      text: `source_type: ${source.source_type}\n텍스트: ${source.raw_text.slice(0, 1500)}`,
    });
  }

  const { object } = await generateObject({
    model: null,
    schema: complianceSchema,
    messages: [{ role: "user", content: userContent as any }],
  });

  const { data: check, error } = await supabase
    .from("source_compliance_checks")
    .insert({
      source_id: source.source_id,
      user_id: source.user_id,
      ...object,
    })
    .select()
    .single();

  if (error) return new Response(error.message, { status: 500 });

  if (object.action === "reject") {
    await supabase
      .from("external_sources")
      .update({ deleted_at: new Date().toISOString(), raw_url: null })
      .eq("source_id", source.source_id);
    if (source.raw_url) {
      await supabase.storage.from("uploads").remove([source.raw_url]);
    }
  } else if (object.action === "derived_only") {
    await supabase
      .from("external_sources")
      .update({ storage_policy: "derived_only" })
      .eq("source_id", source.source_id);
  }

  return Response.json(check);
}));
