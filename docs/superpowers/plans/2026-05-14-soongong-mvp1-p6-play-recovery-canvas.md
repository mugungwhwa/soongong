# 순공대장 MVP 1차 — P6 Play / Recovery / Canvas Sub-Plan

> **For agentic workers:** `superpowers:subagent-driven-development` + `oh-my-claudecode:designer` + `oh-my-claudecode:qa-tester` (브라우저 E2E). P6는 MVP 1차에서 가장 무거운 sub-project. **5-7일.**
> **Pre-requisites**: P3 (분석 결과), P4 (review_quests + schedule-next-review), P5 (디자인 토큰 + 위젯), P7 (RewardScreen + Mascot) 완료.

**Goal:** 학생 회독 루프 핵심 — 회독 플레이 → 정답/오답 분기 → 오답회수 모드(V0-V5) → 풀이 캔버스(손글씨 stroke 저장) → 결과 보상 → 다음 회독 예약.

**Architecture:**
- 회독 플레이는 단일 SPA-like 라우트 `/play/[questId]` (Server Component + Client 상태)
- 오답회수는 페이지 내 모달 단계 (V1-V5 변형 호출은 P3 또는 P6 자체 클라이언트 fetch)
- 풀이 캔버스는 **tldraw**(웹 우선) → MVP 2차에 React Native Skia 포팅. 라이선스: tldraw SDK Community License (commercial 사용 시 trial 필요)
- stroke JSON + PNG export 모두 Supabase Storage 저장 (path: `solutions/<user_id>/<quest_id>.{json,png}`)

**Tech Stack:** Next.js 15, tldraw v3, Framer Motion(자연스러운 카드 전환), shadcn Dialog/Sheet, Supabase Storage.

---

## File Structure

```
apps/web/src/
├── app/
│   ├── play/[questId]/page.tsx      # SSR 진입점
│   └── sources/[sourceId]/analysis/page.tsx  # P3 분석 결과 (P3에서 만들었지만 라우팅 여기 통합)
├── features/
│   ├── play-quest/                  # 회독 플레이 메인
│   ├── wrong-recovery/              # 오답회수 모드
│   ├── pad-canvas/                  # tldraw 풀이 캔버스
│   └── start-quest/                 # 시작 버튼 트리거
└── entities/
    └── solve-event/                 # 풀이 결과 저장
        ├── model.ts
        └── api.ts
supabase/migrations/0013_solve_events.sql
supabase/migrations/0014_solutions_bucket.sql
```

---

## Task 1: T1 — `solve_events` 테이블 + Solutions bucket

```sql
-- supabase/migrations/0013_solve_events.sql
create table public.solve_events (
  event_id uuid primary key default gen_random_uuid(),
  quest_id uuid not null references public.review_quests(quest_id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  attempt_number smallint not null default 1,
  submitted_answer text,
  is_correct boolean,
  solve_time_seconds int,
  hint_used boolean not null default false,
  eraser_count smallint not null default 0,
  stroke_url text,                       -- Storage path to stroke JSON
  solution_image_url text,               -- Storage path to PNG render
  confidence smallint check (confidence between 1 and 5),
  created_at timestamptz not null default now()
);

create index se_quest_idx on public.solve_events (quest_id, created_at);
create index se_user_idx on public.solve_events (user_id, created_at desc);

alter table public.solve_events enable row level security;
create policy "se: self read" on public.solve_events for select using (auth.uid() = user_id);
create policy "se: self insert" on public.solve_events for insert with check (auth.uid() = user_id);
```

```sql
-- supabase/migrations/0014_solutions_bucket.sql
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'solutions',
  'solutions',
  false,
  2 * 1024 * 1024,                     -- 2MB (PNG/JSON)
  array['application/json','image/png']
)
on conflict (id) do nothing;

create policy "solutions: self read"
  on storage.objects for select
  using (bucket_id = 'solutions' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "solutions: self insert"
  on storage.objects for insert
  with check (bucket_id = 'solutions' and (storage.foldername(name))[1] = auth.uid()::text);
```

- [ ] **실행 + Commit**

```bash
pnpm dlx supabase db push
git add supabase/migrations/0013_solve_events.sql supabase/migrations/0014_solutions_bucket.sql
git commit -m "feat(p6): solve_events 테이블 + solutions private bucket"
```

---

## Task 2: T2 — solve-event entity

