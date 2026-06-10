/**
 * 오답노트 도메인 계약.
 *
 * P4 망각엔진 연동 전까지 더미 데이터로 동작.
 * TODO(P4): Supabase wrong_notes 테이블 + 망각엔진 API와 연결.
 */
import type { Subject } from "./common";
import type { QuestRiskLevel } from "./quest";

/** 오답 노트 아이템. 실데이터 연동 시 object_id / memory_id 추가 예정. */
export interface WrongNote {
  /** 오답 고유 ID. */
  id: string;
  subject: Subject;
  /** 단원 이름. 예) 미적분 · 함수의 극값 */
  unit: string;
  /** 문제 제목. 예) 수학 23번 — 미분 극값 계산 */
  title: string;
  /** 기억 HP (0–5 정수). 게임성_기획_구조.md §4-2 */
  memoryHp: 0 | 1 | 2 | 3 | 4 | 5;
  /** 망각 위험도 3단. */
  riskLevel: QuestRiskLevel;
  /** 마지막으로 틀린 날짜 (ISO 8601). */
  lastWrongAt: string;
  /** 회독 미완료 여부 (기한 초과). */
  isOverdue: boolean;
  /**
   * TODO(P4): 재도전 퀘스트 ID. 망각엔진이 생성한 오답회수 퀘스트 questId.
   * 연동 전에는 null — UI에서 더미 경로로 처리.
   */
  recoveryQuestId: string | null;
}
