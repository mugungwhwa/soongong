"use server";
import { createServiceClient } from "@/shared/lib/supabase/service";

export async function updateVariantStatus(
  objectId: string,
  status: "pending" | "done" | "failed",
): Promise<void> {
  const supabase = createServiceClient();
  await supabase
    .from("parsed_learning_objects")
    .update({ variant_status: status })
    .eq("object_id", objectId);
}

/**
 * 이미지 intake 완료 후 service_role로 SMI + review_quests를 즉시 생성.
 *
 * Why service_role: review_quests·student_memory_items 두 테이블 모두 RLS insert 정책이
 * service_role 전용이므로 user JWT로는 INSERT 불가. 서버 액션을 통해 service_role 클라이언트 사용.
 *
 * 호출 순서가 중요: parse-ocr → 이 함수(SMI 생성) → generate-problem.
 * generate-problem 내부의 get_target_difficulty RPC가 SMI를 조회하므로 SMI가 먼저 존재해야 함.
 */
export async function createIntakeQuest(params: {
  objectId: string;
  userId: string;
  subject: string;
}): Promise<{ memoryId: string | null; questId: string | null }> {
  const supabase = createServiceClient();
  const conceptKey = `${params.subject}:${params.objectId}`;

  // 1) student_memory_items upsert — generate-problem의 get_target_difficulty RPC 전제 조건
  let memoryId: string | null = null;
  const { data: smiRow, error: smiErr } = await supabase
    .from("student_memory_items")
    .upsert(
      {
        user_id: params.userId,
        object_id: params.objectId,
        concept_key: conceptKey,
        next_review_at: new Date(Date.now() + 86_400_000).toISOString(),
      },
      { onConflict: "user_id,concept_key", ignoreDuplicates: true },
    )
    .select("memory_id")
    .single();

  if (smiErr || !smiRow) {
    // ignoreDuplicates로 빈 결과 → 기존 행 조회
    const { data: existing } = await supabase
      .from("student_memory_items")
      .select("memory_id")
      .eq("user_id", params.userId)
      .eq("concept_key", conceptKey)
      .single();
    memoryId = existing?.memory_id ?? null;
  } else {
    memoryId = smiRow.memory_id as string;
  }

  // 2) review_quests insert — 업로드 직후 오늘 플레이 가능하게 (daily-quest-builder 대기 불필요)
  const today = new Date().toISOString().slice(0, 10);
  const { data: questRow, error: questErr } = await supabase
    .from("review_quests")
    .insert({
      user_id: params.userId,
      object_id: params.objectId,
      memory_id: memoryId,
      due_date: today,
      quest_format: "original",
      quest_mode: "today",
      variation_level: "V0",
      reward_xp: 30,
      status: "pending",
      hint_used: false,
    })
    .select("quest_id")
    .single();

  if (questErr) {
    console.error("[intake-action] review_quests insert 실패", questErr.message);
  }

  return {
    memoryId,
    questId: questErr || !questRow ? null : (questRow.quest_id as string),
  };
}
