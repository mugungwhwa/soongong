"use server";

import { createServiceClient } from "@/shared/lib/supabase/service";
import type {
  SubmitInput,
  SubmitOutput,
  RecognizeInput,
  RecognizeOutput,
  RouteInput,
  RouteOutput,
  CardInput,
  CardOutput,
  GenerateInput,
  GenerateOutput,
  PipelineInput,
  PipelineOutput,
} from "@/shared/contracts/pipeline";
import type { TypePatternCard } from "@/entities/type-pattern";
import { detectSubject } from "@/entities/subject-routing";
import { generateV1Variation } from "./variation-v1";
import { generateV2Variation } from "./variation-v2";

// ─── Stage 1: Submit ────────────────────────────────────────────────────────

export async function stageSubmit(input: SubmitInput): Promise<SubmitOutput> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("external_sources")
    .insert({
      user_id: input.userId,
      source_type: input.sourceType,
      raw_text: input.rawText,
      storage_policy: "temporary",
      license_status: "user_private",
      metadata: {},
    })
    .select("source_id")
    .single();

  if (error || !data) throw new Error(`[submit] ${error?.message ?? "insert failed"}`);
  return { sourceId: data.source_id as string };
}

// ─── Stage 2: Route ─────────────────────────────────────────────────────────
// detectSubject(entities/subject-routing/lib)로 과목 감지 — 수학·영어·국어·과학·사회·기타.
// Submit 직후 실행 — 감지된 subject를 Stage 3 Recognize에 전달해 정합성 확보.
// 저신뢰(needsConfirmation=true) 시 final_subject=기타, UI는 SOO-260701-01이 처리.

export async function stageRoute(input: RouteInput): Promise<RouteOutput> {
  const supabase = createServiceClient();
  const detected = detectSubject(input.rawText);

  const { data, error } = await supabase
    .from("subject_routing_results")
    .insert({
      source_id: input.sourceId,
      user_id: input.userId,
      source_type: input.sourceType,
      detected_subject: detected.needsConfirmation ? null : detected.label,
      subject_confidence: detected.confidence,
      subject_group: detected.group,
      needs_user_confirmation: detected.needsConfirmation,
      final_subject: detected.label, // 기타 포함 — 사용자 확정 전까지의 best-guess
    })
    .select("routing_id")
    .single();

  if (error || !data) throw new Error(`[route] ${error?.message ?? "insert failed"}`);
  return {
    routingId: data.routing_id as string,
    detectedSubject: detected.label,
    finalSubject: detected.label,
  };
}

// ─── Stage 3: Recognize (STUB) ──────────────────────────────────────────────
// MOAT slot: 실제 OCR/AI 분석 로직 자리.
// 현재: 입력 텍스트를 그대로 통과. confidence_score = 0 으로 stub 표시.
// Route 완료 후 실행 — input.subject 로 parsed_learning_objects.subject 정합 보장.

export async function stageRecognize(input: RecognizeInput): Promise<RecognizeOutput> {
  const supabase = createServiceClient();

  // MOAT slot — OCR / 이미지 분석 / AI 파싱 로직이 여기에 swap-in 됩니다.
  const extractedText = input.rawText;
  const confidenceScore = 0; // stub: 실 OCR 붙으면 0–1 실측값으로 교체

  const { data, error } = await supabase
    .from("parsed_learning_objects")
    .insert({
      source_id: input.sourceId,
      user_id: input.userId,
      object_type: "question",
      subject: input.subject,
      extracted_text: extractedText,
      review_priority: "medium",
      confidence_score: confidenceScore,
      reviewer_status: "pending",
    })
    .select("object_id")
    .single();

  if (error || !data) throw new Error(`[recognize] ${error?.message ?? "insert failed"}`);
  return { objectId: data.object_id as string };
}

// ─── Stage 3b: Memorize ─────────────────────────────────────────────────────
// PLO 생성 직후 student_memory_items 행을 UPSERT해 망각위험 추적 시작.
// concept_key = "${subject}:${objectId}" — 과목+객체 단위로 유일.
// 이미 존재하면 DO NOTHING (기존 mastery_score 보존).

