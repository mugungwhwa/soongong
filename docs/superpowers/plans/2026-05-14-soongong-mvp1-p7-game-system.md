# 순공대장 MVP 1차 — P7 Game System Sub-Plan

> **For agentic workers:** `superpowers:subagent-driven-development` + `superpowers:test-driven-development`. 룰이 명확한 시스템이라 TDD 적합.
> **Pre-requisites**: P4 (review_quests) 완료.

**Goal:** XP 누적 / 스트릭 / 기억 HP / 뱃지 10종 + 결과 화면 보상 애니메이션.

**Architecture:** 게임 상태는 단일 `user_game_state` 테이블. 룰은 DB function + Edge Function. UI는 Framer Motion + canvas-confetti.

**Tech Stack:** PostgreSQL, Supabase Edge Functions, Framer Motion, `canvas-confetti`.

---

## File Structure

```
supabase/
  migrations/
    0010_user_game_state.sql
    0011_badges.sql
  functions/update-game-state/index.ts
apps/web/src/
  entities/game/
  features/result-reward/
```

---

## Task 1: T1 — `user_game_state` + `badges` 테이블

```sql
-- supabase/migrations/0010_user_game_state.sql
create table public.user_game_state (
  user_id uuid primary key references public.users(id) on delete cascade,
  streak_days int not null default 0,
  last_active_date date,
  memory_hp smallint not null default 5 check (memory_hp between 0 and 5),
  total_xp int not null default 0,
  rank text not null default '순공입문'
    check (rank in ('순공입문','순공러','순공대장','순공도사','순공마왕','순공전설')),
  rank_tier text,                            -- '실버Ⅱ' 등 리그용 (선택)
  updated_at timestamptz not null default now()
);

alter table public.user_game_state enable row level security;
create policy "ugs: self read" on public.user_game_state for select using (auth.uid() = user_id);
-- write는 service_role만

create or replace function public.update_rank(p_xp int) returns text language sql immutable as $$
  select case
    when p_xp >= 12000 then '순공전설'
    when p_xp >= 7000  then '순공마왕'
    when p_xp >= 3500  then '순공도사'
    when p_xp >= 1500  then '순공대장'
    when p_xp >= 500   then '순공러'
    else '순공입문'
  end;
$$;
```

```sql
-- supabase/migrations/0011_badges.sql
create table public.badges (
  badge_id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  badge_key text not null,
  rarity text not null check (rarity in ('common','rare','epic','legendary')),
  awarded_at timestamptz not null default now(),
  unique (user_id, badge_key)
);

create index badges_user_idx on public.badges (user_id, awarded_at desc);
alter table public.badges enable row level security;
create policy "badges: self read" on public.badges for select using (auth.uid() = user_id);

-- 10종 뱃지 정의 (참조용 view)
create or replace view public.badge_definitions as
select badge_key, rarity, threshold, name, description from (
  values
    ('first_quest',   'common',    1,   '첫 회독',         '첫 회독퀘스트 완료'),
    ('streak_7',      'rare',      7,   '7일 불꽃',         '7일 연속 회독'),
    ('streak_30',     'epic',      30,  '30일 불꽃',        '30일 연속 회독'),
    ('recover_10',    'common',    10,  '오답회수꾼',       '오답 10개 다시 맞힘'),
    ('recover_50',    'rare',      50,  '오답회수 마스터',  '오답 50개 다시 맞힘'),
    ('defense_7',     'rare',      1,   '기억수비수',       '7일 전 문제 첫 정답'),
    ('defense_14',    'epic',      1,   '14일 방어',        '14일 망각방어 첫 성공'),
    ('concept_20',    'rare',      20,  '수열 사냥꾼',      '특정 단원 20회 완료'),
    ('hp_full',       'common',    1,   '기억 만렙',        '기억 HP 5/5 달성'),
    ('study_60',      'common',    60,  '60분 순공러',      '하루 인정 순공 60분')
) as t(badge_key, rarity, threshold, name, description);
```

- [ ] **실행 + Commit**

```bash
pnpm dlx supabase db push
git add supabase/migrations/0010_user_game_state.sql supabase/migrations/0011_badges.sql
git commit -m "feat(p7): user_game_state + badges 테이블 + 10종 정의"
```

---

## Task 2: T2 — `update-game-state` Edge Function

회독 완료 시 호출 → XP / 스트릭 / HP / 뱃지 일괄 업데이트.

