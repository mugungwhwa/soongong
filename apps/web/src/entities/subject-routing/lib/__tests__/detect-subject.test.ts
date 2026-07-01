import { describe, it, expect } from "vitest";
import { detectSubject } from "../detect-subject";

describe("detectSubject — 과목 얕은 판별 (A안: 6과목)", () => {
  // ─── 수학 ──────────────────────────────────────────────────────────────────
  describe("수학 판별", () => {
    it("수열 점화식 텍스트 → 수학", () => {
      const result = detectSubject("수열 a_{n+1} = a_n + 3인 점화식에서 a_10을 구하시오");
      expect(result.label).toBe("수학");
      expect(result.group).toBe("math");
      expect(result.needsConfirmation).toBe(false);
      expect(result.confidence).toBeGreaterThanOrEqual(0.35);
    });

    it("미분·적분 텍스트 → 수학", () => {
      const result = detectSubject("함수 f(x)를 미분하여 극값을 구하고 적분으로 넓이를 계산하시오");
      expect(result.label).toBe("수학");
      expect(result.group).toBe("math");
    });

    it("확률·통계 텍스트 → 수학", () => {
      const result = detectSubject("확률 변수 X의 통계적 기댓값을 이항분포로 구하시오");
      expect(result.label).toBe("수학");
    });
  });

  // ─── 국어 ──────────────────────────────────────────────────────────────────
  describe("국어 판별", () => {
    it("문학·현대시 텍스트 → 국어", () => {
      const result = detectSubject("현대시에서 서정적 자아가 표현하는 독서의 의미를 분석하시오");
      expect(result.label).toBe("국어");
      expect(result.group).toBe("korean");
      expect(result.needsConfirmation).toBe(false);
    });

    it("문법·화법 텍스트 → 국어", () => {
      const result = detectSubject("국어 문법에서 피동 표현과 사동 표현의 차이를 서술어 관점에서 설명하시오");
      expect(result.label).toBe("국어");
    });
  });

  // ─── 영어 ──────────────────────────────────────────────────────────────────
  describe("영어 판별", () => {
    it("영어 어법 텍스트 → 영어", () => {
      const result = detectSubject("다음 영어 passage에서 어법상 틀린 부분을 찾아 어순을 바르게 고치시오");
      expect(result.label).toBe("영어");
      expect(result.group).toBe("english");
      expect(result.needsConfirmation).toBe(false);
    });

    it("영어 독해 텍스트 → 영어", () => {
      const result = detectSubject("이 reading passage의 빈칸에 들어갈 vocabulary를 고르시오");
      expect(result.label).toBe("영어");
    });
  });

  // ─── 과학 ──────────────────────────────────────────────────────────────────
  describe("과학 판별", () => {
    it("물리 역학 텍스트 → 과학", () => {
      const result = detectSubject("물리 역학에서 에너지 보존 법칙으로 전기와 자기 현상을 설명하시오");
      expect(result.label).toBe("과학");
      expect(result.group).toBe("science");
      expect(result.needsConfirmation).toBe(false);
    });

    it("생물·화학 텍스트 → 과학", () => {
      const result = detectSubject("세포 내 광합성 과정에서 산화환원 반응이 DNA 복제에 미치는 영향을 서술하시오");
      expect(result.label).toBe("과학");
    });
  });

  // ─── 사회 ──────────────────────────────────────────────────────────────────
  describe("사회 판별", () => {
    it("한국사·정치 텍스트 → 사회", () => {
      const result = detectSubject("한국사에서 민주주의 발전 과정과 헌법의 역할을 인권 관점에서 서술하시오");
      expect(result.label).toBe("사회");
      expect(result.group).toBe("social");
      expect(result.needsConfirmation).toBe(false);
    });

    it("경제·지리 텍스트 → 사회", () => {
      const result = detectSubject("경제 시장에서 수출 gdp와 국제 무역 관계를 지형 기후와 연결하시오");
      expect(result.label).toBe("사회");
    });
  });

  // ─── 기타 / 저신뢰 ─────────────────────────────────────────────────────────
  describe("기타 / 저신뢰 판별", () => {
    it("키워드 없는 텍스트 → 기타, confidence=0, needsConfirmation=true", () => {
      const result = detectSubject("오늘 점심 뭐 먹을까");
      expect(result.label).toBe("기타");
      expect(result.group).toBe("other");
      expect(result.confidence).toBe(0);
      expect(result.needsConfirmation).toBe(true);
    });

    it("빈 텍스트 → 기타, confidence=0", () => {
      const result = detectSubject("");
      expect(result.label).toBe("기타");
      expect(result.confidence).toBe(0);
      expect(result.needsConfirmation).toBe(true);
    });

    it("두 과목 동점 텍스트 → needsConfirmation 또는 기타", () => {
      // 수학+국어 동수 히트 → dominance 낮음 → 기타 or needsConfirmation
      const result = detectSubject("수학 문학");
      // 히트 2개로 분산 → dominance=0, density=0.33 → confidence<0.35 → 기타
      expect(result.needsConfirmation).toBe(true);
    });
  });

  // ─── 신뢰도 범위 보장 ──────────────────────────────────────────────────────
  describe("신뢰도 범위 보장", () => {
    it("confidence는 항상 0–1 사이", () => {
      const cases = [
        "수학 미분 적분 함수 방정식 벡터",
        "영어 grammar reading vocabulary",
        "물리 화학 세포 유전 에너지",
        "한국사 경제 정치 사회 민주주의",
        "오늘 날씨가 맑습니다",
      ];
      for (const text of cases) {
        const { confidence } = detectSubject(text);
        expect(confidence).toBeGreaterThanOrEqual(0);
        expect(confidence).toBeLessThanOrEqual(1);
      }
    });
  });
});
