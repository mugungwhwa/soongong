import { SUBJECTS, type Subject } from "@/shared/contracts/common";

/**
 * 엔진(parse-ocr / detect-subject)이 실어줄 수 있는 구(舊)·약식 라벨 → 수능 영역 정규 라벨.
 *
 * 엔진 얕은 판별(SOO-151)은 아직 `과학`·`사회` 같은 약식 라벨을 낼 수 있어 수능 영역으로 접어준다.
 * `기타`처럼 매핑 대상이 없는 값은 여기 없으므로 `null` → 폴백으로 흐른다.
 */
const SUBJECT_ALIASES: Record<string, Subject> = {
  과학: "과학탐구",
  사회: "사회탐구",
  한문: "제2외국어/한문",
  제2외국어: "제2외국어/한문",
};

/**
 * parse-ocr 원시 과목 문자열을 확정/수정 UI가 쓰는 정규 과목으로 정규화한다(SOO-150).
 *
 * 과목 라벨 체계는 Tech Lead 소유 계약(`shared/contracts/common.ts`)이 **수능 영역**으로 잠갔다
 * (Mike 결정). 정규 라벨과 정확히 일치하면 그대로, 구·약식 라벨은 {@link SUBJECT_ALIASES}로 접고,
 * 그 외/미상 문자열은 `null` → "과목을 선택해주세요" 폴백을 유도한다.
 */
export function normalizeSubject(raw: string | null | undefined): Subject | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if ((SUBJECTS as readonly string[]).includes(trimmed)) {
    return trimmed as Subject;
  }
  return SUBJECT_ALIASES[trimmed] ?? null;
}

/** parse-ocr가 confidence를 실어줄 때 이 값 미만이면 "확인 필요"로 본다(현재 미제공 → 항상 confident). */
export const LOW_CONFIDENCE_THRESHOLD = 0.6;

/** confidence가 저신뢰(임계값 미만)인지. null(미제공)은 신뢰 있음으로 처리한다. */
export function isLowConfidence(confidence: number | null): boolean {
  return confidence !== null && confidence < LOW_CONFIDENCE_THRESHOLD;
}
