import { describe, it, expect } from "vitest";
import {
  normalizeSubject,
  isLowConfidence,
  LOW_CONFIDENCE_THRESHOLD,
} from "../subject";

describe("normalizeSubject", () => {
  it("계약 3과목은 그대로 통과", () => {
    expect(normalizeSubject("수학")).toBe("수학");
    expect(normalizeSubject("영어")).toBe("영어");
    expect(normalizeSubject("국어")).toBe("국어");
  });

  it("앞뒤 공백은 trim 후 매칭", () => {
    expect(normalizeSubject("  수학 ")).toBe("수학");
  });

  it("계약 밖 과목(과학·사회·기타 등)은 null → 폴백 유도", () => {
    expect(normalizeSubject("과학")).toBeNull();
    expect(normalizeSubject("사회")).toBeNull();
    expect(normalizeSubject("기타")).toBeNull();
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
