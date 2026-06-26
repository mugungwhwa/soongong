"use client";

/**
 * Components 카테고리 뷰 — 실제 shared/ui 컴포넌트의 라이브 예시 + 사용 토큰 표기.
 * design.duolingo.com 형태로 컴포넌트 1개 = 1뷰. 새 컴포넌트는 만들지 않는다
 * (SOO-65 범위 밖). 존재하는 자산만 렌더: Button · Badge · Card · Input · Dialog
 * · Toast(sonner). Popover는 미구현이라 placeholder만 둔다(생성 금지).
 */

import * as React from "react";
import { toast } from "sonner";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { StatCard } from "@/shared/ui/stat-card";
import { Flame, Brain, Clock, Zap } from "lucide-react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/shared/ui/dialog";
import { Toaster } from "@/shared/ui/sonner";
import {
  ShowcaseSection,
  ExampleCard,
  TokenChips,
  DoDont,
  PlaceholderNote,
} from "./showcase-kit";

export function CompButton() {
  return (
    <ShowcaseSection
      eyebrow="Components"
      title="Button"
      description="variant 6종 · size 4종 · 비활성 상태. CTA는 primary 토큰을 사용한다."
    >
      <ExampleCard title="Variant">
        <div className="flex flex-wrap items-center gap-2">
          <Button>기본</Button>
          <Button variant="secondary">보조</Button>
          <Button variant="outline">아웃라인</Button>
          <Button variant="ghost">고스트</Button>
          <Button variant="link">링크</Button>
          <Button variant="destructive">위험</Button>
        </div>
        <TokenChips
          tokens={["--color-primary-cta", "--radius-md", "--color-text-inverse"]}
        />
      </ExampleCard>
      <ExampleCard title="Size · State">
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm">Small</Button>
          <Button size="default">Default</Button>
          <Button size="lg">Large</Button>
          <Button disabled>비활성</Button>
        </div>
      </ExampleCard>
      <DoDont
        dos={[
          "CTA는 primary 토큰(--color-primary-cta)으로만",
          "비활성 상태를 명확히 — disabled 시 대비 낮춤",
        ]}
        donts={[
          "원색 그린을 직접 박기 (저채도 민트 ‘변형’ 결정 위반)",
          "버튼에 과한 bounce 모션 (bounce는 마스코트 한정)",
        ]}
      />
    </ShowcaseSection>
  );
}

export function CompBadge() {
  return (
    <ShowcaseSection
      eyebrow="Components"
      title="Badge"
      description="variant 4종. 상태/라벨 표기용 pill."
    >
      <ExampleCard title="Variant">
        <div className="flex flex-wrap items-center gap-2">
          <Badge>기본</Badge>
          <Badge variant="secondary">보조</Badge>
          <Badge variant="outline">아웃라인</Badge>
          <Badge variant="destructive">위험</Badge>
        </div>
        <TokenChips tokens={["--radius-pill", "--color-primary-cta"]} />
      </ExampleCard>
      <DoDont
        dos={[
          "상태/라벨 표기용 pill로 사용",
          "위험 표기는 데사처드 위험도 토큰으로",
        ]}
        donts={[
          "빨강 하트(생명) 대용으로 쓰기 — 기억HP 0–5로 대체",
          "자극적 원색 배지 남발",
        ]}
      />
    </ShowcaseSection>
  );
}

export function CompCard() {
  return (
    <ShowcaseSection
      eyebrow="Components"
      title="Card"
      description="흰색 surface 고정(SOO-36) — 배경이 비치지 않는다. Header/Content/Footer 구성."
    >
      <ExampleCard title="기본 구성">
        <Card className="max-w-sm">
          <CardHeader>
            <CardTitle className="text-lg">오늘의 회독</CardTitle>
            <CardDescription>1 · 3 · 7 · 14일 회독 퀘스트</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-[var(--color-text-default)]">
            까먹기 전에 다시 — 순공이가 오늘 복습할 카드를 준비했어요.
          </CardContent>
          <CardFooter>
            <Button size="sm">시작</Button>
          </CardFooter>
        </Card>
        <TokenChips
          tokens={["--color-surface", "--color-border-default", "--radius-lg"]}
        />
      </ExampleCard>
      <DoDont
        dos={[
          "흰색 surface 고정 — 배경이 비치지 않게",
          "--shadow-card 단독으로 부드러운 입체감",
        ]}
        donts={[
          "토스풍 box-shadow 중첩",
          "카드 배경에 그라데이션/네온",
        ]}
      />
    </ShowcaseSection>
  );
}

