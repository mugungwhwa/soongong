import { createClient } from "@/shared/lib/supabase/client";
import type { OcrDetection, Source, SourceType } from "./model";
import { createIntakeQuest } from "./actions";

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
 * 1~2단계: compliance-gate → parse-ocr. 과목 판별 결과를 UI로 반환한다(퀘스트 생성 전).
 *
 * 확정/수정 UI(SOO-150)가 이 결과로 "감지된 과목" 배지를 띄우고, 사용자가 확정한 뒤
 * {@link finalizeIntake} 로 SMI·퀘스트를 만든다. 자동 확정 경로는 {@link runIntakePipeline} 참조.
 *
 * 반환:
 *   - `null`             — compliance 미통과 또는 parse-ocr 미적재(이미지 아님/실패). 후속 없음.
 *   - `OcrDetection`     — objectId·userId·subject(원시)·confidence. 퀘스트는 아직 생성 안 됨.
 */
export async function runComplianceAndOcr(
  sourceId: string,
): Promise<OcrDetection | null> {
  const supabase = createClient();

  // 1) compliance-gate — 저작권/PII 판정. 실패/미통과 시 체인 중단.
  const { data: compliance, error: compErr } = await supabase.functions.invoke<{
    action: string;
  }>("compliance-gate", { body: { source_id: sourceId } });
  if (compErr) {
    console.error("[intake] compliance-gate failed", compErr);
    return null;
  }
  const action = compliance?.action ?? null;
  if (!action || !OCR_ALLOWED_ACTIONS.has(action)) {
    console.info("[intake] compliance action 미통과 — 체인 종료", action);
    return null;
  }

  // 2) parse-ocr — 이미지 OCR → parsed_learning_objects 1건. text-only(raw_url 없음)는 422.
  //    confidence는 엔진이 실어줄 때만 채워진다(현재 미제공 → null, 저신뢰 폴백은 Tech Lead 계약 후).
  const { data: plo, error: ocrErr } = await supabase.functions.invoke<{
    object_id: string;
    subject: string;
    user_id: string;
    confidence?: number | null;
  }>("parse-ocr", { body: { source_id: sourceId } });
  if (ocrErr || !plo?.object_id) {
    console.info("[intake] parse-ocr 미적재(이미지 아님/실패) — 생성 단계 생략", ocrErr ?? "");
    return null;
  }

  return {
    objectId: plo.object_id,
    userId: plo.user_id,
    subject: plo.subject,
    confidence: plo.confidence ?? null,
  };
}

/**
 * 3단계: 확정된 과목으로 SMI·회독 퀘스트를 만들고 generate-problem을 백그라운드로 트리거한다.
 *
 * `subject`는 **사용자 확정값**(SOO-150 수정 반영)이다 — 자동 확정 경로에서는 판별 원시값이 그대로 온다.
 * 순서가 중요: createIntakeQuest(SMI upsert)가 generate-problem의 get_target_difficulty RPC 전제.
 */
export async function finalizeIntake(params: {
  objectId: string;
  userId: string;
  subject: string;
}): Promise<void> {
  // SMI + review_quests 즉시 생성 (service_role 서버 액션) — 오늘 플레이 큐를 즉시 확보.
  await createIntakeQuest({
    objectId: params.objectId,
    userId: params.userId,
    subject: params.subject,
  }).catch((e) => console.warn("[intake] createIntakeQuest 실패 (best-effort)", e));

  // generate-problem — 블로킹 해제: keepalive fetch로 페이지 이동 후에도 완료 보장.
  // V0 회독 퀘스트는 이미 생성됐으므로 사용자 대기 불필요. 완료 시 generated_problems 적재.
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/generate-problem`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ object_id: params.objectId }),
        keepalive: true,
      },
    ).catch(() => {});
  }
}

/**
 * 업로드된 소스를 end-to-end 로 처리한다(자동 확정 경로):
 *   compliance-gate → (pass/derived_only) → parse-ocr → (판별 과목 그대로) → 퀘스트 + generate-problem.
 *
 * {@link runComplianceAndOcr} + {@link finalizeIntake} 합성. 판별 과목을 **그대로** 확정하므로
 * 기존 호출자(수기 텍스트·인강 로그·캡처 메모 폼)의 동작은 변하지 않는다. 사용자 확정/수정이 필요한
 * 사진 업로드(SOO-150)만 두 함수를 나눠 확정 UI를 끼운다.
 *
 * 각 단계 실패는 사용자에게 throw 하지 않고 graceful 하게 종료한다.
 */
export async function runIntakePipeline(
  sourceId: string,
): Promise<IntakePipelineResult> {
  const result: IntakePipelineResult = {
    complianceAction: null,
    objectId: null,
    generatedProblemId: null,
  };

  const detection = await runComplianceAndOcr(sourceId);
  if (!detection) return result;
  result.objectId = detection.objectId;

  // 판별 과목을 그대로 확정(기존 동작 보존): user_id·subject 모두 있을 때만 퀘스트 생성.
  if (detection.userId && detection.subject) {
    await finalizeIntake({
      objectId: detection.objectId,
      userId: detection.userId,
      subject: detection.subject,
    });
  }

  console.info("[intake] 회독 퀘스트 생성 완료 — generate-problem 백그라운드 진행", result);
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