```ts
// apps/web/src/entities/solve-event/model.ts
export type SolveEvent = {
  event_id: string;
  quest_id: string;
  user_id: string;
  attempt_number: number;
  submitted_answer: string | null;
  is_correct: boolean | null;
  solve_time_seconds: number | null;
  hint_used: boolean;
  eraser_count: number;
  stroke_url: string | null;
  solution_image_url: string | null;
  confidence: number | null;
  created_at: string;
};
```

```ts
// apps/web/src/entities/solve-event/api.ts
import { createClient } from "@/shared/lib/supabase/client";

export async function recordSolveEvent(payload: {
  quest_id: string;
  submitted_answer?: string;
  is_correct: boolean;
  solve_time_seconds: number;
  hint_used?: boolean;
  eraser_count?: number;
  stroke_url?: string;
  solution_image_url?: string;
  confidence?: number;
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("solve_events")
    .insert({ user_id: user.id, attempt_number: 1, ...payload })
    .select()
    .single();
  return data;
}
```

- [ ] **Commit**

```bash
git add apps/web/src/entities/solve-event/
git commit -m "feat(p6): solve-event entity"
```

---

## Task 3: T3 — 풀이 캔버스 (`pad-canvas`)

```bash
cd apps/web && pnpm add tldraw
```

```tsx
// apps/web/src/features/pad-canvas/ui/pad-canvas.tsx
"use client";
import { Tldraw, Editor, exportAs, getSnapshot } from "tldraw";
import "tldraw/tldraw.css";
import { useRef } from "react";

export type PadCanvasHandle = {
  getStrokeJSON: () => unknown;
  exportPNG: () => Promise<Blob>;
};

export function PadCanvas({ onMount }: { onMount?: (handle: PadCanvasHandle) => void }) {
  const editorRef = useRef<Editor | null>(null);

  function handleMount(editor: Editor) {
    editorRef.current = editor;
    onMount?.({
      getStrokeJSON: () => getSnapshot(editor.store),
      exportPNG: async () => {
        const ids = Array.from(editor.getCurrentPageShapeIds());
        return await exportAs(editor, ids, "png", { background: false });
      },
    });
  }

  return (
    <div className="w-full h-96 rounded-xl overflow-hidden border border-border-soft bg-surface">
      <Tldraw onMount={handleMount} hideUi={false} />
    </div>
  );
}
```

> **라이선스 주의**: tldraw SDK는 Community License — 상용 서비스 시 trial 또는 commercial license 필요 (`tldraw.dev/community/license`). MVP 1차 검증 단계는 trial OK. 출시 전 결정.

- [ ] **대안: Konva**(라이선스 자유). MVP 1차 후반 trial 만료 시 교체 가능.

- [ ] **Commit**

```bash
git add apps/web/src/features/pad-canvas/
git commit -m "feat(p6): tldraw 기반 풀이 캔버스 + stroke JSON / PNG export"
```

---

## Task 4: T4 — 회독 플레이 페이지 진입

```tsx
// apps/web/src/app/play/[questId]/page.tsx
import { redirect } from "next/navigation";
import { createClient } from "@/shared/lib/supabase/server";
import { getCurrentUser } from "@/entities/user/api";
import { PlayQuest } from "@/features/play-quest/ui/play-quest";

export default async function PlayPage({ params }: { params: Promise<{ questId: string }> }) {
  const { questId } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const supabase = await createClient();
  const { data: quest } = await supabase
    .from("review_quests")
    .select("*, parsed_learning_objects(*)")
    .eq("quest_id", questId)
    .eq("user_id", user.id)
    .single();
  if (!quest) redirect("/");

  return <PlayQuest quest={quest} />;
}
```

