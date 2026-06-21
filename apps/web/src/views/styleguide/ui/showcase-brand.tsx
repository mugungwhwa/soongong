"use client";

/**
 * Brand & Mascot 카테고리 뷰 (SOO-69) — 순공이(듀공) + mood 맥락 매핑 + 로고·자산.
 *
 * 마스코트는 듀공 모티프 "순공이" 하나로 락(잠긴 결정). 새 마스코트/mood 이미지를
 * 생성하지 않는다 — 존재하는 자산만 렌더하고, mood 3종(celebrate/comfort/sleep)은
 * design-review §2-1의 "화면 맥락 ↔ mood" 매핑을 문서 카드로 보여준다.
 * 로고·아이콘·플랫/3D 2트랙 갤러리는 기존 BrandGallery를 그대로 재사용한다.
 *
 * ⚠️ raw hex 금지 · `dark:` 금지. 색은 var() 토큰만.
 */

import * as React from "react";
import Image from "next/image";
import { BrandGallery } from "./brand-gallery";
import { ShowcaseSection, ExampleCard, RuleTable } from "./showcase-kit";

const BRAND = "/brand";

/** 화면 맥락 ↔ mood 매핑 — design-review §2-1 (결과=celebrate, 오답=comfort, loss=sleep). */
const MOODS: {
  mood: string;
  context: string;
  tone: string;
}[] = [
  {
    mood: "celebrate",
    context: "결과 화면 · 회독 완료",
    tone: "성취를 함께 기뻐하기 — 스프링 등장 허용(강도 50% 캡)",
  },
  {
    mood: "comfort",
    context: "오답던전 · 망각방어",
    tone: "틀려도 압박 없이 — 빨강 하트 ❌, 기억HP 감소를 부드럽게",
  },
  {
    mood: "sleep",
    context: "streak loss · 비활성 복귀",
    tone: "슬픈 캐릭터 대신 잠든 순공이 — “잠들고 있어요. 깨워줄까요?”",
  },
];

export function BrandMascot() {
  return (
    <ShowcaseSection
      eyebrow="Brand & Mascot"
      title="순공이 · mood"
      description="마스코트는 듀공 모티프 ‘순공이’ 하나로 락. mood는 화면 맥락에 맞춰 노출한다(design-review §2-1). 신규 마스코트·mood 이미지 생성은 금지 — 자산은 GPT-4o로 Mike 직접 제작."
    >
      <ExampleCard title="정본 마스코트" hint="듀공 · 라운드 · 통통 · 친근">
        <div className="flex flex-wrap items-center gap-5">
          <div className="rounded-[var(--radius-lg)] bg-[var(--color-mint-50)] p-3">
            <Image
              src={`${BRAND}/soongong-main.png`}
              alt="순공이 — 전신"
              width={120}
              height={120}
              className="h-28 w-28 object-contain"
            />
          </div>
          <div className="rounded-[var(--radius-lg)] bg-[var(--color-mint-50)] p-3">
            <Image
              src={`${BRAND}/soongong_icon_main.png`}
              alt="순공이 — 아이콘 / 얼굴"
              width={120}
              height={120}
              className="h-28 w-28 object-contain"
            />
          </div>
          <p className="max-w-xs text-xs leading-relaxed text-[var(--color-text-muted)]">
            정본 순공이(듀공) — 전신 + 아이콘. mood 변형은 자산 제작 후 채운다(마스코트 락 — 다른
            모티프로 교체 금지).
            <br />
            <code className="font-mono text-[10px]">public/brand/soongong-main.png · soongong_icon_main.png</code>
          </p>
        </div>
      </ExampleCard>

      <ExampleCard title="mood ↔ 화면 맥락" hint="design-review §2-1">
        <RuleTable
          columns={["mood", "노출 맥락", "톤 가이드"]}
          rows={MOODS.map((m) => [
            <span
              key={m.mood}
              className="font-mono text-[11px] font-bold text-[var(--color-mint-700)]"
            >
              {m.mood}
            </span>,
            m.context,
            m.tone,
          ])}
        />
      </ExampleCard>
    </ShowcaseSection>
  );
}

export function BrandAssets() {
  return (
    <ShowcaseSection
      eyebrow="Brand & Mascot"
      title="로고 · 자산 (플랫 / 3D 2트랙)"
      description="로고 워드마크·앱 아이콘·hero. 플랫 = in-app/로고 심볼, 3D = 마케팅/hero로 트랙을 분리한다. PNG는 색이 baked되어 토큰 비구동(레퍼런스 표시)."
    >
      <BrandGallery />
    </ShowcaseSection>
  );
}
