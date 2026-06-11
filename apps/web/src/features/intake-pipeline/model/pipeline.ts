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

// ─── Stage 2: Recognize (STUB) ──────────────────────────────────────────────
// MOAT slot: 실제 OCR/AI 분석 로직 자리.
// 현재: 입력 텍스트를 그대로 통과. confidence_score = 0 으로 stub 표시.

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
      subject: "수학", // stub: 3단계 Route 결과로 backfill 예정
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

// ─── Stage 3: Route ─────────────────────────────────────────────────────────
// 간단한 키워드 휴리스틱으로 과목 감지 (AI 라우팅 이전 배관용).

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

// ─── Stage 5: Generate (STUB) ───────────────────────────────────────────────
// MOAT slot: 실제 퀘스트 생성 로직 (온톨로지·RAG·prior 점수 계산) 자리.
// 현재: 파싱 객체를 템플릿으로 1:1 변환하여 review_quests 에 1건 삽입.

export async function stageGenerate(input: GenerateInput): Promise<GenerateOutput> {
  const supabase = createServiceClient();

  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 1);
  const dueDateStr = dueDate.toISOString().slice(0, 10);

  // MOAT slot — 온톨로지 트리 탐색 / RAG 검색 / 난이도 계산 / 변형 생성 로직이 여기에 swap-in 됩니다.
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
  const recognize  = await stageRecognize({ userId: input.userId, sourceId: submit.sourceId, rawText: input.rawText });
  const route      = await stageRoute({ userId: input.userId, sourceId: submit.sourceId, objectId: recognize.objectId, rawText: input.rawText, sourceType: input.sourceType });
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
