import { createClient } from "@/shared/lib/supabase/client";
import { SUBJECTS } from "@/shared/contracts";
import type { Subject, QuestRiskLevel } from "@/shared/contracts";
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

/** 로컬 기준 오늘(YYYY-MM-DD). ddayLabel·오늘 큐 쿼리가 같은 기준을 쓰도록 통일(타임존 일관). */
function localTodayStr(): string {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

/** YYYY-MM-DD 를 로컬 자정 Date 로 파싱(UTC 파싱 드리프트 방지). */
function parseDateOnly(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y ?? 1970, (m ?? 1) - 1, d ?? 1);
}

/** 계약 외 subject 값을 화이트리스트로 좁히고 fallback. (단언 캐스팅 대신 런타임 검증) */
function toSubject(value: string | null | undefined): Subject {
  return SUBJECTS.includes(value as Subject) ? (value as Subject) : "수학";
}

function ddayLabel(dueDate: string | null): string {
  if (!dueDate) return "D-day";
  // ddayLabel 과 오늘 큐 쿼리 모두 '로컬 date-only' 기준으로 통일(타임존 경계 오차 방지).
  const today = parseDateOnly(localTodayStr());
  const due = parseDateOnly(dueDate);
  const days = Math.round((due.getTime() - today.getTime()) / 86400_000);
  if (days === 0) return "D-0";
  return days > 0 ? `D-${days}` : `D+${-days}`;
}

/** 실 쿼리 에러(권한·네트워크 등)는 전파하고, '행 없음'만 null 로 다룬다. */
function throwOnError(
  res: { error?: { message?: string } | null },
  label: string,
): void {
  if (res.error) {
    throw new Error(`recall-session ${label} 조회 실패: ${res.error.message ?? "unknown"}`);
  }
}

/**
 * questId 의 자가 회상 세션을 조회.
 * - 실패(인증/권한/네트워크): throw → 뷰의 error 상태.
 * - 미로그인/행 없음/생성문항 없음: graceful null → 뷰의 빈 상태(mock 으로 메우지 않는다).
 */
export async function fetchRecallSession(
  questId: string,
): Promise<RecallSession | null> {
  const supabase = createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError) {
    throw new Error(`recall-session 인증 확인 실패: ${authError.message}`);
  }
  if (!user) return null; // 미로그인은 에러가 아니라 빈 상태

  // 1) 대상 퀘스트 — maybeSingle 로 '행 없음(null)'과 '실에러'를 분리
  const questRes = await supabase
    .from("review_quests")
    .select("quest_id, object_id, memory_id, due_date")
    .eq("quest_id", questId)
    .maybeSingle();
  throwOnError(questRes, "review_quests");
  const quest = questRes.data;
  if (!quest) return null;

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
      : Promise.resolve({ data: null, error: null }),
  ]);
  // 병렬 조회의 실에러는 무시하지 않고 전파(빈 데이터만 null 허용).
  throwOnError(ploRes, "parsed_learning_objects");
  throwOnError(gpRes, "generated_problems");
  throwOnError(smiRes, "student_memory_items");

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
  const smi = smiRes.data as { forgetting_risk?: string } | null;

  // 인출 프롬프트/정답은 생성문항이 정본. 없으면 회상 카드를 구성할 수 없으므로 null.
  if (!gp?.stem || !gp.answer) return null;

  // 진행 표시(현재/전체) — 오늘 회독 큐 기준(로컬 today, ddayLabel 과 동일 기준). 실패 시 단일 세션.
  let progress = { current: 1, total: 1 };
  const today = localTodayStr();
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
    subject: toSubject(plo?.subject),
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