```ts
// supabase/functions/update-game-state/index.ts
import { getAdminClient } from "../_shared/supabase.ts";

const XP_RULES = {
  today_quest_done: 20,
  wrong_recovery_success: 30,
  memory_defense_success: 40,
  no_hint_correct: 10,
  day7_correct: 20,
  day14_defense: 50,
  boss_clear: 80,
};

Deno.serve(async (req) => {
  const { user_id, quest_result } = await req.json();
  const supabase = getAdminClient();

  // 현재 state
  const { data: state } = await supabase
    .from("user_game_state")
    .select("*")
    .eq("user_id", user_id)
    .maybeSingle();

  const cur = state ?? {
    user_id, streak_days: 0, last_active_date: null, memory_hp: 5, total_xp: 0,
  };

  // XP 계산
  let xpDelta = 0;
  if (quest_result.completed) xpDelta += XP_RULES.today_quest_done;
  if (quest_result.mode === "wrong_recovery" && quest_result.result === "correct") xpDelta += XP_RULES.wrong_recovery_success;
  if (quest_result.mode === "memory_defense" && quest_result.result === "correct") xpDelta += XP_RULES.memory_defense_success;
  if (!quest_result.hint_used && quest_result.result === "correct") xpDelta += XP_RULES.no_hint_correct;

  // 스트릭
  const today = new Date().toISOString().slice(0, 10);
  const lastDate = cur.last_active_date;
  let streak = cur.streak_days;
  if (lastDate !== today) {
    const yest = new Date(Date.now() - 86400_000).toISOString().slice(0, 10);
    streak = lastDate === yest ? streak + 1 : 1;
  }

  // 기억 HP
  let hp = cur.memory_hp;
  if (quest_result.mode === "memory_defense" && quest_result.result === "correct") hp = Math.min(5, hp + 1);
  if (quest_result.result === "wrong" && quest_result.repeat_wrong) hp = Math.max(0, hp - 1);

  const newXp = cur.total_xp + xpDelta;
  const { data: ranked } = await supabase.rpc("update_rank", { p_xp: newXp });

  await supabase.from("user_game_state").upsert({
    user_id,
    streak_days: streak,
    last_active_date: today,
    memory_hp: hp,
    total_xp: newXp,
    rank: ranked,
    updated_at: new Date().toISOString(),
  });

  // 뱃지 발급 체크 (간단 룰)
  await checkAndAwardBadges(supabase, user_id, { streak, hp, total_xp: newXp, quest_result });

  return Response.json({ xp_delta: xpDelta, streak, hp, total_xp: newXp, rank: ranked });
});

async function checkAndAwardBadges(supabase: any, userId: string, ctx: any) {
  const candidates: string[] = [];
  if (ctx.quest_result.completed) candidates.push("first_quest");
  if (ctx.streak >= 7) candidates.push("streak_7");
  if (ctx.streak >= 30) candidates.push("streak_30");
  if (ctx.hp === 5) candidates.push("hp_full");
  if (ctx.quest_result.mode === "memory_defense" && ctx.quest_result.result === "correct") {
    candidates.push("defense_7");
  }

  for (const key of candidates) {
    await supabase.from("badges").insert({ user_id: userId, badge_key: key, rarity: rarityFor(key) }).select();
  }
}

function rarityFor(key: string): string {
  const RARE = ["streak_7","recover_50","defense_7","concept_20"];
  const EPIC = ["streak_30","defense_14"];
  const LEG = [];
  if (LEG.includes(key)) return "legendary";
  if (EPIC.includes(key)) return "epic";
  if (RARE.includes(key)) return "rare";
  return "common";
}
```

- [ ] **배포 + Commit**

```bash
pnpm dlx supabase functions deploy update-game-state
git add supabase/functions/update-game-state/
git commit -m "feat(p7): update-game-state Edge Function — XP/스트릭/HP/뱃지 일괄 업데이트"
```

---

## Task 3: T3 — Game entity

```ts
// apps/web/src/entities/game/model.ts
export type GameState = {
  user_id: string;
  streak_days: number;
  memory_hp: number;
  total_xp: number;
  rank: "순공입문" | "순공러" | "순공대장" | "순공도사" | "순공마왕" | "순공전설";
  rank_tier?: string;
  last_active_date: string | null;
};

export type Badge = {
  badge_id: string;
  badge_key: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  awarded_at: string;
};
```

```ts
// apps/web/src/entities/game/api.ts
import { createClient } from "@/shared/lib/supabase/server";

export async function getGameState(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase.from("user_game_state").select("*").eq("user_id", userId).maybeSingle();
  return data;
}

export async function getRecentBadges(userId: string, limit = 5) {
  const supabase = await createClient();
  const { data } = await supabase.from("badges").select("*").eq("user_id", userId).order("awarded_at", { ascending: false }).limit(limit);
  return data ?? [];
}
```

- [ ] **Commit**

```bash
git add apps/web/src/entities/game/
git commit -m "feat(p7): game entity (state + badges)"
```

---

## Task 4: T4 — 결과 보상 화면 (애니메이션)

```bash
cd apps/web && pnpm add framer-motion canvas-confetti @types/canvas-confetti
```

