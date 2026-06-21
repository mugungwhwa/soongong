import {
  recordSolveEvent,
  uploadSolution,
  type VariationLevel,
} from "@/entities/solve-event";
import { completeQuest } from "@/entities/quest";
import type { ReviewGrade } from "@/entities/game";
import { recordGameProgress } from "./game-progress";

export interface PlaySubmission {
  questId: string;
  isCorrect: boolean;
  answer: string;
  elapsedSeconds: number;
  hintUsed: boolean;
  /** today=일반 회독, wrong_recovery=오답회수, memory_defense=기억방어. */
  mode: "today" | "wrong_recovery" | "memory_defense";
  /** 3단계 자가평가 — 없으면 isCorrect로 2단계 폴백. */
  grade?: ReviewGrade;
  variationLevel?: VariationLevel | null;
  /** 캔버스에서 추출한 plain 데이터(레이어 분리: view가 추출). */
  strokeJSON?: unknown;
  pngBlob?: Blob | null;
}

/**
 * 회독 플레이/오답회수 제출의 영속화를 한 번에 오케스트레이션한다.
 * 캔버스 저장 → solve_event 기록 → 다음 회독 예약(P4) → 게임상태 갱신(P7).
 *
 * 전 단계 best-effort: 비로그인/미연결/mock 퀘스트에서는 각 단계가 graceful no-op
 * 하므로 데모 흐름(시각 E2E)을 절대 막지 않는다. 실제 데이터일 때만 영속화된다.
 */
export async function persistPlaySubmission(s: PlaySubmission): Promise<void> {
  // 1) 풀이 캔버스 산출물 저장 (stroke JSON + 선택적 PNG)
  let strokeUrl: string | undefined;
  let solutionImageUrl: string | undefined;
  if (s.strokeJSON !== undefined) {
    try {
      const up = await uploadSolution(s.questId, s.strokeJSON, s.pngBlob);
      strokeUrl = up.stroke_url;
      solutionImageUrl = up.solution_image_url;
    } catch {
      /* 저장 실패해도 진행 */
    }
  }

  // 2) 풀이 이벤트 기록
  try {
    await recordSolveEvent({
      quest_id: s.questId,
      variation_level: s.variationLevel ?? null,
      submitted_answer: s.answer,
      is_correct: s.isCorrect,
      solve_time_seconds: s.elapsedSeconds,
      hint_used: s.hintUsed,
      stroke_url: strokeUrl,
      solution_image_url: solutionImageUrl,
    });
  } catch {
    /* no-op */
  }

  // 3) 다음 회독 일정 결정 (P4 schedule-next-review)
  try {
    await completeQuest(s.questId, {
      result: s.isCorrect ? "correct" : "wrong",
      solve_time_seconds: s.elapsedSeconds,
      hint_used: s.hintUsed,
      grade: s.grade,
    });
  } catch {
    /* no-op */
  }

  // 4) 게임 상태 갱신 (P7 update-game-state) — best-effort
  await recordGameProgress(s.mode, s.isCorrect, s.hintUsed, s.grade);
}