```tsx
// apps/web/src/features/play-quest/ui/play-quest.tsx
"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { LevelChip } from "@/shared/ui/level-chip";
import { PadCanvas, type PadCanvasHandle } from "@/features/pad-canvas/ui/pad-canvas";
import { recordSolveEvent } from "@/entities/solve-event/api";
import { createClient } from "@/shared/lib/supabase/client";
import { WrongRecoveryFlow } from "@/features/wrong-recovery/ui/wrong-recovery-flow";

type QuestProps = { quest: any };

export function PlayQuest({ quest }: QuestProps) {
  const router = useRouter();
  const [answer, setAnswer] = useState("");
  const [hintUsed, setHintUsed] = useState(false);
  const [phase, setPhase] = useState<"play" | "recovery" | "result">("play");
  const [wasCorrect, setWasCorrect] = useState<boolean | null>(null);
  const start = useRef<number>(Date.now());
  const canvasRef = useRef<PadCanvasHandle | null>(null);
  const supabase = createClient();

  async function submit() {
    const elapsed = Math.floor((Date.now() - start.current) / 1000);
    const correctAnswer = quest.parsed_learning_objects?.correct_answer ?? null;
    const isCorrect = correctAnswer ? answer.trim() === String(correctAnswer).trim() : false;
    setWasCorrect(isCorrect);

    // 풀이 stroke + PNG 업로드
    let strokeUrl: string | undefined;
    let solutionPng: string | undefined;
    if (canvasRef.current) {
      const json = canvasRef.current.getStrokeJSON();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const jsonPath = `${user.id}/${quest.quest_id}.json`;
        await supabase.storage.from("solutions").upload(jsonPath, new Blob([JSON.stringify(json)], { type: "application/json" }), { upsert: true });
        strokeUrl = jsonPath;
        try {
          const png = await canvasRef.current.exportPNG();
          const pngPath = `${user.id}/${quest.quest_id}.png`;
          await supabase.storage.from("solutions").upload(pngPath, png, { contentType: "image/png", upsert: true });
          solutionPng = pngPath;
        } catch { /* png export 실패해도 진행 */ }
      }
    }

    await recordSolveEvent({
      quest_id: quest.quest_id,
      submitted_answer: answer,
      is_correct: isCorrect,
      solve_time_seconds: elapsed,
      hint_used: hintUsed,
      stroke_url: strokeUrl,
      solution_image_url: solutionPng,
    });

    // 다음 회독 일정 결정 (P4)
    await supabase.functions.invoke("schedule-next-review", {
      body: {
        quest_id: quest.quest_id,
        result: isCorrect ? "correct" : "wrong",
        solve_time_seconds: elapsed,
        hint_used: hintUsed,
      },
    });

    // 게임 상태 업데이트 (P7)
    await supabase.functions.invoke("update-game-state", {
      body: {
        user_id: quest.user_id,
        quest_result: { completed: true, mode: quest.quest_mode, result: isCorrect ? "correct" : "wrong", hint_used: hintUsed },
      },
    });

    if (isCorrect) {
      setPhase("result");
    } else {
      setPhase("recovery");
    }
  }

  if (phase === "recovery") {
    return (
      <WrongRecoveryFlow
        quest={quest}
        onComplete={() => setPhase("result")}
        onGiveUp={() => router.push("/")}
      />
    );
  }

  if (phase === "result") {
    // P7의 RewardScreen 임포트해서 사용
    const { RewardScreen } = require("@/features/result-reward/ui/reward-screen");
    return (
      <RewardScreen
        xpDelta={quest.reward_xp}
        streak={0}                                   // SSR + 새로고침으로 갱신 (간소화)
        hpAfter={5}
        message={wasCorrect ? "좋아! 이번엔 잘 떠올렸네." : "오답 회수 성공! 점화식 다시 잡았다."}
        onNext={() => router.push("/")}
        onHome={() => router.push("/")}
      />
    );
  }

  return (
    <main className="p-base md:p-xl max-w-2xl mx-auto space-y-base">
      <Card className="surface-play">
        <div className="flex items-center gap-sm mb-md">
          <LevelChip level={quest.parsed_learning_objects?.difficulty_level ?? "L2"} />
          <span className="text-caption text-text-secondary">{quest.parsed_learning_objects?.subject} · {quest.parsed_learning_objects?.unit}</span>
        </div>
        <h2 className="text-h2 mb-md">{quest.parsed_learning_objects?.extracted_text ?? "(문제)"}</h2>

        <PadCanvas onMount={(h) => { canvasRef.current = h; }} />

        <div className="mt-md space-y-sm">
          <input
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="정답 입력"
            className="w-full h-12 px-base rounded-lg border border-border-soft text-bodyLg"
          />
          <div className="flex gap-sm">
            <Button variant="ghost" onClick={() => setHintUsed(true)}>힌트 보기</Button>
            <Button onClick={submit} className="flex-1">정답 제출</Button>
          </div>
        </div>
      </Card>
    </main>
  );
}
```

- [ ] **Commit**

```bash
git add apps/web/src/app/play/ apps/web/src/features/play-quest/
git commit -m "feat(p6): 회독 플레이 페이지 (캔버스 + 정답 제출 + 분기)"
```

---