```tsx
// apps/web/src/features/result-reward/ui/reward-screen.tsx
"use client";
import { useEffect, useRef } from "react";
import { motion, useMotionValue, animate } from "framer-motion";
import confetti from "canvas-confetti";
import { Card } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Mascot } from "@/shared/ui/mascot";

type Props = {
  xpDelta: number;
  streak: number;
  hpAfter: number;
  message: string;
  onNext: () => void;
  onHome: () => void;
};

export function RewardScreen({ xpDelta, streak, hpAfter, message, onNext, onHome }: Props) {
  const xpMv = useMotionValue(0);
  const xpDisplayRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    confetti({ particleCount: 60, spread: 70, origin: { y: 0.4 }, colors: ["#7CC97C","#F5C242","#B8E5A4"] });
    const controls = animate(xpMv, xpDelta, {
      duration: 0.8,
      ease: "easeOut",
      onUpdate: (v) => {
        if (xpDisplayRef.current) xpDisplayRef.current.textContent = Math.floor(v).toString();
      },
    });
    return () => controls.stop();
  }, [xpDelta, xpMv]);

  return (
    <main className="min-h-dvh flex items-center justify-center p-xl bg-bg">
      <Card className="w-full max-w-sm text-center">
        <motion.h1 initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.4 }} className="text-display">
          🎉 회독퀘스트 성공!
        </motion.h1>
        <div className="mt-lg space-y-md">
          <div className="text-h2 text-primary">+<span ref={xpDisplayRef}>0</span> XP</div>
          <div className="text-body text-text-secondary">🔥 {streak}일 스트릭 · ❤️ {hpAfter}/5</div>
        </div>
        <div className="mt-lg flex justify-center">
          <Mascot mood="celebrate" size={128} />
        </div>
        <p className="mt-md text-body text-text-primary">{message}</p>
        <div className="mt-lg flex gap-sm">
          <Button variant="secondary" onClick={onHome} className="flex-1">홈으로</Button>
          <Button onClick={onNext} className="flex-1">다음 회독퀘스트</Button>
        </div>
      </Card>
    </main>
  );
}
```

- [ ] **Mascot 컴포넌트 (asset inventory §9 placeholder 패턴)**

```tsx
// apps/web/src/shared/ui/mascot.tsx
import Image from "next/image";
type Mood = "cheer" | "celebrate" | "think" | "comfort" | "sleep" | "surprise";
const MASCOT_SRC: Record<Mood, string | null> = {
  cheer: null, celebrate: null, think: null, comfort: null, sleep: null, surprise: null,
};
export function Mascot({ mood = "cheer", size = 128 }: { mood?: Mood; size?: number }) {
  const src = MASCOT_SRC[mood];
  if (!src) {
    return (
      <div className="rounded-pill bg-accent-mintLight flex items-center justify-center" style={{ width: size, height: size }}>
        <span style={{ fontSize: size / 2 }}>🦕</span>
      </div>
    );
  }
  return <Image src={src} alt={`순공이 ${mood}`} width={size} height={size} priority />;
}
```

- [ ] **Commit**

```bash
git add apps/web/src/features/result-reward/ apps/web/src/shared/ui/mascot.tsx
git commit -m "feat(p7): 결과 보상 화면 (XP 카운트업 + confetti + 마스코트 placeholder)"
```

---

## Task 5: T5 — 뱃지 디스플레이 위젯

```tsx
// apps/web/src/features/badge-display/ui/badge-list.tsx
import { Badge } from "@/entities/game/model";

const COLOR_BY_RARITY: Record<string, string> = {
  common: "bg-accent-mintLight text-primary-strong",
  rare: "bg-info-bg text-info",
  epic: "bg-[#F5E0FC] text-[#8B5CF6]",
  legendary: "bg-warning-bg text-reward-gold",
};

export function BadgeList({ badges }: { badges: Badge[] }) {
  if (badges.length === 0) return <p className="text-body text-text-secondary">아직 뱃지가 없어요.</p>;
  return (
    <ul className="flex flex-wrap gap-sm">
      {badges.map((b) => (
        <li key={b.badge_id} className={`px-md py-sm rounded-pill text-caption ${COLOR_BY_RARITY[b.rarity]}`}>
          {b.badge_key}
        </li>
      ))}
    </ul>
  );
}
```

- [ ] **Commit**

```bash
git add apps/web/src/features/badge-display/
git commit -m "feat(p7): 뱃지 디스플레이 위젯 (희귀도별 컬러)"
```

---

## P7 종료 체크포인트

- [ ] 회독 완료 시 update-game-state 호출 → user_game_state 업데이트 확인
- [ ] 스트릭 / HP / XP / rank 룰 단위 테스트 통과
- [ ] 뱃지 10종 발급 트리거 (자동 + 수동) 통과
- [ ] 결과 화면 애니메이션 (XP 카운트업 / confetti) 시각 검증

다음 단계: **P8 Admin** sub-plan으로 진입.

---

| v1.0 | 2026-05-14 | 초안. 5개 task (테이블 2종 + Edge Function + entity + 결과 화면 + 뱃지 디스플레이). |
