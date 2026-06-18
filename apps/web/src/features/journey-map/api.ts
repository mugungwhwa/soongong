import { createClient } from "@/shared/lib/supabase/client";
import type { JourneyMap } from "./model/types";

/** get_journey_map RPC 호출. p_region_code=null → far(영역), 지정 → near(노드 lazy).
 *  RLS: RPC 내부에서 auth.uid()=p_user_id 강제하므로 현재 세션 사용자만 조회 가능. */
export async function fetchJourneyMap(
  regionCode: string | null = null,
): Promise<JourneyMap> {
  const supabase = createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  // 인증 서비스 실패(네트워크·토큰 검증 등)와 미로그인은 별개 상태로 구분 —
  // 진단·재시도 로직이 둘을 다르게 다룰 수 있도록 메시지를 분리한다.
  if (authError) {
    console.error("[journey-map/api] auth.getUser:", authError.message);
    throw new Error("인증 확인에 실패했습니다. 잠시 후 다시 시도해 주세요.");
  }
  if (!user) {
    throw new Error("로그인이 필요합니다.");
  }

  const { data, error } = await supabase.rpc("get_journey_map", {
    p_user_id: user.id,
    p_region_code: regionCode,
  });

  if (error) {
    console.error("[journey-map/api] get_journey_map:", error.message);
    throw new Error("여정 지도를 불러오지 못했습니다.");
  }

  // RPC는 항상 jsonb 객체를 반환(빈 경우 {}). 누락 키는 안전 기본값으로 보정.
  const map = (data ?? {}) as Partial<JourneyMap>;
  return {
    summary: map.summary ?? {
      coverage: 0,
      vividness: 0,
      scope_total: 0,
      lit_count: 0,
    },
    regions: map.regions ?? [],
    hotspots: map.hotspots ?? [],
    nodes: map.nodes ?? [],
  };
}