export async function stageMemorize(input: {
  userId: string;
  objectId: string;
  subject: string;
}): Promise<{ memoryId: string }> {
  const supabase = createServiceClient();
  const conceptKey = `${input.subject}:${input.objectId}`;

  const { data, error } = await supabase
    .from("student_memory_items")
    .upsert(
      {
        user_id: input.userId,
        object_id: input.objectId,
        concept_key: conceptKey,
        next_review_at: new Date(Date.now() + 86400_000).toISOString(),
      },
      { onConflict: "user_id,concept_key", ignoreDuplicates: true },
    )
    .select("memory_id")
    .single();

  if (error || !data) {
    // ignoreDuplicates로 인한 빈 결과 또는 실제 오류 → 기존 행 조회 시도
    const { data: existing, error: fetchErr } = await supabase
      .from("student_memory_items")
      .select("memory_id")
      .eq("user_id", input.userId)
      .eq("concept_key", conceptKey)
      .single();
    if (fetchErr || !existing)
      throw new Error(`[memorize] ${error?.message ?? fetchErr?.message ?? "upsert/fetch failed"}`);
    return { memoryId: existing.memory_id as string };
  }

  return { memoryId: data.memory_id as string };
}

// ─── Stage 4: Card ──────────────────────────────────────────────────────────
// type_pattern_cards 에서 과목 일치 카드 1건 조회.
// 데이터 미존재 시 fallback { typeId: null, typeName: "general" } 반환.

export async function stageCard(input: CardInput): Promise<CardOutput> {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("type_pattern_cards")
    .select("type_id, type_name")
    .eq("subject", input.subject)
    .limit(1)
    .maybeSingle();

  if (!data) return { typeId: null, typeName: "general" };
  const card = data as Pick<TypePatternCard, "type_id" | "type_name">;
  return { typeId: card.type_id, typeName: card.type_name };
}

// ─── Stage 5: Generate (V1 — SOO-40 / V2 — SOO-44) ──────────────────────────
// MOAT slot: 문항 DNA 기반 변형 생성.
//   1) 원본 학습객체의 추출 텍스트 조회
//   2) input.variationLevel(기본 V1)에 따라 변형 엔진 선택
//        V1: 점화식 DNA 분해 → 숫자/계수 미세변형 → 같은 풀이법으로 풀리는 새 문제
//        V2: 점화식 구조·숫자 보존 → 묻는 값 변경(단일 항 → 두 항 차/합/비교) → 풀이 정합
//   3) 변형 문제를 새 parsed_learning_objects 행으로 저장(원본 스키마 그대로 활용)
//   4) 그 변형 객체를 가리키는 review_quests 퀘스트 1건 출제(variation_level 기록)
// 파싱 불가(점화식 아님) 시 레벨 무관 V0(원문 회독)로 graceful 폴백 — 파이프라인을 막지 않음.
// 범위 밖(별도 MOAT): 온톨로지·RAG·prior 점수·적응형 V레벨 선택·V3~V5.

function tomorrowDateStr(): string {
  const due = new Date();
  due.setDate(due.getDate() + 1);
  return due.toISOString().slice(0, 10);
}

/** review_quests 출제 메타 — 변형 레벨별로 다른 값. */
interface QuestMeta {
  quest_format: string;
  variation_level: string;
  difficulty_level: string;
  reward_xp: number;
}

const V1_QUEST_META: QuestMeta = {
  quest_format: "number_variation",
  variation_level: "V1",
  difficulty_level: "L2",
  reward_xp: 25,
};

const V2_QUEST_META: QuestMeta = {
  quest_format: "target_change", // 0009 스키마 check 제약에 사전 등록된 V2 포맷
  variation_level: "V2",
  difficulty_level: "L3", // 요구값 변경 — V1(L2)보다 한 단계
  reward_xp: 30,
};

/**
 * 변형 지문을 새 학습객체로 저장하고, 그 객체를 가리키는 퀘스트 1건을 출제한다.
 * V1·V2 공통 경로 — 출제 메타(meta)만 레벨별로 다르다.
 */
