import { describe, it, expect } from "vitest";
import {
  normalizeSubject,
  isLowConfidence,
  LOW_CONFIDENCE_THRESHOLD,
} from "../subject";

describe("normalizeSubject", () => {
  it("수능 영역 정규 라벨은 그대로 통과", () => {
    expect(normalizeSubject("국어")).toBe("국어");
    expect(normalizeSubject("수학")).toBe("수학");
    expect(normalizeSubject("영어")).toBe("영어");
    expect(normalizeSubject("한국사")).toBe("한국사");
    expect(normalizeSubject("직업탐구")).toBe("직업탐구");
    expect(normalizeSubject("제2외국어/한문")).toBe("제2외국어/한문");
  });

  it("앞뒤 공백은 trim 후 매칭", () => {
    expect(normalizeSubject("  수학 ")).toBe("수학");
  });

  it("엔진 약식 라벨은 수능 영역으로 접어준다", () => {
    expect(normalizeSubject("과학")).toBe("과학탐구");
    expect(normalizeSubject("사회")).toBe("사회탐구");
    expect(normalizeSubject("한문")).toBe("제2외국어/한문");
  });

  it("매핑 대상 없는 값(기타 등)은 null → 폴백 유도", () => {
    expect(normalizeSubject("기타")).toBeNull();
    expect(normalizeSubject("음악")).toBeNull();
  });

  it("빈/미상 입력은 null", () => {
    expect(normalizeSubject("")).toBeNull();
    expect(normalizeSubject(null)).toBeNull();
    expect(normalizeSubject(undefined)).toBeNull();
  });
});

describe("isLowConfidence", () => {
  it("null(미제공)은 신뢰 있음으로 처리", () => {
    expect(isLowConfidence(null)).toBe(false);
  });

  it("임계값 미만은 저신뢰", () => {
    expect(isLowConfidence(LOW_CONFIDENCE_THRESHOLD - 0.01)).toBe(true);
    expect(isLowConfidence(0)).toBe(true);
  });

  it("임계값 이상은 신뢰 있음", () => {
    expect(isLowConfidence(LOW_CONFIDENCE_THRESHOLD)).toBe(false);
    expect(isLowConfidence(0.99)).toBe(false);
  });
});
