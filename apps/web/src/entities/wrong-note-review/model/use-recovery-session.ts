"use client";
import { useEffect, useState } from "react";
import { fetchRecoverySession } from "../api";
import type { RecoverySession } from "../api";

export type { RecoverySession };

export interface RecoverySessionState {
  session: RecoverySession | null;
  loading: boolean;
  /** 조회 실패(인증/네트워크). 데이터 없음은 error 아니라 session=null·loading=false. */
  error: boolean;
}

/**
 * objectId의 오답회수 세션을 실데이터로 조회(읽기 전용).
 * mock 미사용 — 미로그인/빈 데이터는 session=null로 빈 상태 처리.
 */
export function useRecoverySession(objectId: string): RecoverySessionState {
  const [state, setState] = useState<RecoverySessionState>({
    session: null,
    loading: true,
    error: false,
  });

  useEffect(() => {
    let alive = true;
    setState({ session: null, loading: true, error: false });
    fetchRecoverySession(objectId)
      .then((session) => {
        if (alive) setState({ session, loading: false, error: false });
      })
      .catch(() => {
        if (alive) setState({ session: null, loading: false, error: true });
      });
    return () => {
      alive = false;
    };
  }, [objectId]);

  return state;
}
