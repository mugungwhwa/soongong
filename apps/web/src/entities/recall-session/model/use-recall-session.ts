"use client";
import { useEffect, useState } from "react";
import { fetchRecallSession } from "../api";
import type { RecallSession } from "./types";

export type { RecallSession };

export interface RecallSessionState {
  session: RecallSession | null;
  loading: boolean;
  /** 조회 실패(인증/네트워크). 빈 큐(데이터 없음)는 error 가 아니라 session=null·loading=false. */
  error: boolean;
}

/**
 * questId 의 자가 회상 세션을 실데이터로 조회(읽기 전용).
 * mock 미사용 — 미로그인/빈 큐는 session=null 로 빈 상태를 그린다.
 */
export function useRecallSession(questId: string): RecallSessionState {
  const [state, setState] = useState<RecallSessionState>({
    session: null,
    loading: true,
    error: false,
  });

  useEffect(() => {
    let alive = true;
    setState({ session: null, loading: true, error: false });
    fetchRecallSession(questId)
      .then((session) => {
        if (alive) setState({ session, loading: false, error: false });
      })
      .catch(() => {
        if (alive) setState({ session: null, loading: false, error: true });
      });
    return () => {
      alive = false;
    };
  }, [questId]);

  return state;
}
