"use client";
import type { Subject, FormulaFormat, QuestRiskLevel } from "@/shared/contracts";

/**
 * 자가 회상 세션 view-model — 회독 진행 화면(views/play)이 읽는 표시 데이터.
 *
 * 읽기 전용. 채점·진행·스케줄 로직과 무관(SOO-104 Tech Lead 경계: 뷰는 read 훅만 소비,
 * grade write 는 features/quest-play 의 기존 영속화 경로로만 나간다).
 *
 * 현재 mock fixture(SOO-97 승인 시안 예시 내용). SOO-100 회독 read API가 랜딩하면
 * 이 훅 본문만 1곳 교체하면 되고 뷰는 무수정이다.
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

const MOCK_RECALL: RecallSession = {
  questId: "mock",
  progress: { current: 2, total: 5 },
  subject: "수학",
  unit: "수학Ⅱ · 미분",
  dday: "D-0",
  riskLevel: "high",
  kicker: "기억 인출 · 떠올려 보세요",
  concept: "미분계수의 정의",
  prompt:
    "함수 $f(x)$의 $x = a$에서의 미분계수를 극한으로 어떻게 정의하나요? 머릿속으로 먼저 떠올린 뒤 확인하세요.",
  answerText: "$f'(a) = \\lim_{h \\to 0} \\dfrac{f(a+h) - f(a)}{h}$",
  answerFormat: "latex",
  answerNote:
    "평균변화율의 극한 = 순간변화율. 접선의 기울기와 같은 값이에요. h를 0으로 보낼 때의 변화율이라는 점이 핵심.",
};

/** 현재 회독 진행의 자가 회상 세션을 반환. (현재 mock — SOO-100 랜딩 시 본문 스왑) */
export function useRecallSession(questId: string): RecallSession {
  return { ...MOCK_RECALL, questId };
}