async function emitVariantQuest(
  supabase: ReturnType<typeof createServiceClient>,
  input: GenerateInput,
  stem: string,
  dueDateStr: string,
  meta: QuestMeta,
): Promise<GenerateOutput> {
  const { data: variantObj, error: variantErr } = await supabase
    .from("parsed_learning_objects")
    .insert({
      source_id: null, // 생성 객체 — 외부 소스 없음
      user_id: input.userId,
      object_type: "question",
      subject: input.subject,
      extracted_text: stem,
      review_priority: "medium",
      confidence_score: 1, // 결정론적 생성 — 신뢰도 만점
      reviewer_status: "pending", // 생성 문항도 검수 큐 경유
    })
    .select("object_id")
    .single();
  if (variantErr || !variantObj) {
    throw new Error(`[generate] variant insert: ${variantErr?.message ?? "insert failed"}`);
  }

  const { data: quest, error: questErr } = await supabase
    .from("review_quests")
    .insert({
      user_id: input.userId,
      object_id: variantObj.object_id as string,
      memory_id: input.memoryId ?? null,
      due_date: dueDateStr,
      quest_format: meta.quest_format,
      quest_mode: "today",
      variation_level: meta.variation_level,
      difficulty_level: meta.difficulty_level,
      reward_xp: meta.reward_xp,
      status: "pending",
      hint_used: false,
    })
    .select("quest_id")
    .single();
  if (questErr || !quest) {
    throw new Error(`[generate] quest insert: ${questErr?.message ?? "insert failed"}`);
  }
  return { questId: quest.quest_id as string };
}

export async function stageGenerate(input: GenerateInput): Promise<GenerateOutput> {
  const supabase = createServiceClient();
  const dueDateStr = tomorrowDateStr();
  const level = input.variationLevel ?? "V1";

  // (1) 원본 추출 텍스트 조회 — 없으면 V0 폴백.
  const { data: sourceObj, error: sourceErr } = await supabase
    .from("parsed_learning_objects")
    .select("extracted_text")
    .eq("object_id", input.objectId)
    .maybeSingle();
  if (sourceErr) throw new Error(`[generate] source lookup: ${sourceErr.message}`);

  const sourceText = (sourceObj?.extracted_text as string | null) ?? "";

  // (2) 레벨별 변형 시도. 파싱 불가(null) 시 아래 V0 폴백으로 떨어진다.
  if (sourceText) {
    if (level === "V2") {
      const v2 = generateV2Variation(sourceText);
      if (v2) return emitVariantQuest(supabase, input, v2.stem, dueDateStr, V2_QUEST_META);
    } else {
      const v1 = generateV1Variation(sourceText);
      if (v1) return emitVariantQuest(supabase, input, v1.stem, dueDateStr, V1_QUEST_META);
    }
  }

  // (3-fallback) 파싱 불가 → V0 원문 회독 퀘스트(원본 객체 그대로).
  const { data, error } = await supabase
    .from("review_quests")
    .insert({
      user_id: input.userId,
      object_id: input.objectId,
      memory_id: input.memoryId ?? null,
      due_date: dueDateStr,
      quest_format: "original",
      quest_mode: "today",
      variation_level: "V0",
      reward_xp: 20,
      status: "pending",
      hint_used: false,
    })
    .select("quest_id")
    .single();

  if (error || !data) throw new Error(`[generate] ${error?.message ?? "insert failed"}`);
  return { questId: data.quest_id as string };
}

// ─── Full Pipeline Orchestrator ──────────────────────────────────────────────

export async function runIntakePipeline(input: PipelineInput): Promise<PipelineOutput> {
  const submit    = await stageSubmit({ userId: input.userId, rawText: input.rawText, sourceType: input.sourceType });
  const route     = await stageRoute({ userId: input.userId, sourceId: submit.sourceId, rawText: input.rawText, sourceType: input.sourceType });
  const recognize = await stageRecognize({ userId: input.userId, sourceId: submit.sourceId, rawText: input.rawText, subject: route.finalSubject });
  const memorize  = await stageMemorize({ userId: input.userId, objectId: recognize.objectId, subject: route.finalSubject });
  const card      = await stageCard({ subject: route.finalSubject });
  const generate  = await stageGenerate({ userId: input.userId, objectId: recognize.objectId, subject: route.finalSubject, typeId: card.typeId, typeName: card.typeName, memoryId: memorize.memoryId, variationLevel: input.variationLevel });

  return {
    sourceId:     submit.sourceId,
    objectId:     recognize.objectId,
    routingId:    route.routingId,
    finalSubject: route.finalSubject,
    typeId:       card.typeId,
    memoryId:     memorize.memoryId,
    questId:      generate.questId,
  };
}
