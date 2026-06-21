/**
 * 회독 퀘스트 도메인 계약.
 *
 * 1/3/7/14일 회독 주기 기반 캘린더 표시용.
 * TODO(P4): Supabase review_quests 테이블 + 망각엔진 API와 연결.
 */
import type { Subject } from "./common";

/** 회독 퀘스트 자가평가 3단계 (SOO-115). */
export type ReviewGrade = "clear" | "fuzzy" | "blank";

/** 회독 주기 (일). */
export type ReviewCycle = 1 | 3 | 7 | 14;

/** 회독 퀘스트 상태. */
export type ReviewQuestStatus = "scheduled" | "done" | "overdue";

/** 회독 퀘스트 아이템. 실데이터 연동 시 object_id / memory_id 추가 예정. */
export interface ReviewQuest {
  /** 퀘스트 고유 ID. */
  id: string;
  subject: Subject;
  /** 단원 이름. 예) 미적분 · 함수의 극값 */
  unit: string;
  /** 문제 제목. 예) 수학 23번 — 미분 극값 계산 */
  title: string;
  /** 회독 주기 (1/3/7/14일). */
  cycle: ReviewCycle;
  /** 예정일 (ISO 8601 날짜 문자열, YYYY-MM-DD). */
  scheduledDate: string;
  /** 등록일 (ISO 8601 날짜 문자열, YYYY-MM-DD). */
  registeredDate: string;
  /** 완료 여부. */
  status: ReviewQuestStatus;
}