export function CompStatCard() {
  return (
    <ShowcaseSection
      eyebrow="Components"
      title="Stat 카드 (규격)"
      description="홈(/today)·내기록(/me) 의 stats 4박스 공통 타일. 치수(최소높이·패딩·radius·gap)는 tokens.css --stat-card-* 가 단일 통제(SOO-143). 화면마다 임의 px 금지 — 항상 shared/ui StatCard 사용. 보조행(기억HP 점)이 있어도 4개 카드가 같은 키(등높이)."
    >
      <ExampleCard title="4박스 등높이 — 기억HP 점 행이 있어도 일치">
        <div className="grid w-full max-w-2xl grid-cols-2 items-stretch gap-[var(--stat-card-gap)] sm:grid-cols-4">
          <StatCard
            icon={<Flame size={14} strokeWidth={1.5} />}
            label="스트릭"
            value={3}
            suffix="일"
          />
          <StatCard
            icon={<Brain size={14} strokeWidth={1.5} />}
            label="기억 HP"
            value={4}
            suffix="/ 5"
          >
            <div className="flex gap-[3px]" aria-hidden="true">
              {Array.from({ length: 5 }, (_, i) => (
                <span
                  key={i}
                  className="h-[13px] w-[13px] rounded-full"
                  style={{
                    background:
                      i < 4
                        ? "var(--color-risk-high)"
                        : "var(--color-border-default)",
                  }}
                />
              ))}
            </div>
          </StatCard>
          <StatCard
            icon={<Clock size={14} strokeWidth={1.5} />}
            label="순공시간"
            value={42}
            suffix="분"
          />
          <StatCard
            icon={<Zap size={14} strokeWidth={1.5} />}
            label="오늘 XP"
            value={120}
            suffix="XP"
          />
        </div>
        <TokenChips
          tokens={[
            "--stat-card-min-h",
            "--stat-card-pad",
            "--stat-card-radius",
            "--stat-card-gap",
          ]}
        />
      </ExampleCard>
      <DoDont
        dos={[
          "stats 타일은 항상 shared/ui StatCard 로 — 치수는 --stat-card-* 토큰만",
          "그리드는 items-stretch + gap-[var(--stat-card-gap)] 로 등높이 보장",
          "보조행(기억HP 점)은 카드 안 mt-auto 바닥 정렬 — 카드 높이를 늘리지 않음",
        ]}
        donts={[
          "화면마다 p-3.5 / rounded-md 등 치수를 직접 박기 (drift 원인)",
          "한 카드만 콘텐츠가 길어 키가 달라지게 두기 (등높이 깨짐)",
          "stats 타일용으로 별도 카드 컴포넌트를 새로 만들기",
        ]}
      />
    </ShowcaseSection>
  );
}

export function CompInput() {
  return (
    <ShowcaseSection
      eyebrow="Components"
      title="Input"
      description="default · disabled 상태. Label과 함께 사용한다."
    >
      <ExampleCard title="기본 · 비활성">
        <div className="max-w-sm space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="sg-input">닉네임</Label>
            <Input id="sg-input" placeholder="순공이" />
          </div>
          <Input placeholder="비활성 상태" disabled />
        </div>
        <TokenChips
          tokens={["--color-border-default", "--radius-md", "--color-text-muted"]}
        />
      </ExampleCard>
      <DoDont
        dos={[
          "Label과 항상 함께 — 접근 가능한 폼",
          "비활성/에러 상태를 토큰으로 구분",
        ]}
        donts={[
          "placeholder만으로 라벨 대체",
          "에러를 자극적 원색 테두리로 강조",
        ]}
      />
    </ShowcaseSection>
  );
}

export function CompDialog() {
  return (
    <ShowcaseSection
      eyebrow="Components"
      title="Dialog"
      description="모달 다이얼로그. 클릭하면 실제로 열린다(라이브)."
    >
      <ExampleCard title="라이브">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">다이얼로그 열기</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>회독을 건너뛸까요?</DialogTitle>
              <DialogDescription>
                괜찮아요 — 내일 순공이가 다시 알려줄게요.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="ghost">닫기</Button>
              </DialogClose>
              <DialogClose asChild>
                <Button>오늘은 쉬기</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <TokenChips tokens={["--color-surface", "--color-scrim", "--radius-lg"]} />
      </ExampleCard>
      <DoDont
        dos={[
          "동반자 톤 카피 — “괜찮아요, 내일 다시 알려줄게요.”",
          "되돌릴 수 있는 선택을 명확히",
        ]}
        donts={[
          "죄책감/공포 카피 — “안 하면 망한다”",
          "닫기 어려운 강제 모달로 압박",
        ]}
      />
    </ShowcaseSection>
  );
}

export function CompToast() {
  return (
    <ShowcaseSection
      eyebrow="Components"
      title="Toast"
      description="sonner 기반. 동반자 톤 카피로만 사용한다(압박/공포 ❌)."
    >
      <ExampleCard title="라이브">
        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            onClick={() => toast.success("회독 완료! 기억HP가 채워졌어요.")}
          >
            성공 토스트
          </Button>
          <Button
            variant="outline"
            onClick={() => toast.info("순공이가 잠들고 있어요. 깨워줄까요?")}
          >
            안내 토스트
          </Button>
        </div>
        <TokenChips
          tokens={[
            "--color-surface",
            "--color-border-default",
            "--shadow-elevated",
          ]}
        />
        {/* 루트 레이아웃에 Toaster가 없으므로 쇼케이스 안에서 로컬 마운트 */}
        <Toaster position="bottom-right" />
      </ExampleCard>
      <DoDont
        dos={[
          "성취/안내를 동반자 톤으로 — “기억HP가 채워졌어요.”",
          "짧고 비차단(non-blocking) 피드백",
        ]}
        donts={[
          "잦은 알림으로 압박 (회독 일정 외 reminder ❌)",
          "공포/손실 자극 토스트",
        ]}
      />
    </ShowcaseSection>
  );
}

export function CompPopover() {
  return (
    <ShowcaseSection
      eyebrow="Components"
      title="Popover"
      description="아직 구축되지 않은 컴포넌트."
    >
      <PlaceholderNote title="미구현 — 렌더하지 않음">
        shared/ui에 Popover가 없습니다. 신규 컴포넌트 신설은 본 티켓 범위 밖이라
        렌더하지 않습니다. 필요 시 별도 티켓으로 추가하세요.
      </PlaceholderNote>
    </ShowcaseSection>
  );
}
