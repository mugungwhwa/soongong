import { createClient } from "@/shared/lib/supabase/client";

export type GameProgressMode = "today" | "wrong_recovery" | "memory_defense";

/**
 * 게임 상태 갱신(P7 update-game-state)을 브라우저 client 에서 best-effort 호출.
 * 비로그인/미연결 시 graceful no-op — 데모 흐름을 막지 않는다.
 */
export async function recordGameProgress(
  mode: GameProgressMode,
  isCorrect: boolean,
  hintUsed: boolean,
): Promise<void> {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.functions.invoke("update-game-state", {
      body: {
        user_id: user.id,
        quest_result: {
          completed: true,
          result: isCorrect ? "correct" : "wrong",
          mode,
          hint_used: hintUsed,
        },
      },
    });
  } catch {
    /* no-op */
  }
}
