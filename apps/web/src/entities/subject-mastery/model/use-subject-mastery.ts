import type { Subject } from "@/shared/contracts";
import { SUBJECTS } from "@/shared/contracts";

/**
 * 과목별 숙련도 — 홈 뷰 집계 모델.
 *
 * 크로스트랙 도메인 계약이 아닌 홈 오버뷰 view-model 이므로 entity 슬라이스에 자체 정의.
 * 백엔드 집계 연동 시 cross-track 으로 승격되면 Tech Lead 가 @/shared/contracts 로 이관.
 */
export interface SubjectMastery {
  subject: Subject;
  /** 0–100 숙련도(%) — 회독 완료율 기반 집계. */
  masteryPercent: number;
}

const MASTERY_BY_SUBJECT: Record<Subject, number> = {
  국어: 62,
  수학: 70,
  영어: 58,
  사회탐구: 45,
  과학탐구: 48,
  직업탐구: 30,
  한국사: 66,
  "제2외국어/한문": 22,
};

const MOCK_SUBJECT_MASTERY: SubjectMastery[] = SUBJECTS.map((subject) => ({
  subject,
  masteryPercent: MASTERY_BY_SUBJECT[subject],
}));

export function useSubjectMastery(): SubjectMastery[] {
  return MOCK_SUBJECT_MASTERY;
}
