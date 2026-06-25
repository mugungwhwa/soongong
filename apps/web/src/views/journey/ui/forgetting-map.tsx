"use client";

/**
 * 망각맵 — 순공냅스 시그니처 시각화 (SOO-128-naps 프로토타입 1:1).
 *
 * 진척을 "뇌 모양"으로 채우는 리텐션 맵: 아래(안정권)부터 차오르고, 위쪽 흐려진
 * 개념을 회독하면 빈 곳이 메워진다. 딥틸 캔버스(--journey-canvas-bg-*)는 design-lock
 * SOO-51이 순공냅스 캔버스 한정으로 허용한 예외 표면(§8 다크네이비 아님).
 *
 * 색은 tokens.css 팔레트 + opacity만 사용한다(네온 hex 금지 — lint:tokens & §8).
 * 노드 라벨/위험도는 실데이터(hotspots)에서 주입, 없으면 대표 샘플로 폴백한다.
 */

export type MapTone = "safe" | "mid" | "high";

export interface MapNode {
  label: string;
  cx: number;
  cy: number;
  r: number;
  tone: MapTone;
}

const TONE_FILL: Record<MapTone, string> = {
  safe: "#4CAF88",
  mid: "#FFEBA3",
  high: "#FFB4B4",
};

// 노드 글로우 색(팔레트 + opacity로 네온 회피).
const TONE_GLOW: Record<MapTone, string> = {
  safe: "#7BC4AE",
  mid: "#FFEBA3",
  high: "#FFB4B4",
};

// 뇌 외곽 path — 프로토타입과 동일 좌표(viewBox 0 0 360 300).
const BRAIN_PATH =
  "M180 62 C156 50 128 56 118 78 C96 70 74 80 72 102 C52 102 44 126 58 142 C46 156 50 180 70 188 C74 208 104 218 126 206 C140 222 170 224 184 210 C200 224 230 220 244 204 C268 214 296 202 300 180 C318 172 322 148 306 138 C318 122 312 98 290 100 C286 78 256 68 234 80 C222 56 198 52 180 62 Z";

// 개념 노드 사이 시냅스 연결선(정적 장식).
const LINKS: [number, number, number, number][] = [
  [92, 108, 165, 112],
  [165, 112, 248, 110],
  [92, 108, 112, 158],
  [165, 112, 182, 160],
  [248, 110, 286, 156],
  [112, 158, 182, 160],
  [182, 160, 286, 156],
  [112, 158, 104, 196],
  [182, 160, 196, 196],
  [286, 156, 246, 192],
  [196, 196, 104, 196],
  [196, 196, 246, 192],
];

/** 대표 샘플(데이터 없을 때 — prod 로그아웃 데모도 프로토타입처럼 보이게). */
export const SAMPLE_NODES: MapNode[] = [
  { label: "미분", cx: 165, cy: 112, r: 15, tone: "safe" },
  { label: "적분", cx: 182, cy: 160, r: 15, tone: "safe" },
  { label: "함수", cx: 112, cy: 158, r: 12, tone: "safe" },
  { label: "미적", cx: 246, cy: 192, r: 11, tone: "safe" },
  { label: "확률", cx: 196, cy: 196, r: 11, tone: "safe" },
  { label: "도형", cx: 104, cy: 196, r: 10, tone: "safe" },
  { label: "극한", cx: 92, cy: 108, r: 12, tone: "mid" },
  { label: "벡터", cx: 286, cy: 156, r: 11, tone: "mid" },
  { label: "수열", cx: 248, cy: 110, r: 10, tone: "high" },
];

// 라벨 글자색 — 채움 정도에 따른 가독 대비(팔레트 토큰 한정).
function labelColor(tone: MapTone): string {
  if (tone === "mid") return "#0E3326"; // 노랑 위 어두운 틸
  return "#FFFFFF"; // 초록/빨강 위 흰색
}

