import { createClient } from "@/shared/lib/supabase/client";
import type { QuestRiskLevel } from "@/shared/contracts";
import type { RecallSession } from "./model/types";

/**
 * 자가 회상 세션 read — 회독 진행 화면(views/play)이 소비하는 실데이터 조회.
 *
 * 읽기 전용. 채점·진행·스케줄·HP 계산은 엔진/게임화 소유(grade write 는 features/quest-play
 * 의 기존 영속화 경로). 본 모듈은 RLS(auth.uid()) 하에서 회상 카드 표시 데이터만 모은다.
 *
 * 소스(전부 실 테이블):
 *  - review_quests           : 대상 퀘스트(object_id / memory_id / due_date)
 *  - parsed_learning_objects : 과목·단원·개념(topic)
 *  - generated_problems      : 인출 프롬프트(stem)·정답(answer)·해설(explanation) — 0023, source_object_id 1:1
 *  - student_memory_items    : 망각 위험도(forgetting_risk)
 */

const RISK_MAP: Record<string, QuestRiskLevel> = {
  low: "low",
  medium: "mid",
  high: "high",
};

function ddayLabel(dueDate: string | null): string {
  if (!dueDate) return "D-day";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  const days = Math.round((due.getTime() - today.getTime()) / 86400_000);
  if (days === 0) return "D-0";
  return days > 0 ? `D-${days}` : `D+${-days}`;
}

/**
 * questId 의 자가 회상 세션을 조회. 미로그인/미존재/생성문항 없음 등은 graceful null
 * (호출 뷰가 빈 상태로 처리 — mock 으로 메우지 않는다).
 */
export async function fetchRecallSession(
  questId: string,
): Promise<RecallSession | null> {
  const supabase = createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) return null;

  // 1) 대상 퀘스트
  const { data: quest, error: questError } = await supabase
    .from("review_quests")
    .select("quest_id, object_id, memory_id, due_date")
    .eq("quest_id", questId)
    .single();
  if (questError || !quest) return null;

  // 2) 학습객체(과목·단원·개념) / 3) 생성문항(질문·정답·해설) / 4) 위험도 — 병렬
  const [ploRes, gpRes, smiRes] = await Promise.all([
    supabase
      .from("parsed_learning_objects")
      .select("subject, unit, topic, extracted_text")
      .eq("object_id", quest.object_id)
      .maybeSingle(),
    supabase
      .from("generated_problems")
      .select("stem, answer, explanation")
      .eq("source_object_id", quest.object_id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    quest.memory_id
      ? supabase
          .from("student_memory_items")
          .select("forgetting_risk")
          .eq("memory_id", quest.memory_id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  const plo = ploRes.data as {
    subject?: string;
    unit?: string | null;
    topic?: string | null;
    extracted_text?: string | null;
  } | null;
  const gp = gpRes.data as {
    stem?: string;
    answer?: string;
    explanation?: string;
  } | null;
  const smi = (smiRes as { data: { forgetting_risk?: string } | null }).data;

  // 인출 프롬프트/정답은 생성문항이 정본. 없으면 회상 카드를 구성할 수 없으므로 null.
  if (!gp?.stem || !gp.answer) return null;

  // 진행 표시(현재/전체) — 오늘 회독 큐 기준. 실패 시 단일 세션으로 표기.
  let progress = { current: 1, total: 1 };
  const today = new Date().toISOString().slice(0, 10);
  const { data: todayQuests } = await supabase
    .from("review_quests")
    .select("quest_id")
    .eq("user_id", user.id)
    .eq("due_date", today)
    .eq("quest_mode", "today")
    .order("reward_xp", { ascending: false });
  if (todayQuests?.length) {
    const idx = todayQuests.findIndex((q) => q.quest_id === questId);
    progress = {
      current: idx >= 0 ? idx + 1 : 1,
      total: todayQuests.length,
    };
  }

  return {
    questId,
    progress,
    subject: (plo?.subject as RecallSession["subject"]) ?? "수학",
    unit: plo?.unit ?? "—",
    dday: ddayLabel(quest.due_date),
    riskLevel: RISK_MAP[smi?.forgetting_risk ?? ""] ?? "mid",
    kicker: "기억 인출 · 떠올려 보세요",
    concept: plo?.topic ?? gp.stem.slice(0, 40),
    prompt: gp.stem,
    answerText: gp.answer,
    answerFormat: "latex",
    answerNote: gp.explanation ?? "",
  };
}
