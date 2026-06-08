import { getAdminClient } from "../_shared/supabase.ts";

Deno.serve(async (req) => {
  const { quest_id, result, solve_time_seconds, hint_used, confidence } =
    await req.json();

  if (!quest_id || !result) {
    return new Response(
      JSON.stringify({ error: "quest_id and result are required" }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  const supabase = getAdminClient();

  const { data: quest, error: questErr } = await supabase
    .from("review_quests")
    .select("user_id, object_id, memory_id, variation_level")
    .eq("quest_id", quest_id)
    .single();

  if (questErr || !quest) {
    return new Response(JSON.stringify({ error: "quest not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  // 퀘스트 결과 저장
  await supabase
    .from("review_quests")
    .update({
      status: "completed",
      result,
      solve_time_seconds,
      hint_used,
      confidence,
      completed_at: new Date().toISOString(),
    })
    .eq("quest_id", quest_id);

  // student_memory_items 업데이트 (memory_id 있을 때만)
  if (quest.memory_id) {
    const accuracyDelta = result === "correct" ? 0.2 : -0.2;
    await supabase.rpc("update_memory_after_review", {
      p_memory_id: quest.memory_id,
      p_accuracy_delta: accuracyDelta,
      p_hint_used: hint_used ?? false,
      p_confidence: confidence ?? null,
    });
  }

  // 다음 회독 일정 결정
  const nextV = pickNextVariation(
    result,
    solve_time_seconds,
    hint_used,
    quest.variation_level,
  );
  const nextDays = pickNextInterval(result, solve_time_seconds, hint_used);

  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + nextDays);

  await supabase.from("review_quests").insert({
    user_id: quest.user_id,
    object_id: quest.object_id,
    memory_id: quest.memory_id,
    due_date: dueDate.toISOString().slice(0, 10),
    quest_format: result === "correct" ? "number_variation" : "concept_card",
    quest_mode: result === "correct" ? "memory_defense" : "wrong_recovery",
    variation_level: nextV,
    reward_xp: result === "correct" ? 30 : 20,
  });

  return Response.json({ next_variation: nextV, next_days: nextDays });
});

function pickNextVariation(
  result: string,
  solveSec: number,
  hintUsed: boolean,
  _curr: string | null,
): string {
  if (result !== "correct") return "V0";
  if (hintUsed) return "V1";
  if (solveSec < 60) return "V3";
  if (solveSec < 180) return "V2";
  return "V1";
}

function pickNextInterval(
  result: string,
  solveSec: number,
  hintUsed: boolean,
): number {
  // 1/3/7/14일 회독 간격 — Karpicke & Roediger(2008) / Cepeda(2006) 기반
  if (result !== "correct") return 1;
  if (hintUsed) return 3;
  if (solveSec < 60) return 14;
  return 7;
}
