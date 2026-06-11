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
import { generateV1Variation } from "./variation-v1";

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
// 간단한 키워드 휴리스틱으로 과목 감지 (AI 라우팅 이전 배관용).
// Submit 직후 실행 — 감지된 subject를 Stage 3 Recognize에 전달해 정합성 확보.

const MATH_KEYWORDS = ["함수", "미분", "적분", "방정식", "부등식", "벡터", "확률", "통계", "수열", "극값", "삼각", "수학"];
const KOR_KEYWORDS  = ["문학", "독서", "화법", "작문", "문법", "국어", "현대시", "소설", "비문학"];
const ENG_KEYWORDS  = ["영어", "grammar", "reading", "어법", "독해", "vocabulary", "english"];

function detectSubjectFromText(text: string): { subject: string; group: "math" | "korean" | "english" } {
  const lower = text.toLowerCase();
  const mathScore = MATH_KEYWORDS.filter((kw) => text.includes(kw)).length;
  const korScore  = KOR_KEYWORDS.filter((kw) => text.includes(kw)).length;
  const engScore  = ENG_KEYWORDS.filter((kw) => lower.includes(kw)).length;

  if (mathScore >= korScore && mathScore >= engScore) return { subject: "수학", group: "math" };
  if (engScore >= korScore) return { subject: "영어", group: "english" };
  return { subject: "국어", group: "korean" };
}

export async function stageRoute(input: RouteInput): Promise<RouteOutput> {
  const supabase = createServiceClient();
  const { subject, group } = detectSubjectFromText(input.rawText);

  const { data, error } = await supabase
    .from("subject_routing_results")
    .insert({
      source_id: input.sourceId,
      user_id: input.userId,
      source_type: input.sourceType,
      detected_subject: subject,
      subject_confidence: 0.5, // 키워드 휴리스틱 고정값
      subject_group: group,
      needs_user_confirmation: false,
      final_subject: subject,
    })
    .select("routing_id")
    .single();

  if (error || !data) throw new Error(`[route] ${error?.message ?? "insert failed"}`);
  return { routingId: data.routing_id as string, detectedSubject: subject, finalSubject: subject };
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

// ─── Stage 5: Generate (V1 — SOO-40) ────────────────────────────────────────
// MOAT slot: 문항 DNA 기반 V1(숫자/조건 미세변형) 생성.
//   1) 원본 학습객체의 추출 텍스트 조회
//   2) V1 엔진으로 점화식 DNA 분해 → 숫자만 변형 → 같은 풀이법으로 풀리는 새 문제 생성
//   3) 변형 문제를 새 parsed_learning_objects 행으로 저장(원본 스키마 그대로 활용)
//   4) 그 변형 객체를 가리키는 review_quests 퀘스트 1건 출제(variation_level='V1')
// 파싱 불가(점화식 아님) 시 V0(원문 회독)로 graceful 폴백 — 파이프라인을 막지 않음.
// 범위 밖(별도 MOAT): 온톨로지·RAG·prior 점수·적응형 출제·V2~V5.

function tomorrowDateStr(): string {
  const due = new Date();
  due.setDate(due.getDate() + 1);
  return due.toISOString().slice(0, 10);
}

export async function stageGenerate(input: GenerateInput): Promise<GenerateOutput> {
  const supabase = createServiceClient();
  const dueDateStr = tomorrowDateStr();

  // (1) 원본 추출 텍스트 조회 — 없으면 V0 폴백.
  const { data: sourceObj, error: sourceErr } = await supabase
    .from("parsed_learning_objects")
    .select("extracted_text")
    .eq("object_id", input.objectId)
    .maybeSingle();
  if (sourceErr) throw new Error(`[generate] source lookup: ${sourceErr.message}`);

  const sourceText = (sourceObj?.extracted_text as string | null) ?? "";

  // (2) V1 변형 시도.
  const variation = sourceText ? generateV1Variation(sourceText) : null;

  // (3) V1 성공: 변형 문제를 새 학습객체로 저장 → 그 객체로 퀘스트 출제.
  if (variation) {
    const { data: variantObj, error: variantErr } = await supabase
      .from("parsed_learning_objects")
      .insert({
        source_id: null, // 생성 객체 — 외부 소스 없음
        user_id: input.userId,
        object_type: "question",
        subject: input.subject,
        extracted_text: variation.stem,
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
        due_date: dueDateStr,
        quest_format: "number_variation",
        quest_mode: "today",
        variation_level: "V1",
        difficulty_level: "L2",
        reward_xp: 25,
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

  // (3-fallback) 파싱 불가 → V0 원문 회독 퀘스트(원본 객체 그대로).
  const { data, error } = await supabase
    .from("review_quests")
    .insert({
      user_id: input.userId,
      object_id: input.objectId,
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
  const submit     = await stageSubmit({ userId: input.userId, rawText: input.rawText, sourceType: input.sourceType });
  const route      = await stageRoute({ userId: input.userId, sourceId: submit.sourceId, rawText: input.rawText, sourceType: input.sourceType });
  const recognize  = await stageRecognize({ userId: input.userId, sourceId: submit.sourceId, rawText: input.rawText, subject: route.finalSubject });
  const card       = await stageCard({ subject: route.finalSubject });
  const generate   = await stageGenerate({ userId: input.userId, objectId: recognize.objectId, subject: route.finalSubject, typeId: card.typeId, typeName: card.typeName });

  return {
    sourceId:     submit.sourceId,
    objectId:     recognize.objectId,
    routingId:    route.routingId,
    finalSubject: route.finalSubject,
    typeId:       card.typeId,
    questId:      generate.questId,
  };
}
