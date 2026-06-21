import type { Subject, FormulaFormat, QuestRiskLevel } from "@/shared/contracts";

/**
 * 자가 회상 세션 view-model — 회독 진행 화면(views/play)이 읽는 표시 데이터.
 *
 * 읽기 전용 표시 모델. 채점·진행·스케줄 로직과 무관(SOO-104 Tech Lead 경계).
 * 실데이터 조회는 ../api 의 fetchRecallSession 이 담당한다.
 */
export interface RecallSession {
  questId: string;
  /** 진행 표시(현재/전체). 표시 전용 — 실제 진행 상태 전이는 엔진 담당. */
  progress: { current: number; total: number };
  subject: Subject;
  /** 단원/맥락 라벨. 예) 수학Ⅱ · 미분 */
  unit: string;
  /** 회독 D-day 라벨. 예) D-0 */
  dday: string;
  /** 망각 위험도 3단(데사처드 pill). */
  riskLevel: QuestRiskLevel;
  /** 인출 안내 kicker. 예) 기억 인출 · 떠올려 보세요 */
  kicker: string;
  /** 떠올릴 개념. 예) 미분계수의 정의 */
  concept: string;
  /** 인출 프롬프트(질문). */
  prompt: string;
  /** 공개될 정답 본문. */
  answerText: string;
  /** 정답 본문 렌더 포맷(latex/plaintext). */
  answerFormat: FormulaFormat;
  /** 정답 보조 설명 한 줄. */
  answerNote: string;
}