export function ForgettingMap({
  nodes = SAMPLE_NODES,
  fillPct = 62,
}: {
  nodes?: MapNode[];
  fillPct?: number;
}) {
  const pct = Math.max(0, Math.min(100, Math.round(fillPct)));
  // 채움 윗선: 0% → y=224(거의 빔), 100% → y=50(가득). 아래부터 차오름.
  const fillY = 224 - (pct / 100) * 174;

  return (
    <div
      style={{
        background:
          "radial-gradient(120% 100% at 50% 0%, var(--journey-canvas-bg-center), var(--journey-canvas-bg-edge))",
        borderRadius: "var(--radius-lg)",
        overflow: "hidden",
        position: "relative",
        boxShadow: "var(--shadow-elevated)",
      }}
    >
      <div
        style={{
          padding: "16px 18px 0",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
        }}
      >
        <h2
          style={{
            color: "#FFFFFF",
            fontSize: 16,
            fontWeight: 800,
            letterSpacing: "-0.02em",
          }}
        >
          망각맵
        </h2>
        <span
          style={{
            display: "flex",
            alignItems: "center",
            gap: 7,
            color: "#FFFFFF",
            fontSize: 11.5,
            fontWeight: 800,
          }}
        >
          기억 채움 {pct}%
          <span
            style={{
              width: 52,
              height: 7,
              borderRadius: "var(--radius-pill)",
              background: "rgba(255,255,255,0.18)",
              overflow: "hidden",
            }}
          >
            <span
              style={{
                display: "block",
                height: "100%",
                width: `${pct}%`,
                background: "linear-gradient(90deg, #7BC4AE, #A8DCCB)",
                borderRadius: "var(--radius-pill)",
              }}
            />
          </span>
        </span>
      </div>

      <svg
        viewBox="0 0 360 300"
        style={{ width: "100%", height: "auto", display: "block" }}
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="fmFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#7BC4AE" stopOpacity="0" />
            <stop offset="1" stopColor="#7BC4AE" stopOpacity="0.34" />
          </linearGradient>
          <clipPath id="fmBrain">
            <path d={BRAIN_PATH} />
          </clipPath>
        </defs>

        {/* 아래부터 차오르는 기억 채움 */}
        <g clipPath="url(#fmBrain)">
          <rect x="0" y={fillY} width="360" height={300 - fillY} fill="url(#fmFill)" />
          <path
            d={`M30 ${fillY + 4} Q 110 ${fillY - 4} 195 ${fillY + 4} T 360 ${fillY + 1} L360 300 L0 300 Z`}
            fill="#7BC4AE"
            fillOpacity="0.16"
          />
        </g>

        {/* 뇌 외곽 */}
        <path d={BRAIN_PATH} fill="none" stroke="#A8DCCB" strokeWidth="2.2" opacity="0.9" />
        <path
          d="M180 64 C173 112 187 152 180 214"
          fill="none"
          stroke="#7BC4AE"
          strokeWidth="1.5"
          opacity="0.5"
        />

        {/* 시냅스 연결선 */}
        <g stroke="#2E7D5B" strokeWidth="1.4" opacity="0.5">
          {LINKS.map(([x1, y1, x2, y2], i) => (
            <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />
          ))}
        </g>

        {/* 개념 노드 (글로우 + 코어 + 라벨) */}
        {nodes.map((n, i) => (
          <g key={i}>
            <circle cx={n.cx} cy={n.cy} r={n.r + 8} fill={TONE_GLOW[n.tone]} opacity="0.22" />
            <circle cx={n.cx} cy={n.cy} r={n.r} fill={TONE_FILL[n.tone]} />
            <text
              x={n.cx}
              y={n.cy + 3}
              fill={labelColor(n.tone)}
              fontSize="9"
              fontWeight="700"
              textAnchor="middle"
              fontFamily="Pretendard, sans-serif"
            >
              {n.label}
            </text>
          </g>
        ))}
      </svg>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 12,
          padding: "6px 18px 14px",
        }}
      >
        <Legend color="#4CAF88" label="장기기억·안정권" />
        <Legend color="#FFEBA3" label="불안정" />
        <Legend color="#FFB4B4" label="위험(곧 잊혀요)" />
      </div>

      <div
        style={{
          padding: "0 18px 16px",
          color: "#A8DCCB",
          fontSize: 12,
          lineHeight: 1.5,
        }}
      >
        회독할수록 <b style={{ color: "#FFFFFF" }}>뇌가 채워집니다.</b> 아래(안정권)부터
        차오르고, 위쪽 흐려진 개념을 회독하면 빈 곳이 메워져요.
      </div>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        fontSize: 11.5,
        color: "#A8DCCB",
        fontWeight: 600,
      }}
    >
      <span
        style={{
          width: 11,
          height: 11,
          borderRadius: "50%",
          background: color,
        }}
      />
      {label}
    </span>
  );
}
