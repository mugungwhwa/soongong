import { SUBJECTS, type Subject } from "@/shared/contracts/common";

/**
 * parse-ocr 원시 과목 문자열을 확정/수정 UI가 쓰는 정규 과목으로 정규화한다(SOO-150).
 *
 * MVP 1차 지원 과목은 Tech Lead 소유 계약(`shared/contracts/common.ts`, 전략정리 §4.3)이 잠근
 * 3과목(수학·영어·국어)뿐이다. 범위 밖/미상 문자열은 `null` → "과목을 선택해주세요" 폴백.
 *
 * 티켓 A안은 6과목(+과학·사회·기타)을 제시하나, 3과목 계약 확장은 Tech Lead 경유 사항이라
 * 여기서 임의 확장하지 않는다. 계약이 6과목으로 열리면 `SUBJECTS` 한 곳만 바뀌면 자동 반영된다.
 */
export function normalizeSubject(raw: string | null | undefined): Subject | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  return (SUBJECTS as readonly string[]).includes(trimmed)
    ? (trimmed as Subject)
    : null;
}

/** parse-ocr가 confidence를 실어줄 때 이 값 미만이면 "확인 필요"로 본다(현재 미제공 → 항상 confident). */
export const LOW_CONFIDENCE_THRESHOLD = 0.6;

/** confidence가 저신뢰(임계값 미만)인지. null(미제공)은 신뢰 있음으로 처리한다. */
export function isLowConfidence(confidence: number | null): boolean {
  return confidence !== null && confidence < LOW_CONFIDENCE_THRESHOLD;
}
