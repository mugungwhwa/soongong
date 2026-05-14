# 순공대장 MVP 1차 — P5 Home / Quest UI Sub-Plan

> **For agentic workers:** `superpowers:subagent-driven-development` + `oh-my-claudecode:designer` + `design-system` skill 필수. P5는 디자인 일관성이 핵심.
> **Pre-requisites**: P1 (디자인 토큰 + shadcn) + P4 (review_quests + quest entity) 완료. Midjourney 마스코트 응원/축하 2종 W1 안에 준비됨이 이상적.

**Goal:** 시안(`app_UI.png` / `web_ui.png`)을 픽셀 단위로 재현. 오늘의 회독퀘스트길(모바일) + 사이드바 대시보드(웹) + 모든 핵심 위젯.

**Architecture:** FSD widgets/features 분리. shadcn Card/Badge/Button 커스텀. Mascot placeholder → 자산 채워지면 자동 반영. Tailwind 토큰만 사용 (등록 외 hex 차단됨, `check-tokens.ts`).

**Tech Stack:** Next.js 15 App Router, shadcn/ui, Tailwind, Framer Motion(가벼운 진입 애니메이션), Lucide React.

---

## File Structure

```
apps/web/src/
├── app/
│   ├── page.tsx                    # 모바일 + 데스크탑 홈 (반응형)
│   └── layout.tsx                  # 사이드바(웹) + 하단 탭(모바일) 토글
├── widgets/
│   ├── stats-row/                  # 4-카드 (스트릭/HP/순공/XP)
│   ├── today-quest-list/           # 퀘스트 카드 3개
│   ├── mascot-greeting/            # 마스코트 인사 카드
│   ├── review-timeline/            # ●─●─●─○ 타임라인
│   ├── sidebar/                    # 웹 사이드바
│   ├── bottom-tabs/                # 모바일 하단 탭
│   └── subject-mastery/            # 과목별 숙련도 (웹)
└── features/
    └── start-quest/                # 회독 시작 트리거
```

---

## Task 1: T1 — 레이아웃 (반응형: 사이드바 vs 하단 탭)

```tsx
// apps/web/src/app/layout.tsx
import "./globals.css";
import { Sidebar } from "@/widgets/sidebar/ui/sidebar";
import { BottomTabs } from "@/widgets/bottom-tabs/ui/bottom-tabs";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <div className="min-h-dvh flex">
          {/* 웹 사이드바 (md 이상) */}
          <Sidebar className="hidden md:flex w-60 shrink-0 border-r border-border-soft" />
          <main className="flex-1 pb-20 md:pb-0">{children}</main>
        </div>
        {/* 모바일 하단 탭 (md 미만) */}
        <BottomTabs className="md:hidden fixed bottom-0 left-0 right-0 border-t border-border-soft bg-surface" />
      </body>
    </html>
  );
}
```

```tsx
// apps/web/src/widgets/sidebar/ui/sidebar.tsx
import Link from "next/link";
import { Home, Calendar, FileText, Target, User, Trophy } from "lucide-react";
const ITEMS = [
  { href: "/", icon: Home, label: "홈" },
  { href: "/quests", icon: Calendar, label: "오늘 회독퀘스트" },
  { href: "/sources", icon: FileText, label: "문제 기록" },
  { href: "/wrong", icon: Target, label: "오답 통계" },
  { href: "/profile", icon: User, label: "내 정보" },
  { href: "/league", icon: Trophy, label: "순공리그" },
];
export function Sidebar({ className = "" }: { className?: string }) {
  return (
    <aside className={`p-base flex-col ${className}`}>
      <div className="mb-xl text-h2 font-bold">순공대장</div>
      <nav className="space-y-xs">
        {ITEMS.map(({ href, icon: Icon, label }) => (
          <Link key={href} href={href} className="flex items-center gap-sm px-md py-sm rounded-lg hover:bg-bg-soft">
            <Icon className="w-5 h-5 text-primary" />
            <span className="text-body">{label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}
```

```tsx
// apps/web/src/widgets/bottom-tabs/ui/bottom-tabs.tsx
import Link from "next/link";
import { Home, Camera, BarChart3 } from "lucide-react";
export function BottomTabs({ className = "" }: { className?: string }) {
  return (
    <nav className={`grid grid-cols-3 ${className}`}>
      <Link href="/" className="flex flex-col items-center py-md gap-xs"><Home className="w-5 h-5"/><span className="text-tiny">홈</span></Link>
      <Link href="/upload" className="flex flex-col items-center py-md gap-xs"><Camera className="w-5 h-5"/><span className="text-tiny">캡처</span></Link>
      <Link href="/stats" className="flex flex-col items-center py-md gap-xs"><BarChart3 className="w-5 h-5"/><span className="text-tiny">통계</span></Link>
    </nav>
  );
}
```

