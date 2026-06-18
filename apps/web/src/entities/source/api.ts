import { createClient } from "@/shared/lib/supabase/client";
import type { Source, SourceType } from "./model";

export async function createSource(payload: {
  source_type: SourceType;
  raw_url?: string;
  raw_text?: string;
  storage_policy?: "temporary" | "derived_only";
  metadata?: Record<string, unknown>;
}): Promise<Source | null> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("external_sources")
    .insert({
      user_id: user.id,
      source_type: payload.source_type,
      raw_url: payload.raw_url ?? null,
      raw_text: payload.raw_text ?? null,
      storage_policy: payload.storage_policy ?? "temporary",
      license_status: "user_private",
      metadata: payload.metadata ?? {},
    })
    .select()
    .single();

  return (data as Source) ?? null;
}

/** 인테이크 파이프라인 단계별 실측 결과 — 호출자는 무시 가능, DoD 로그/디버깅용. */
export interface IntakePipelineResult {
  /** compliance-gate 판정 action (pass/derived_only/admin_review/redact/reject) */
  complianceAction: string | null;
  /** parse-ocr 가 적재한 학습객체 id (이미지가 아니거나 미실행 시 null) */
  objectId: string | null;
  /** generate-problem 이 적재한 변형 문항 id (부적격/미실행 시 null) */
  generatedProblemId: string | null;
}

// compliance action 중 OCR·생성으로 이어줄 값.
//   pass         학생 본인 풀이/메모 → 정상 진행
//   derived_only 유료 인강 캡처 → 파생물(OCR 결과)만 보관하며 진행
// reject(삭제됨)·admin_review·redact(사람 검수 필요)는 여기서 체인 종료.
const OCR_ALLOWED_ACTIONS = new Set(["pass", "derived_only"]);

/**
 * 업로드된 소스를 end-to-end 로 처리한다:
 *   compliance-gate → (pass/derived_only) → parse-ocr → (적격) → generate-problem.
 *
 * 호출 메커니즘은 클라이언트 세션 오케스트레이션. `createClient()` 가 사용자 JWT 를
 * 자동 첨부하므로 user JWT 를 요구하는 parse-ocr·generate-problem 이 그대로 인증된다.
 * 적격성(eligibility)·생성 로직은 generate-problem 내부(SOO-64 MOAT)가 self-gate 한다 —
 * 여기서는 트리거만 연결하고 MOAT 로직은 건드리지 않는다.
 *
 * 각 단계 실패는 사용자에게 throw 하지 않고 graceful 하게 종료한다:
 *   - text-only 소스는 raw_url 이 없어 parse-ocr 가 422 → objectId=null 로 정상 종료.
 *   - 부적격 객체는 generate-problem 이 422/403 → generatedProblemId=null 로 정상 종료.
 */
export async function runIntakePipeline(
  sourceId: string,
): Promise<IntakePipelineResult> {
  const supabase = createClient();
  const result: IntakePipelineResult = {
    complianceAction: null,
    objectId: null,
    generatedProblemId: null,
  };

  // 1) compliance-gate — 저작권/PII 판정. 실패 시 체인 중단.
  const { data: compliance, error: compErr } = await supabase.functions.invoke<{
    action: string;
  }>("compliance-gate", { body: { source_id: sourceId } });
  if (compErr) {
    console.error("[intake] compliance-gate failed", compErr);
    return result;
  }
  result.complianceAction = compliance?.action ?? null;

  if (!result.complianceAction || !OCR_ALLOWED_ACTIONS.has(result.complianceAction)) {
    console.info("[intake] compliance action 미통과 — 체인 종료", result.complianceAction);
    return result;
  }

  // 2) parse-ocr — 이미지 OCR → parsed_learning_objects 1건. text-only(raw_url 없음)는 422.
  const { data: plo, error: ocrErr } = await supabase.functions.invoke<{
    object_id: string;
  }>("parse-ocr", { body: { source_id: sourceId } });
  if (ocrErr || !plo?.object_id) {
    console.info("[intake] parse-ocr 미적재(이미지 아님/실패) — 생성 단계 생략", ocrErr ?? "");
    return result;
  }
  result.objectId = plo.object_id;

  // 3) generate-problem — 적격성은 함수가 self-gate. 부적격(422/403)은 정상 흐름.
  const { data: generated, error: genErr } = await supabase.functions.invoke<{
    problem_id: string;
  }>("generate-problem", { body: { object_id: plo.object_id } });
  if (genErr || !generated?.problem_id) {
    console.info("[intake] generate-problem 미적재(부적격/실패) — 정상 종료", genErr ?? "");
    return result;
  }
  result.generatedProblemId = generated.problem_id;

  console.info("[intake] end-to-end 완료", result);
  return result;
}

export async function uploadSourceFile(
  userId: string,
  file: File
): Promise<string | null> {
  const supabase = createClient();
  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${userId}/${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage
    .from("uploads")
    .upload(path, file, { contentType: file.type, upsert: false });

  if (error) {
    console.error("upload error", error);
    return null;
  }
  return path;
}
