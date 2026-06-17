"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Brain, RefreshCw } from "lucide-react";
import { useJourneyMap } from "@/features/journey-map";
import { ROUTES } from "@/shared/config/routes";
import { readJourneyPalette, type JourneyPalette } from "../model/colors";
import { JOURNEY_MAP_STRINGS as S } from "../model/strings";
import { MetricCards } from "./metric-cards";
import { HotspotPanel } from "./hotspot-panel";
import { NeuralCanvas } from "./neural-canvas";

/** prefers-reduced-motion 구독(펄스/관성 감쇠). */
function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

/** 저니탭 뉴럴 망각맵 위젯.
 *  지표 카드(탐험률·생생도) + 뉴럴 맵 캔버스 + "지금 흐려지는 곳" 패널.
 *  데이터는 get_journey_map RPC만 소비(망각/FSRS 재계산 0). */
export function JourneyNeuralMap() {
  const router = useRouter();
  const { map, loading, error, regionNodes, ensureRegion } = useJourneyMap();
  const reducedMotion = usePrefersReducedMotion();

  // 진입 시 핫스팟 패널 펼친 채(망각 상시 노출).
  const [hotspotExpanded, setHotspotExpanded] = useState(true);

  // 토큰 팔레트 스냅샷(마운트 시 1회 읽기 — 클라이언트 전용).
  const [palette, setPalette] = useState<JourneyPalette | null>(null);
  useEffect(() => {
    setPalette(readJourneyPalette());
  }, []);

  // 최악(위험도 최고) 영역 — RPC가 risk_score desc 정렬 → regions[0].
  const autoFocusRegionCode = useMemo(
    () => map?.regions[0]?.region_code ?? null,
    [map],
  );

  // ensureRegion 안정 참조(canvas는 마운트 시 1회 셋업).
  const ensureRef = useRef(ensureRegion);
  ensureRef.current = ensureRegion;

  if (loading) {
    return (
      <Frame>
        <div className="flex h-[280px] items-center justify-center text-sm text-[var(--color-text-muted)]">
          {S.loading}
        </div>
      </Frame>
    );
  }

  if (error || !map) {
    return (
      <Frame>
        <div className="flex h-[240px] flex-col items-center justify-center gap-[var(--space-3)] text-center">
          <p className="text-sm font-semibold text-[var(--color-text-strong)]">
            {S.errorTitle}
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="flex items-center gap-1.5 rounded-[var(--radius-pill)] border border-[var(--color-border-default)] bg-[var(--color-surface)] px-[var(--space-4)] py-[var(--space-2)] text-sm font-semibold text-[var(--color-mint-700)]"
          >
            <RefreshCw size={14} strokeWidth={2.4} />
            {S.errorRetry}
          </button>
        </div>
      </Frame>
    );
  }

  const isEmpty = map.regions.length === 0 && map.summary.scope_total === 0;

  return (
    <Frame>
      <MetricCards summary={map.summary} />

      {isEmpty ? (
        <div className="flex flex-col items-center gap-[var(--space-2)] rounded-[var(--radius-lg)] border border-[var(--color-border-default)] bg-[var(--color-surface)] p-[var(--space-8)] text-center shadow-[var(--shadow-card)]">
          <p className="text-base font-bold text-[var(--color-text-strong)]">{S.emptyTitle}</p>
          <p className="text-sm text-[var(--color-text-muted)]">{S.emptyHint}</p>
        </div>
      ) : (
        <>
          <div className="relative h-[clamp(300px,52vh,520px)] w-full overflow-hidden rounded-[var(--radius-lg)] shadow-[var(--shadow-card)]">
            {palette && (
              <NeuralCanvas
                regions={map.regions}
                regionNodes={regionNodes}
                palette={palette}
                reducedMotion={reducedMotion}
                autoFocusRegionCode={autoFocusRegionCode}
                onRegionEnter={(code) => ensureRef.current(code)}
                onNodeTap={(conceptId) => router.push(ROUTES.recovery(conceptId))}
              />
            )}
            <p className="pointer-events-none absolute bottom-[var(--space-2)] left-1/2 -translate-x-1/2 rounded-[var(--radius-pill)] bg-[var(--color-scrim)] px-[var(--space-3)] py-1 text-[11px] font-medium text-[var(--color-text-inverse)]">
              {S.lodHintFar}
            </p>
          </div>

          <HotspotPanel
            hotspots={map.hotspots}
            expanded={hotspotExpanded}
            onToggle={() => setHotspotExpanded((v) => !v)}
          />
        </>
      )}
    </Frame>
  );
}

/** 섹션 헤더 + 수직 스택 래퍼. */
function Frame({ children }: { children: React.ReactNode }) {
  return (
    <section aria-label={S.sectionTitle} className="flex flex-col gap-[var(--space-4)]">
      <header className="flex items-center gap-[var(--space-2)]">
        <span
          className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-mint-50)] text-[var(--color-mint-700)]"
          aria-hidden="true"
        >
          <Brain size={18} strokeWidth={2.2} />
        </span>
        <div>
          <h2 className="text-base font-bold text-[var(--color-text-strong)]">
            {S.sectionTitle}
          </h2>
          <p className="text-xs text-[var(--color-text-muted)]">{S.sectionSubtitle}</p>
        </div>
      </header>
      {children}
    </section>
  );
}
