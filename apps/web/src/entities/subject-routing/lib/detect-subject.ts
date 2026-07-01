/**
 * 과목 얕은 판별 — A안: 수학·영어·국어·과학·사회·기타
 *
 * 규칙/키워드 기반 얕은 분류만. 온톨로지 트리·단원·베이지안 prior는 금지 영역(MOAT).
 * SSoT: SOO-151 (A안 확정). 신뢰도 임계값 0.35 미달 시 기타 + needsConfirmation=true.
 */

export type SubjectLabel = "수학" | "영어" | "국어" | "과학" | "사회" | "기타";
export type SubjectGroupCode = "math" | "english" | "korean" | "science" | "social" | "other";

export interface DetectedSubject {
  label: SubjectLabel;
  group: SubjectGroupCode;
  /** 0–1. 키워드 히트 수 + 타 과목 대비 마진으로 산출. */
  confidence: number;
  /** true 시 UI가 사용자에게 과목 확인 요청 (폴백 UI는 SOO-260701-01). */
  needsConfirmation: boolean;
}

const KEYWORDS: Record<Exclude<SubjectGroupCode, "other">, readonly string[]> = {
  math: [
    "함수", "미분", "적분", "방정식", "부등식", "벡터", "확률", "통계",
    "수열", "극값", "삼각", "수학", "log", "sin", "cos", "tan",
    "행렬", "집합", "명제", "직선", "포물선", "점화식", "이항",
    "극한", "연속", "미적분", "조합", "순열", "사인", "코사인",
  ],
  korean: [
    "문학", "독서", "화법", "작문", "문법", "국어", "현대시", "소설",
    "비문학", "시조", "고전", "서술어", "주어", "피동", "사동",
    "시제", "높임법", "음운", "형태소", "의미론", "산문", "운문",
    "수필", "희곡", "서사", "서정", "서경",
  ],
  english: [
    "영어", "grammar", "reading", "어법", "독해", "vocabulary", "english",
    "listening", "빈칸", "어순", "어휘", "writing", "passage",
    "comprehension", "paraphrase", "synonym", "tense", "clause",
    "preposition", "article", "modal", "conjunct",
  ],
  science: [
    "물리", "화학", "생물", "지구과학", "과학", "역학", "산화", "환원",
    "세포", "유전", "지진", "대기", "에너지", "전기", "자기",
    "광합성", "dna", "원소", "분자", "원자", "이온", "화합물",
    "생태계", "진화", "열역학", "파동", "빛", "지층", "화성암",
  ],
  social: [
    "사회", "역사", "지리", "경제", "정치", "법", "문화", "세계사",
    "한국사", "윤리", "민주주의", "시장", "헌법", "수출", "gdp",
    "헌법", "행정", "인권", "선거", "지방자치", "무역", "국제",
    "자본", "노동", "복지", "국가", "지형", "기후", "인구",
  ],
};

const SUBJECT_LABELS: Record<SubjectGroupCode, SubjectLabel> = {
  math: "수학",
  korean: "국어",
  english: "영어",
  science: "과학",
  social: "사회",
  other: "기타",
};

const ACTIVE_GROUPS = Object.keys(KEYWORDS) as Exclude<SubjectGroupCode, "other">[];

const CONFIDENCE_THRESHOLD = 0.35;

/**
 * 텍스트에서 상위 과목을 얕게 추론한다.
 *
 * 신뢰도 < 0.35 이면 label="기타", needsConfirmation=true 반환.
 * 키워드 히트 0 이면 confidence=0, 기타 반환.
 */
export function detectSubject(text: string): DetectedSubject {
  const lower = text.toLowerCase();

  const hits: Record<Exclude<SubjectGroupCode, "other">, number> = {} as never;
  for (const group of ACTIVE_GROUPS) {
    hits[group] = KEYWORDS[group].filter((kw) => lower.includes(kw)).length;
  }

  const totalHits = ACTIVE_GROUPS.reduce((s, g) => s + hits[g], 0);

  if (totalHits === 0) {
    return { label: "기타", group: "other", confidence: 0, needsConfirmation: true };
  }

  const ranked = [...ACTIVE_GROUPS].sort((a, b) => hits[b] - hits[a]);
  const topGroup = ranked[0];
  const topHits = hits[topGroup];
  const secondHits = hits[ranked[1]] ?? 0;

  // dominance: 상위 주제의 상대적 우위 (0–1)
  const dominance = (topHits - secondHits) / totalHits;
  // density: 키워드 히트 밀도 (3히트 이상이면 포화)
  const density = Math.min(1, topHits / 3);
  const confidence = Math.min(1, 0.55 * dominance + 0.45 * density);

  if (confidence < CONFIDENCE_THRESHOLD) {
    return { label: "기타", group: "other", confidence, needsConfirmation: true };
  }

  return {
    label: SUBJECT_LABELS[topGroup],
    group: topGroup,
    confidence,
    needsConfirmation: false,
  };
}