## Task 5: T5 — 오답회수 모드 (`wrong-recovery`)

오답 후 V1-V5 변형 단계로 회수.

```tsx
// apps/web/src/features/wrong-recovery/ui/wrong-recovery-flow.tsx
"use client";
import { useState } from "react";
import { Card } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Mascot } from "@/shared/ui/mascot";
import { createClient } from "@/shared/lib/supabase/client";

type Props = {
  quest: any;
  onComplete: () => void;
  onGiveUp: () => void;
};

export function WrongRecoveryFlow({ quest, onComplete, onGiveUp }: Props) {
  const [step, setStep] = useState(1);
  const [variation, setVariation] = useState<any | null>(null);
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  async function loadVariation(level: "V0" | "V1" | "V2") {
    setLoading(true);
    // MVP 1차에서는 베리에이션 Agent 미구현 — 가장 가까운 회독 객체를 다시 사용
    // MVP 1.5에 generate-variation Edge Function 호출로 교체
    setVariation({
      stem: `(${level} 변형) ` + quest.parsed_learning_objects.extracted_text,
      correct_answer: quest.parsed_learning_objects.correct_answer,
      level,
    });
    setLoading(false);
  }

  async function submitVariation() {
    const isCorrect = variation && answer.trim() === String(variation.correct_answer).trim();
    if (isCorrect) {
      // recovery 성공
      await supabase.functions.invoke("update-game-state", {
        body: {
          user_id: quest.user_id,
          quest_result: { completed: true, mode: "wrong_recovery", result: "correct", hint_used: false },
        },
      });
      onComplete();
    } else {
      if (step >= 3) onGiveUp();
      else {
        setStep(step + 1);
        setAnswer("");
        setVariation(null);
      }
    }
  }

  return (
    <main className="p-base md:p-xl max-w-2xl mx-auto space-y-base">
      <Card>
        <div className="flex items-start gap-md">
          <Mascot mood="comfort" size={64} />
          <div>
            <h2 className="text-h2">오답 회수 {step}/3</h2>
            <p className="text-body text-text-secondary">
              {step === 1 && "틀린 이유 알았으면, 비슷한 문제로 한 번 더 잡아보자."}
              {step === 2 && "이번엔 좀 더 가깝게 가볼게. 천천히."}
              {step === 3 && "마지막. 가장 쉬운 변형으로 회수하자."}
            </p>
          </div>
        </div>

        {!variation && (
          <div className="mt-md">
            <Button onClick={() => loadVariation(step === 1 ? "V1" : step === 2 ? "V0" : "V0")} disabled={loading}>
              {loading ? "준비 중..." : "비슷한 문제로 바로 회수하기"}
            </Button>
          </div>
        )}

        {variation && (
          <div className="mt-md space-y-md">
            <Badge tone="info">{variation.level} 변형</Badge>
            <p className="text-bodyLg">{variation.stem}</p>
            <input
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="정답"
              className="w-full h-12 px-base rounded-lg border border-border-soft text-bodyLg"
            />
            <div className="flex gap-sm">
              <Button variant="ghost" onClick={onGiveUp}>오늘은 그만</Button>
              <Button onClick={submitVariation} disabled={!answer.trim()} className="flex-1">제출</Button>
            </div>
          </div>
        )}
      </Card>
    </main>
  );
}
```

- [ ] **Commit**

```bash
git add apps/web/src/features/wrong-recovery/
git commit -m "feat(p6): 오답회수 모드 (3단계 V변형 + 마스코트 위로 + 회수 성공/포기)"
```

---

## Task 6: T6 — AI 분석 결과 페이지 (P3 결과 화면 통합)

```tsx
// apps/web/src/app/sources/[sourceId]/analysis/page.tsx
import { redirect } from "next/navigation";
import { createClient } from "@/shared/lib/supabase/server";
import { getCurrentUser } from "@/entities/user/api";
import { AnalysisPolling } from "@/features/ai-analysis-result/ui/analysis-polling";

export default async function AnalysisPage({ params }: { params: Promise<{ sourceId: string }> }) {
  const { sourceId } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const supabase = await createClient();
  const { data: source } = await supabase
    .from("external_sources")
    .select("source_id, user_id, source_type, deleted_at")
    .eq("source_id", sourceId)
    .eq("user_id", user.id)
    .single();
  if (!source || source.deleted_at) redirect("/");
  return <AnalysisPolling sourceId={sourceId} />;
}
```