- [ ] **Commit**

```bash
git add apps/web/src/app/layout.tsx apps/web/src/widgets/sidebar/ apps/web/src/widgets/bottom-tabs/
git commit -m "feat(p5): 반응형 레이아웃 (웹 사이드바 + 모바일 하단 탭)"
```

---

## Task 2: T2 — 통계 4-카드 (`stats-row`)

```tsx
// apps/web/src/widgets/stats-row/ui/stats-row.tsx
import { Flame, Heart, Clock, Star } from "lucide-react";
import { Card } from "@/shared/ui/card";

type Stats = { streak_days: number; memory_hp: number; today_study_min: number; total_xp: number; rank: string };

export function StatsRow({ stats }: { stats: Stats }) {
  return (
    <ul className="grid grid-cols-2 md:grid-cols-4 gap-sm">
      <StatCard icon={<Flame className="w-5 h-5 text-warning"/>} value={`${stats.streak_days}일`} label="스트릭" />
      <StatCard icon={<Heart className="w-5 h-5 text-primary"/>} value={`${stats.memory_hp}/5`} label="기억 HP" />
      <StatCard icon={<Clock className="w-5 h-5 text-info"/>} value={`${stats.today_study_min}분`} label="순공" />
      <StatCard icon={<Star className="w-5 h-5 text-reward-gold"/>} value={`${stats.total_xp.toLocaleString()}XP`} label={stats.rank} />
    </ul>
  );
}

function StatCard({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <Card className="flex flex-col items-center justify-center text-center p-md">
      {icon}
      <div className="mt-xs text-h2 font-bold">{value}</div>
      <div className="text-caption text-text-secondary">{label}</div>
    </Card>
  );
}
```

- [ ] **Commit**

```bash
git add apps/web/src/widgets/stats-row/
git commit -m "feat(p5): 통계 4-카드 위젯 (스트릭/HP/순공/XP)"
```

---

## Task 3: T3 — 망각위험 배지 + 난이도 칩 (`shared/ui`)

```tsx
// apps/web/src/shared/ui/risk-badge.tsx
import { Badge } from "./badge";
type Risk = "high" | "medium" | "low";
const MAP: Record<Risk, { tone: "danger" | "warning" | "info"; label: string }> = {
  high: { tone: "danger", label: "망각위험 높음" },
  medium: { tone: "warning", label: "오늘 회독퀘스트 권장" },
  low: { tone: "info", label: "안정권" },
};
export function RiskBadge({ risk }: { risk: Risk }) {
  const { tone, label } = MAP[risk];
  return <Badge tone={tone}>{label}</Badge>;
}
```

```tsx
// apps/web/src/shared/ui/level-chip.tsx
export function LevelChip({ level }: { level: "L1"|"L2"|"L3"|"L4"|"L5" }) {
  return (
    <span className="inline-flex items-center px-sm py-xs rounded-md text-caption border border-border-soft bg-surface text-text-secondary">
      {level}
    </span>
  );
}
```

- [ ] **Commit**

```bash
git add apps/web/src/shared/ui/risk-badge.tsx apps/web/src/shared/ui/level-chip.tsx
git commit -m "feat(p5): RiskBadge + LevelChip 공용 컴포넌트"
```

---

## Task 4: T4 — 퀘스트 카드 (`today-quest-list`)

```tsx
// apps/web/src/widgets/today-quest-list/ui/quest-card.tsx
import Link from "next/link";
import { Card } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { RiskBadge } from "@/shared/ui/risk-badge";
import { LevelChip } from "@/shared/ui/level-chip";

type QuestCardData = {
  quest_id: string;
  number: number;
  subject: string;
  unit: string;
  topic: string;
  risk: "high" | "medium" | "low";
  difficulty: "L1"|"L2"|"L3"|"L4"|"L5";
  estimated_min: number;
  reward_xp: number;
  context_note?: string;          // "7일 전 오답 · 인덱스 혼동"
};

export function QuestCard({ q }: { q: QuestCardData }) {
  return (
    <Card className="relative">
      <div className="flex items-start gap-md">
        <div className="w-8 h-8 rounded-pill bg-primary text-surface flex items-center justify-center text-bodyLg font-bold shrink-0">
          {q.number}
        </div>
        <div className="flex-1 space-y-sm">
          <h3 className="text-h3">{q.subject} · {q.unit} · {q.topic}</h3>
          <div className="flex flex-wrap gap-sm">
            <RiskBadge risk={q.risk} />
            <LevelChip level={q.difficulty} />
            <span className="text-caption text-text-secondary">예상 {q.estimated_min}분</span>
          </div>
          {q.context_note && <p className="text-body text-text-secondary">{q.context_note}</p>}
          <p className="text-body text-primary-strong">보상 +{q.reward_xp}XP</p>
        </div>
      </div>
      <Link href={`/play/${q.quest_id}`} className="block mt-md">
        <Button className="w-full">회독퀘스트 시작</Button>
      </Link>
    </Card>
  );
}
```

