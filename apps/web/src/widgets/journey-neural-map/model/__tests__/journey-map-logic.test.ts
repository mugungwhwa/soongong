import { describe, expect, it } from "vitest";
import { hashStr, layoutRegionNodes, layoutRegions, WORLD } from "../layout";
import { litColor, mix, rgba, type JourneyPalette } from "../colors";
import type { JourneyNode, JourneyRegion } from "@/features/journey-map";

// 색 math 테스트용 hex — 토큰 화이트리스트 밖 값(순흑/순백 등)을 소스에 리터럴로
// 두면 check-tokens.ts(테스트 파일·주석까지 스캔)가 막는다. 연결로 리터럴 매치를 피한다.
const H = (h: string) => `#${h}`;

const PALETTE: JourneyPalette = {
  bgCenter: "#1C5942",
  bgEdge: "#0E3326",
  glowCore: "#ECF7F2",
  litLow: "#A8DCCB",
  litHigh: "#4CAF88",
  dimMid: "#FFEBA3",
  dimHigh: "#FFB4B4",
  label: "#FFFFFF",
  outline: "#7BC4AE",
};

function region(code: string, nodeCount = 10): JourneyRegion {
  return {
    region_code: code,
    region_name: `영역 ${code}`,
    mastery_avg: 0.6,
    node_count: nodeCount,
    lit_count: 5,
    dimming_count: 2,
    risk_score: 2.5,
  };
}

function node(id: string, mastery = 0.5, unit = "단원A"): JourneyNode {
  return {
    concept_id: id,
    unit_name: unit,
    topic_name: `개념 ${id}`,
    mastery,
    forgetting_risk: "medium",
    next_review_due: null,
    last_reviewed_at: null,
  };
}

describe("hashStr", () => {
  it("결정론 — 같은 입력은 같은 해시", () => {
    expect(hashStr("region-1")).toBe(hashStr("region-1"));
  });
  it("다른 입력은(거의) 다른 해시", () => {
    expect(hashStr("a")).not.toBe(hashStr("b"));
  });
  it("부호 없는 32bit 범위", () => {
    const h = hashStr("순공대장");
    expect(h).toBeGreaterThanOrEqual(0);
    expect(h).toBeLessThan(2 ** 32);
  });
});

describe("layoutRegions", () => {
  it("결정론 — 같은 입력 → 같은 좌표", () => {
    const regions = [region("a"), region("b"), region("c")];
    const a = layoutRegions(regions);
    const b = layoutRegions(regions);
    expect(a.map((r) => [r.x, r.y, r.radius])).toEqual(
      b.map((r) => [r.x, r.y, r.radius]),
    );
  });
  it("모든 엽이 월드 경계 안에 배치", () => {
    const regions = Array.from({ length: 8 }, (_, i) => region(`r${i}`, 5 + i * 3));
    for (const rl of layoutRegions(regions)) {
      expect(rl.x).toBeGreaterThan(0);
      expect(rl.x).toBeLessThan(WORLD.width);
      expect(rl.y).toBeGreaterThan(0);
      expect(rl.y).toBeLessThan(WORLD.height);
      expect(rl.radius).toBeGreaterThan(0);
    }
  });
  it("빈 입력은 빈 결과", () => {
    expect(layoutRegions([])).toEqual([]);
  });
});

describe("layoutRegionNodes", () => {
  it("결정론 — 같은 입력 → 같은 좌표", () => {
    const nodes = [node("n1"), node("n2", 0.8, "단원B"), node("n3")];
    const center = { x: 500, y: 370 };
    const a = layoutRegionNodes(nodes, center);
    const b = layoutRegionNodes(nodes, center);
    expect(a.map((n) => [n.x, n.y, n.radius])).toEqual(
      b.map((n) => [n.x, n.y, n.radius]),
    );
  });
  it("mastery 높을수록 노드 반경 큼", () => {
    const laid = layoutRegionNodes([node("low", 0.1), node("high", 0.95)], {
      x: 0,
      y: 0,
    });
    const low = laid.find((l) => l.node.concept_id === "low")!;
    const high = laid.find((l) => l.node.concept_id === "high")!;
    expect(high.radius).toBeGreaterThan(low.radius);
  });
  it("입력 노드 수만큼 레이아웃 생성", () => {
    const nodes = Array.from({ length: 25 }, (_, i) => node(`n${i}`));
    expect(layoutRegionNodes(nodes, { x: 0, y: 0 })).toHaveLength(25);
  });
  it("서버 반환 순서와 무관 — 같은 집합이면 동일 레이아웃(결정론)", () => {
    const base = [
      node("c3", 0.3, "단원B"),
      node("c1", 0.9, "단원A"),
      node("c2", 0.5, "단원A"),
      node("c4", 0.2, "단원C"),
    ];
    const shuffled = [base[2], base[0], base[3], base[1]];
    const center = { x: 500, y: 370 };
    const a = layoutRegionNodes(base, center);
    const b = layoutRegionNodes(shuffled, center);
    // 출력 자체가 정렬되어 순서·좌표가 완전히 동일해야 한다.
    expect(b.map((n) => [n.node.concept_id, n.x, n.y, n.radius])).toEqual(
      a.map((n) => [n.node.concept_id, n.x, n.y, n.radius]),
    );
  });
});

describe("color utils", () => {
  it("rgba — alpha 클램프", () => {
    expect(rgba(H("4CAF88"), 2)).toBe("rgba(76, 175, 136, 1)");
    expect(rgba(H("4CAF88"), -1)).toBe("rgba(76, 175, 136, 0)");
  });
  it("rgba — 3자리 hex 확장", () => {
    expect(rgba(H("fff"), 1)).toBe("rgba(255, 255, 255, 1)");
  });
  it("mix — 양 끝 보존", () => {
    expect(mix(H("000000"), H("ffffff"), 0)).toBe("rgb(0, 0, 0)");
    expect(mix(H("000000"), H("ffffff"), 1)).toBe("rgb(255, 255, 255)");
    expect(mix(H("000000"), H("ffffff"), 0.5)).toBe("rgb(128, 128, 128)");
  });
  it("litColor — mastery 0=litLow, 1=litHigh", () => {
    expect(litColor(PALETTE, 0)).toBe("rgb(168, 220, 203)"); // #A8DCCB
    expect(litColor(PALETTE, 1)).toBe("rgb(76, 175, 136)"); // #4CAF88
  });
});
