import { getAdminClient } from "../_shared/supabase.ts";

Deno.serve(async (_req) => {
  const supabase = getAdminClient();
  const today = new Date().toISOString().slice(0, 10);

  // 삭제되지 않은 전체 사용자
  const { data: users, error: usersErr } = await supabase
    .from("users")
    .select("id")
    .is("deleted_at", null);

  if (usersErr || !users) {
    return Response.json({ error: "failed to fetch users", built: 0 }, { status: 500 });
  }

  let built = 0;

  for (const u of users) {
    // 오늘 already 3개 발급됐으면 skip
    const { count } = await supabase
      .from("review_quests")
      .select("*", { count: "exact", head: true })
      .eq("user_id", u.id)
      .eq("due_date", today)
      .eq("quest_mode", "today");

    if ((count ?? 0) >= 3) continue;

    // 망각위험 높은 순으로 학습 객체 선정
    const { data: candidates } = await supabase
      .from("student_memory_items")
      .select("memory_id, object_id, forgetting_risk")
      .eq("user_id", u.id)
      .in("forgetting_risk", ["high", "medium"])
      .order("next_review_at", { ascending: true })
      .limit(3);

    if (!candidates || candidates.length === 0) continue;

    const inserts = candidates.map((c) => ({
      user_id: u.id,
      object_id: c.object_id,
      memory_id: c.memory_id,
      due_date: today,
      quest_format: "original",
      quest_mode: "today",
      variation_level: "V0",
      reward_xp: c.forgetting_risk === "high" ? 40 : 25,
    }));

    const { error: insertErr } = await supabase
      .from("review_quests")
      .insert(inserts);

    if (!insertErr) built += inserts.length;
  }

  return Response.json({ built, users: users.length, date: today });
});
