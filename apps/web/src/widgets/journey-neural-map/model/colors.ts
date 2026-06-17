// 캔버스 색은 CSS 토큰(tokens.css)에서 런타임에 읽는다.
// → 컴포넌트에 hex 리터럴 0 (lint:tokens 통과), 팔레트 변경에 자동 추종(두 번째 SSoT 방지).

export interface JourneyPalette {
  /** 캔버스 표면 그라데이션 (글로우 대비용 딥 틸, 캔버스 한정). */
  bgCenter: string;
  bgEdge: string;
  /** 불빛 코어(가장 밝은 중심). */
  glowCore: string;
  /** 불빛 본체 — 밝기별 보간 양 끝. */
  litLow: string; // 막 켜진 약한 불 (mint-300)
  litHigh: string; // 또렷한 불 (mint-700)
  /** 흐려짐(망각) 틴트 — 위험도. */
  dimMid: string; // risk-mid
  dimHigh: string; // risk-high
  /** 라벨/외곽선 (캔버스 내부 텍스트는 inverse, 영역 외곽은 mint). */
  label: string;
  outline: string;
}

const TOKEN_KEYS = {
  bgCenter: "--journey-canvas-bg-center",
  bgEdge: "--journey-canvas-bg-edge",
  glowCore: "--color-mint-50",
  litLow: "--color-mint-300",
  litHigh: "--color-mint-700",
  dimMid: "--color-risk-mid",
  dimHigh: "--color-risk-high",
  label: "--color-text-inverse",
  outline: "--color-mint-500",
} as const;

/** :root에서 토큰 값을 읽어 팔레트 스냅샷 생성. 마운트 시 1회 호출. */
export function readJourneyPalette(): JourneyPalette {
  const cs = getComputedStyle(document.documentElement);
  const read = (k: string, fallback: string) => {
    const v = cs.getPropertyValue(k).trim();
    return v || fallback;
  };
  return {
    bgCenter: read(TOKEN_KEYS.bgCenter, "#1C5942"),
    bgEdge: read(TOKEN_KEYS.bgEdge, "#0E3326"),
    glowCore: read(TOKEN_KEYS.glowCore, "#ECF7F2"),
    litLow: read(TOKEN_KEYS.litLow, "#A8DCCB"),
    litHigh: read(TOKEN_KEYS.litHigh, "#4CAF88"),
    dimMid: read(TOKEN_KEYS.dimMid, "#FFEBA3"),
    dimHigh: read(TOKEN_KEYS.dimHigh, "#FFB4B4"),
    label: read(TOKEN_KEYS.label, "#FFFFFF"),
    outline: read(TOKEN_KEYS.outline, "#7BC4AE"),
  };
}

// ── 색 유틸 — 모두 런타임 문자열 입력(hex 리터럴 코드에 없음) ──────────

interface Rgb {
  r: number;
  g: number;
  b: number;
}

function parseHex(hex: string): Rgb {
  let h = hex.replace("#", "");
  if (h.length === 3) {
    h = h
      .split("")
      .map((c) => c + c)
      .join("");
  }
  const n = parseInt(h.slice(0, 6) || "000000", 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

export function rgba(hex: string, alpha: number): string {
  const { r, g, b } = parseHex(hex);
  return `rgba(${r}, ${g}, ${b}, ${clamp01(alpha)})`;
}

/** 두 색을 t(0~1)로 보간. */
export function mix(hexA: string, hexB: string, t: number): string {
  const a = parseHex(hexA);
  const b = parseHex(hexB);
  const k = clamp01(t);
  const r = Math.round(a.r + (b.r - a.r) * k);
  const g = Math.round(a.g + (b.g - a.g) * k);
  const bl = Math.round(a.b + (b.b - a.b) * k);
  return `rgb(${r}, ${g}, ${bl})`;
}

function clamp01(n: number): number {
  return n < 0 ? 0 : n > 1 ? 1 : n;
}

/** mastery(0~1) → 불빛 본체 색 (약→또렷). */
export function litColor(p: JourneyPalette, mastery: number): string {
  return mix(p.litLow, p.litHigh, mastery);
}
