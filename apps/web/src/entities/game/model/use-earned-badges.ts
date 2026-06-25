"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/shared/lib/supabase/client";
import type { GameBadge } from "../model";

/**
 * 사용자가 획득한 뱃지 전체를 클라이언트에서 조회 (목업 X).
 * 서버용 getRecentBadges 와 동일 테이블(badges) — 컬렉션 표시는 전량이 필요해
 * limit 없이 최신순으로 가져온다. 미로그인/빈 컬렉션은 빈 배열.
 *
 * 보안: 행 보호는 badges 테이블 RLS(본인 행만 select)가 담당한다. user.id 는
 * 세션의 getUser() 에서만 오고 .eq("user_id", …) 로 한 번 더 좁힌다 —
 * use-game-state / use-forgetting-top 등 기존 클라이언트 훅과 동일한 안전 패턴.
 */
export function useEarnedBadges(): GameBadge[] {
  const [badges, setBadges] = useState<GameBadge[]>([]);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("badges")
        .select("badge_id, badge_key, rarity, awarded_at")
        .eq("user_id", user.id)
        .order("awarded_at", { ascending: false });

      if (data) setBadges(data as GameBadge[]);
    })();
  }, []);

  return badges;
}