```tsx
// apps/web/src/features/ai-analysis-result/ui/analysis-polling.tsx
"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/shared/lib/supabase/client";
import { AnalysisResultCard } from "./result-card";    // P3에서 만든 카드
import { Mascot } from "@/shared/ui/mascot";

export function AnalysisPolling({ sourceId }: { sourceId: string }) {
  const [routing, setRouting] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    const interval = setInterval(async () => {
      const { data } = await supabase
        .from("subject_routing_results")
        .select("*")
        .eq("source_id", sourceId)
        .maybeSingle();
      if (data) {
        setRouting(data);
        clearInterval(interval);
      }
    }, 1500);
    return () => clearInterval(interval);
  }, [sourceId, supabase]);

  if (!routing) {
    return (
      <main className="p-xl text-center space-y-md">
        <Mascot mood="think" size={96} />
        <p className="text-body text-text-secondary">잠깐만, 분석하고 있어...</p>
      </main>
    );
  }

  return (
    <main className="p-xl max-w-md mx-auto">
      <AnalysisResultCard routingId={routing.routing_id} initial={routing} />
    </main>
  );
}
```

- [ ] **Commit**

```bash
git add apps/web/src/app/sources/ apps/web/src/features/ai-analysis-result/ui/analysis-polling.tsx
git commit -m "feat(p6): AI 분석 결과 페이지 + 1.5초 polling + 마스코트 think 로딩"
```

---

## Task 7: T7 — 브라우저 E2E 시나리오 (qa-tester)

`/oh-my-claudecode:qa-tester` 디스패치로 다음 시나리오 자동화:

1. 로그인 → 홈 → 업로드 시트 열기
2. 문제사진 업로드 → /sources/[id]/analysis 리다이렉트
3. 1.5초 polling → 분석 결과 카드 등장 → "맞아요" 클릭
4. 홈으로 돌아오면 review_quests에 첫 quest 발급되어 있음 (또는 cron 대기)
5. 퀘스트 카드 "회독퀘스트 시작" 클릭 → /play/[questId]
6. tldraw 캔버스에 풀이 작성 → 정답 입력 → 제출
7. 정답 시 결과 화면(XP 카운트업 + confetti) / 오답 시 오답회수 모드로 진입
8. 오답회수 V1 변형 정답 → 결과 화면
9. 홈으로 → quest status='completed' 확인

**합격 기준**:
- 7개 시나리오 모두 통과
- Storage에 stroke JSON + PNG 저장 확인
- solve_events insert 확인
- design-review 점수 ≥ 70 (P6 화면 추가분)

```bash
/oh-my-claudecode:qa-tester
```

- [ ] **Commit**

```bash
git commit --allow-empty -m "chore(p6): E2E 7개 시나리오 통과 + Storage 저장 확인"
```

---

## P6 종료 체크포인트

- [ ] 회독 플레이 → 정답 → 결과 흐름 1회 완주
- [ ] 회독 플레이 → 오답 → 오답회수 3단계 → 회수 성공 흐름 1회 완주
- [ ] 풀이 캔버스 stroke JSON + PNG가 Storage에 저장됨
- [ ] solve_events row 생성 확인
- [ ] schedule-next-review + update-game-state 자동 호출 확인
- [ ] AI 분석 결과 페이지 polling 동작
- [ ] 마스코트 placeholder 시각 (think/comfort/celebrate) 정상 노출
- [ ] design-review 점수 ≥ 70

**P1-P8 sub-plan 모두 완료. MVP 1차 8주 문서 작업 종료.** 환경 결정 + Midjourney 자산 + agent 실행만 남음.

---

## 위험 + 롤백

| 위험 | 발생 시 행동 |
|---|---|
| tldraw 라이선스 cost | Konva로 교체 (1-2일 spike) |
| 캔버스 모바일 성능 | viewport 제한 + stroke 데시메이션 |
| stroke JSON 크기 (>1MB) | 압축 (LZ-string) 또는 gzip |
| Vision LLM 분석 5초+ 지연 | polling 최대 30초 + timeout 후 manual fallback |
| MVP 1차 베리에이션 미구현 | T5 변형 호출은 placeholder (가장 가까운 V0 재사용) — MVP 1.5에 generate-variation Edge Function 추가 |

---

| v1.0 | 2026-05-14 | 초안. 7개 task (테이블+bucket / entity / 캔버스 / 플레이 / 오답회수 / 분석 polling / E2E). |
