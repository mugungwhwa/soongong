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
  // 이미 적재 완료한 영역(재요청 스킵). dedup 판단을 ref로만 해 stale 클로저 회피.
  const loaded = useRef<Set<string>>(new Set());
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

  const ensureRegion = useCallback((regionCode: string) => {
    if (!regionCode) return;
    // dedup·페치 트리거는 setState updater 밖에서 수행한다.
    // updater 안에 부수효과(inFlight.add·fetch)를 두면 React 18 Strict Mode/concurrent에서
    // updater가 2회 호출돼 중복 요청이 발생할 수 있음(CodeRabbit #4). 판단은 ref로만.
    if (loaded.current.has(regionCode) || inFlight.current.has(regionCode)) return;
    inFlight.current.add(regionCode);
    setState((s) => ({ ...s, loadingRegion: regionCode })); // 순수 상태 업데이트만

    fetchJourneyMap(regionCode)
      .then((res) => {
        loaded.current.add(regionCode);
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
  }, []);

  return {
    map: state.map,
    loading: state.loading,
    error: state.error,
    regionNodes: state.regionNodes,
    loadingRegion: state.loadingRegion,
    ensureRegion,
  };
}
