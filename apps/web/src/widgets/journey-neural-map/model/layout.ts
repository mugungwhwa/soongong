// 결정론 레이아웃 — 노드/영역 위치는 id 해시로 고정한다.
// Math.random 금지: 위치가 매 렌더 동일해야 펄스/줌 중 지터가 없고(버터),
// auto-focus·hit-test도 안정적으로 동작한다.

import type { JourneyNode, JourneyRegion } from "@/features/journey-map";

/** 월드 좌표(논리 단위). 뷰포트 transform이 화면에 매핑. */
export const WORLD = { width: 1000, height: 740 } as const;

const CENTER = { x: WORLD.width / 2, y: WORLD.height / 2 };
// 뇌 실루엣 타원 반경(엽 배치 가능 영역). 가장자리 여백 확보.
const BRAIN_RX = WORLD.width * 0.4;
const BRAIN_RY = WORLD.height * 0.36;

const GOLDEN_ANGLE = 2.399963229728653; // 라디안

/** 문자열 → 32bit 해시(FNV-1a 변형). 결정론. */
export function hashStr(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** 해시 → [0,1) 의사난수(결정론). */
function hash01(seed: string): number {
  return (hashStr(seed) % 100000) / 100000;
}

export interface RegionLayout {
  region: JourneyRegion;
  x: number;
  y: number;
  /** 엽 반경(월드 단위) — node_count·dimming 반영. */
  radius: number;
}

/** 영역(엽)을 뇌 실루엣 안에 phyllotaxis(해바라기) 분포로 고르게 배치.
 *  risk_score desc 정렬 입력 → index 0(최악)이 중앙 가까이. */
export function layoutRegions(regions: JourneyRegion[]): RegionLayout[] {
  const n = Math.max(regions.length, 1);
  return regions.map((region, i) => {
    const frac = (i + 0.5) / n;
    const r = Math.sqrt(frac); // 0(중앙)→1(가장자리)
    const angle = i * GOLDEN_ANGLE + hash01(region.region_code) * 0.6;
    const jx = (hash01(region.region_code + "x") - 0.5) * 40;
    const jy = (hash01(region.region_code + "y") - 0.5) * 40;
    const x = CENTER.x + Math.cos(angle) * r * BRAIN_RX + jx;
    const y = CENTER.y + Math.sin(angle) * r * BRAIN_RY + jy;
    // 엽 크기: 개념 수 많을수록 큼(로그 스케일), 60~120 범위.
    const radius = 60 + Math.min(60, Math.log2(region.node_count + 1) * 14);
    return { region, x, y, radius };
  });
}

export interface NodeLayout {
  node: JourneyNode;
  x: number;
  y: number;
  radius: number;
}

/** 한 영역 노드(near)를 단원(unit)별 클러스터로 배치.
 *  unit 클러스터를 영역 중심 주위 링에, 노드를 unit 중심 주위에 phyllotaxis. */
export function layoutRegionNodes(
  nodes: JourneyNode[],
  regionCenter: { x: number; y: number },
): NodeLayout[] {
  // unit_name 별 그룹화(없으면 단일 그룹).
  const groups = new Map<string, JourneyNode[]>();
  for (const node of nodes) {
    const key = node.unit_name ?? "·";
    const arr = groups.get(key);
    if (arr) arr.push(node);
    else groups.set(key, [node]);
  }

  // unit 키를 사전식 정렬 → ui 인덱스가 서버 반환 순서와 무관하게 고정(결정론).
  const unitKeys = [...groups.keys()].sort();
  const unitCount = Math.max(unitKeys.length, 1);
  // 영역 전개 반경 — 노드 많을수록 넓게.
  const spread = 120 + Math.min(200, nodes.length * 4);

  const out: NodeLayout[] = [];
  unitKeys.forEach((unitKey, ui) => {
    // 그룹 내 노드도 concept_id로 안정 정렬 → i 인덱스 고정(hit-test 안정).
    const groupNodes = [...groups.get(unitKey)!].sort((a, b) =>
      a.concept_id < b.concept_id ? -1 : a.concept_id > b.concept_id ? 1 : 0,
    );
    const uFrac = unitCount === 1 ? 0 : ui / unitCount;
    const uAngle = uFrac * Math.PI * 2 + hash01(unitKey) * 0.5;
    const uRadius = unitCount === 1 ? 0 : spread * (0.45 + 0.4 * Math.sqrt((ui + 0.5) / unitCount));
    const ucx = regionCenter.x + Math.cos(uAngle) * uRadius;
    const ucy = regionCenter.y + Math.sin(uAngle) * uRadius;

    const m = Math.max(groupNodes.length, 1);
    groupNodes.forEach((node, i) => {
      const frac = (i + 0.5) / m;
      const r = Math.sqrt(frac) * (40 + Math.min(70, m * 6));
      const angle = i * GOLDEN_ANGLE + hash01(node.concept_id);
      const x = ucx + Math.cos(angle) * r;
      const y = ucy + Math.sin(angle) * r;
      // 노드 크기: mastery 높을수록 큼(또렷). 8~20.
      const radius = 8 + node.mastery * 12;
      out.push({ node, x, y, radius });
    });
  });
  return out;
}

export { CENTER, BRAIN_RX, BRAIN_RY };
