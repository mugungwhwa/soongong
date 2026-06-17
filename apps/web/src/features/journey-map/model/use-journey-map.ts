"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { fetchJourneyMap } from "../api";
import type { JourneyMap, JourneyNode } from "./types";

interface JourneyMapState {
  /** far 데이터(summary/regions/hotspots). 진입 시 1회 로드. */
  map: JourneyMap | null;
  loading: boolean;
  error: string | null;
  /** region_code → near 노드 캐시. 전체 선페치 금지 — 영역별 lazy 적재. */
  regionNodes: Record<string, JourneyNode[]>;
  /** 현재 로딩 중인 region_code (near 페치 인디케이터용). */
  loadingRegion: string | null;
}

/** 저니탭 뉴럴 맵 데이터 훅.
 *  - 마운트 시 far(영역) 1회 로드.
 *  - ensureRegion(code): 해당 영역 노드를 lazy 페치(이미 있으면 no-op). LOD near 진입 시 호출. */
export function useJourneyMap() {
  const [state, setState] = useState<JourneyMapState>({
    map: null,
    loading: true,
    error: null,
    regionNodes: {},
    loadingRegion: null,
  });

  // in-flight 영역 요청 중복 방지(같은 영역 동시 진입 시 1회만).
  const inFlight = useRef<Set<string>>(new Set());
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    let active = true;
    fetchJourneyMap(null)
      .then((map) => {
        if (!active) return;
        setState((s) => ({ ...s, map, loading: false, error: null }));
      })
      .catch((e: unknown) => {
        if (!active) return;
        const message = e instanceof Error ? e.message : "여정 지도를 불러오지 못했습니다.";
        setState((s) => ({ ...s, loading: false, error: message }));
      });
    return () => {
      active = false;
      mounted.current = false;
    };
  }, []);

  const ensureRegion = useCallback(
    (regionCode: string) => {
      if (!regionCode) return;
      setState((s) => {
        if (s.regionNodes[regionCode] || inFlight.current.has(regionCode)) {
          return s;
        }
        inFlight.current.add(regionCode);
        // 비동기 페치는 setState 콜백 밖에서 트리거(아래 microtask).
        queueMicrotask(() => {
          fetchJourneyMap(regionCode)
            .then((res) => {
              if (!mounted.current) return;
              setState((prev) => ({
                ...prev,
                regionNodes: { ...prev.regionNodes, [regionCode]: res.nodes },
                loadingRegion: prev.loadingRegion === regionCode ? null : prev.loadingRegion,
              }));
            })
            .catch((e: unknown) => {
              console.error("[journey-map] ensureRegion:", e);
              if (!mounted.current) return;
              setState((prev) => ({
                ...prev,
                loadingRegion: prev.loadingRegion === regionCode ? null : prev.loadingRegion,
              }));
            })
            .finally(() => {
              inFlight.current.delete(regionCode);
            });
        });
        return { ...s, loadingRegion: regionCode };
      });
    },
    [],
  );

  return {
    map: state.map,
    loading: state.loading,
    error: state.error,
    regionNodes: state.regionNodes,
    loadingRegion: state.loadingRegion,
    ensureRegion,
  };
}