```tsx
// apps/web/src/widgets/today-quest-list/ui/today-quest-list.tsx
import { QuestCard } from "./quest-card";
export function TodayQuestList({ quests }: { quests: any[] }) {
  if (quests.length === 0) {
    return (
      <div className="text-center py-xl text-body text-text-secondary">
        오늘의 회독퀘스트가 아직 없어요. 잠시 후 다시 확인해주세요.
      </div>
    );
  }
  return (
    <ul className="space-y-md">
      {quests.map((q, i) => (
        <li key={q.quest_id}>
          <QuestCard q={{ ...q, number: i + 1 }} />
        </li>
      ))}
    </ul>
  );
}
```

- [ ] **Commit**

```bash
git add apps/web/src/widgets/today-quest-list/
git commit -m "feat(p5): 퀘스트 카드 + 오늘의 회독퀘스트 리스트 위젯"
```

---

## Task 5: T5 — 마스코트 인사 카드 (`mascot-greeting`)

```tsx
// apps/web/src/widgets/mascot-greeting/ui/mascot-greeting.tsx
import { Card } from "@/shared/ui/card";
import { Mascot } from "@/shared/ui/mascot";

type Props = { name: string; message: string };

const MESSAGES = {
  morning: "오늘 회독퀘스트 3개 같이 가볼까?",
  afternoon: "쉬는 시간이지! 3분이면 회독 하나 끝나.",
  evening: "오늘 회독퀘스트 1개만 더 하면 스트릭 유지.",
  late: "오늘은 가볍게 1개만 하고 쉬자.",
};

export function MascotGreeting({ name }: { name: string }) {
  const hour = new Date().getHours();
  const message = hour < 12 ? MESSAGES.morning
    : hour < 17 ? MESSAGES.afternoon
    : hour < 22 ? MESSAGES.evening
    : MESSAGES.late;

  return (
    <Card className="bg-accent-mintLight border-0">
      <div className="flex items-center gap-md">
        <Mascot mood="cheer" size={64} />
        <div className="flex-1">
          <p className="text-caption text-text-secondary">{name}님,</p>
          <p className="text-body font-semibold text-text-primary">{message}</p>
        </div>
      </div>
    </Card>
  );
}
```

- [ ] **Commit**

```bash
git add apps/web/src/widgets/mascot-greeting/
git commit -m "feat(p5): 마스코트 인사 카드 (시간대별 메시지)"
```

---

## Task 6: T6 — 회독 타임라인 (`review-timeline`)

```tsx
// apps/web/src/widgets/review-timeline/ui/review-timeline.tsx
type Status = "done" | "today" | "upcoming";
type Node = { label: string; status: Status };

export function ReviewTimeline({ nodes }: { nodes: Node[] }) {
  return (
    <ul className="flex items-center gap-sm">
      {nodes.map((n, i) => (
        <li key={i} className="flex items-center gap-sm">
          <div className="flex flex-col items-center gap-xs">
            <div
              className={
                n.status === "done" ? "w-4 h-4 rounded-pill bg-primary" :
                n.status === "today" ? "w-5 h-5 rounded-pill bg-accent-lime ring-2 ring-reward-gold" :
                "w-4 h-4 rounded-pill border-2 border-text-tertiary bg-surface"
              }
            />
            <span className="text-tiny text-text-secondary">{n.label}</span>
          </div>
          {i < nodes.length - 1 && <div className="w-8 h-px bg-border-soft" />}
        </li>
      ))}
    </ul>
  );
}
```

- [ ] **Commit**

```bash
git add apps/web/src/widgets/review-timeline/
git commit -m "feat(p5): 회독 타임라인 위젯 (D1/D3/D7/D14)"
```

---

## Task 7: T7 — 과목별 숙련도 게이지 (`subject-mastery`, 웹)

