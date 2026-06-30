// P7: 회독 완료 시 호출 → XP / 스트릭 / HP / 뱃지 일괄 업데이트
// SSoT: 01_제품_UX_게임화/게임성_기획_구조.md v1.0
import { getAdminClient } from "../_shared/supabase.ts";
import { withCors } from "../_shared/cors.ts";

const XP_RULES = {
  today_quest_done: 20,
  wrong_recovery_success: 30,
  memory_defense_success: 40,
  no_hint_correct: 10,
  day7_correct: 20,
  day14_defense: 50,
  boss_clear: 80,
} as const;

const BADGE_RARITY: Record<string, string> = {
  streak_7: "rare",
  recover_50: "rare",
  defense_7: "rare",
  concept_20: "rare",
  streak_30: "epic",
  defense_14: "epic",
};
function rarityFor(key: string): string {
  return BADGE_RARITY[key] ?? "common";
}

type ReviewGrade = "clear" | "fuzzy" | "blank";
const VALID_GRADES = new Set<ReviewGrade>(["clear", "fuzzy", "blank"]);

type QuestResult = {
  completed: boolean;
  result: "correct" | "wrong";
  mode: "today" | "wrong_recovery" | "memory_defense";
  hint_used: boolean;
  repeat_wrong?: boolean;
  grade?: ReviewGrade;  // 3단계 자가평가; 없으면 result로 폴백
};

Deno.serve(withCors(async (req) => {
  const { user_id, quest_result }: { user_id: string; quest_result: QuestResult } = await req.json();
  const supabase = getAdminClient();

  const { data: state } = await supabase
    .from("user_game_state")
    .select("*")
    .eq("user_id", user_id)
    .maybeSingle();

  const cur = state ?? {
    user_id,
    streak_days: 0,
    last_active_date: null,
    memory_hp: 5,
    total_xp: 0,
    today_xp: 0,
    today_minutes: 0,
  };

  // XP 계산
  let xpDelta = 0;
  if (quest_result.completed) xpDelta += XP_RULES.today_quest_done;
  if (quest_result.mode === "wrong_recovery" && quest_result.result === "correct") xpDelta += XP_RULES.wrong_recovery_success;
  if (quest_result.mode === "memory_defense" && quest_result.result === "correct") xpDelta += XP_RULES.memory_defense_success;
  if (!quest_result.hint_used && quest_result.result === "correct") xpDelta += XP_RULES.no_hint_correct;

  // 스트릭
  const today = new Date().toISOString().slice(0, 10);
  const lastDate = cur.last_active_date;
  let streak = cur.streak_days;
  const isNewDay = lastDate !== today;
  if (isNewDay) {
    const yest = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
    streak = lastDate === yest ? streak + 1 : 1;
  }

  // today_xp: 날짜 전환 시 xpDelta부터 새로 시작, 같은 날이면 누적
  const todayXp = isNewDay ? xpDelta : (cur.today_xp ?? 0) + xpDelta;

  // 기억 HP — 0-5 정수 (SSoT §4-2)
  // grade 제공 시: 또렷 +2 / 가물가물 0 / 막막 -1
  // grade 미제공 시: 기존 result 기반 동작 유지 (호환)
  let hp: number = cur.memory_hp;
  const resolvedGrade = quest_result.grade && VALID_GRADES.has(quest_result.grade)
    ? quest_result.grade
    : undefined;
  if (resolvedGrade) {
    if (resolvedGrade === "clear") hp = Math.min(5, hp + 2);
    else if (resolvedGrade === "blank") hp = Math.max(0, hp - 1);
    // fuzzy → HP 변화 없음
  } else {
    if (quest_result.mode === "memory_defense" && quest_result.result === "correct") hp = Math.min(5, hp + 1);
    if (quest_result.result === "wrong" && quest_result.repeat_wrong) hp = Math.max(0, hp - 1);
  }

  const newXp = cur.total_xp + xpDelta;
  const { data: newRank } = await supabase.rpc("update_rank", { p_xp: newXp });

  await supabase.from("user_game_state").upsert({
    user_id,
    streak_days: streak,
    last_active_date: today,
    memory_hp: hp,
    total_xp: newXp,
    today_xp: todayXp,
    today_minutes: cur.today_minutes ?? 0,
    rank: newRank,
    updated_at: new Date().toISOString(),
  });

  await awardBadges(supabase, user_id, { streak, hp, total_xp: newXp, quest_result });

  return Response.json({ xp_delta: xpDelta, streak, hp, total_xp: newXp, rank: newRank, today_xp: todayXp });
}));

async function awardBadges(
  supabase: ReturnType<typeof getAdminClient>,
  userId: string,
  ctx: { streak: number; hp: number; total_xp: number; quest_result: QuestResult },
) {
  const candidates: string[] = [];
  if (ctx.quest_result.completed) candidates.push("first_quest");
  if (ctx.streak >= 7) candidates.push("streak_7");
  if (ctx.streak >= 30) candidates.push("streak_30");
  if (ctx.hp === 5) candidates.push("hp_full");
  if (ctx.quest_result.mode === "memory_defense" && ctx.quest_result.result === "correct") {
    candidates.push("defense_7");
  }

  for (const key of candidates) {
    await supabase
      .from("badges")
      .insert({ user_id: userId, badge_key: key, rarity: rarityFor(key) })
      .select();
  }
}
