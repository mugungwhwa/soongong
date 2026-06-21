import { getAdminClient } from "../_shared/supabase.ts";

type ReviewGrade = "clear" | "fuzzy" | "blank";
const VALID_GRADES = new Set<ReviewGrade>(["clear", "fuzzy", "blank"]);
const VALID_RESULTS = new Set(["correct", "wrong", "partial"]);

Deno.serve(async (req) => {
  const { quest_id, result, grade, solve_time_seconds, hint_used, confidence } =
    await req.json();

  if (!quest_id || (!result && !grade)) {
    return new Response(
      JSON.stringify({ error: "quest_id and result (or grade) are required" }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }
  if (grade !== undefined && !VALID_GRADES.has(grade)) {
    return new Response(
      JSON.stringify({ error: `invalid grade: ${grade}` }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }
  if (result !== undefined && !VALID_RESULTS.has(result)) {
    return new Response(
      JSON.stringify({ error: `invalid result: ${result}` }),
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

  // grade가 없으면 result에서 파생 — partial은 fuzzy(3일)로 처리
  const resolvedGrade: ReviewGrade = grade ?? (
    result === "correct" ? "clear" :
    result === "partial" ? "fuzzy" :
    "blank"
  );

  // 퀘스트 결과 저장
  await supabase
    .from("review_quests")
    .update({
      status: "completed",
      result: result ?? gradeToResult(resolvedGrade),
      solve_time_seconds,
      hint_used,
      confidence,
      completed_at: new Date().toISOString(),
    })
    .eq("quest_id", quest_id);

  // student_memory_items 업데이트 (memory_id 있을 때만)
  if (quest.memory_id) {
    await supabase.rpc("update_memory_after_review", {
      p_memory_id: quest.memory_id,
      p_accuracy_delta: 0,   // p_grade가 있으면 RPC 내부에서 무시됨
      p_hint_used: hint_used ?? false,
      p_confidence: confidence ?? null,
      p_grade: resolvedGrade,
    });
  }

  // 다음 회독 일정 결정
  const nextV = pickNextVariation(
    resolvedGrade,
    solve_time_seconds,
    hint_used,
    quest.variation_level,
  );
  const nextDays = pickNextInterval(resolvedGrade, solve_time_seconds, hint_used);

  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + nextDays);

  const isSuccess = resolvedGrade === "clear" || resolvedGrade === "fuzzy";
  await supabase.from("review_quests").insert({
    user_id: quest.user_id,
    object_id: quest.object_id,
    memory_id: quest.memory_id,
    due_date: dueDate.toISOString().slice(0, 10),
    quest_format: isSuccess ? "number_variation" : "concept_card",
    quest_mode: isSuccess ? "memory_defense" : "wrong_recovery",
    variation_level: nextV,
    reward_xp: resolvedGrade === "clear" ? 30 : resolvedGrade === "fuzzy" ? 25 : 20,
  });

  return Response.json({ next_variation: nextV, next_days: nextDays, grade: resolvedGrade });
});

function gradeToResult(grade: ReviewGrade): "correct" | "wrong" {
  return grade === "clear" ? "correct" : grade === "fuzzy" ? "correct" : "wrong";
}

function pickNextVariation(
  grade: ReviewGrade,
  solveSec: number,
  hintUsed: boolean,
  _curr: string | null,
): string {
  if (grade === "blank") return "V0";
  if (grade === "fuzzy") return "V1";
  // clear
  if (hintUsed) return "V1";
  if (solveSec < 60) return "V3";
  if (solveSec < 180) return "V2";
  return "V1";
}

function pickNextInterval(
  grade: ReviewGrade,
  solveSec: number,
  hintUsed: boolean,
): number {
  // 1/3/7/14일 회독 간격 — Karpicke & Roediger(2008) / Cepeda(2006) 기반
  // 막막 → 1일, 가물가물 → 3일, 또렷(힌트/느림 → 7일, 빠름 → 14일)
  if (grade === "blank") return 1;
  if (grade === "fuzzy") return 3;
  // clear
  if (hintUsed) return 7;
  if (solveSec < 60) return 14;
  return 7;
}