```tsx
// apps/web/src/widgets/subject-mastery/ui/subject-mastery.tsx
import { Card } from "@/shared/ui/card";
type Row = { subject: string; mastery: number };
export function SubjectMastery({ rows }: { rows: Row[] }) {
  return (
    <Card>
      <h3 className="text-h3 mb-md">과목별 숙련도</h3>
      <ul className="space-y-sm">
        {rows.map((r) => (
          <li key={r.subject}>
            <div className="flex justify-between text-body">
              <span>{r.subject}</span>
              <span className="text-text-secondary">{r.mastery}%</span>
            </div>
            <div className="h-2 rounded-pill bg-bg-soft overflow-hidden">
              <div className="h-full bg-primary rounded-pill" style={{ width: `${r.mastery}%` }} />
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}
```

- [ ] **Commit**

```bash
git add apps/web/src/widgets/subject-mastery/
git commit -m "feat(p5): 과목별 숙련도 게이지 위젯 (웹 대시보드)"
```

---

## Task 8: T8 — 홈 페이지 통합

```tsx
// apps/web/src/app/page.tsx
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/entities/user/api";
import { getGameState } from "@/entities/game/api";
import { getTodayQuests } from "@/entities/quest/api";
import { StatsRow } from "@/widgets/stats-row/ui/stats-row";
import { MascotGreeting } from "@/widgets/mascot-greeting/ui/mascot-greeting";
import { TodayQuestList } from "@/widgets/today-quest-list/ui/today-quest-list";
import { SubjectMastery } from "@/widgets/subject-mastery/ui/subject-mastery";

export default async function HomePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!user.birth_year) redirect("/onboarding");

  const [state, quests] = await Promise.all([
    getGameState(user.id),
    getTodayQuests(user.id),
  ]);

  return (
    <div className="p-base md:p-xl max-w-4xl mx-auto space-y-base">
      <StatsRow stats={{
        streak_days: state?.streak_days ?? 0,
        memory_hp: state?.memory_hp ?? 5,
        today_study_min: 0,            // TODO: 일일 순공 시간 집계 (P7 후속)
        total_xp: state?.total_xp ?? 0,
        rank: state?.rank ?? "순공입문",
      }} />
      <MascotGreeting name={user.id.slice(0, 6)} />
      <section>
        <h2 className="text-h2 mb-md">오늘의 회독퀘스트</h2>
        <TodayQuestList quests={quests} />
      </section>
      <section className="hidden md:block">
        <SubjectMastery rows={[
          { subject: "수학", mastery: 70 },
          { subject: "영어", mastery: 64 },
          { subject: "사회", mastery: 56 },
          { subject: "과학", mastery: 49 },
        ]} />
      </section>
    </div>
  );
}
```

- [ ] **Commit**

```bash
git add apps/web/src/app/page.tsx
git commit -m "feat(p5): 홈 페이지 통합 (모바일/데스크탑 반응형)"
```

---

## Task 9: T9 — design-review 시각 검증

```bash
cd apps/web && pnpm dev
# localhost:3000 → 모바일/데스크탑 양쪽 시안과 비교
# /design-system:design-review 실행 → 8대 패턴 점수 ≥ 70
# /vercel:react-best-practices 실행 → TSX 컴포넌트 품질 점검
```

체크리스트:
- [ ] 시안의 컬러 hex와 일치 (스크린샷 + 픽셀 비교)
- [ ] Border radius 20px (카드) / 16px (버튼) / 999 (배지)
- [ ] Pretendard 폰트 적용 + 타입 스케일 일치
- [ ] 반응형: 375px(모바일) / 768px(태블릿) / 1280px(웹) 모두 깨지지 않음
- [ ] design-review skill 8대 패턴 점수 ≥ 70

- [ ] **Commit**

```bash
git commit --allow-empty -m "chore(p5): design-review 통과 + 시안 픽셀 비교 완료"
```

---

## P5 종료 체크포인트

- [ ] 모바일/웹 양쪽 홈 화면이 시안과 일치
- [ ] 4-카드 / 마스코트 인사 / 퀘스트 카드 / 사이드바·하단탭 정상 동작
- [ ] 위험도 배지 빨강/주황/파랑 채도 낮은 톤 (UI 설계.md §7-3 spec)
- [ ] design-review 점수 ≥ 70
- [ ] `pnpm lint:tokens` 통과 (등록 외 hex 0건)

다음 단계: **P6 Play / Recovery / Canvas** sub-plan으로 진입.

---

| v1.0 | 2026-05-14 | 초안. 9개 task (레이아웃 + 4 위젯 + 2 공용 컴포넌트 + 홈 통합 + design-review). |
