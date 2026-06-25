import Link from "next/link";
import { Card } from "@/shared/ui/card";
import { FileText } from "lucide-react";
import { ROUTES } from "@/shared/config/routes";
import type { Quest, QuestRiskLevel } from "@/shared/contracts";

/**
 * 오늘의 회독 항목 카드 — SOO-128 프로토타입(.q) 정합.
 *
 * 레이아웃: 문서아이콘 + (과목·개념 / 회독주기 서브카피) + 위험도 pill.
 * 카드 전체가 풀기 진입점(Link). 색·라운드는 tokens.css 변수만 사용.
 *
 * 위험도 라벨은 프로토타입 SSoT(위험/불안정/안정권)를 따른다. entities/quest 의
 * 공용 RiskBadge(위험/주의/여유)와 라벨 정책이 달라, 본 화면 전용으로 로컬 렌더.
 * 색은 데사처드 risk 토큰(risk-high/mid/low) 그대로 — 자극 원색 금지(design-review §2-2).
 */
// 색은 데사처드 risk 토큰 + 토큰 전경색만(원색·하드코딩 hex 금지, lint:tokens 게이트).
// 전경은 공용 RiskBadge 규약과 동일: 빨강/노랑 pill엔 warm-dark, 초록 pill엔 mint-900.
const RISK: Record<QuestRiskLevel, { bg: string; fg: string; label: string }> = {
  high: { bg: "var(--color-risk-high)", fg: "var(--color-text-on-warm)", label: "위험" },
  mid: { bg: "var(--color-risk-mid)", fg: "var(--color-text-on-warm)", label: "불안정" },
  low: { bg: "var(--color-risk-low)", fg: "var(--color-mint-900)", label: "안정권" },
};

/** 회독 주기 서브카피 — 위험도별 동반자 톤(압박/죄책감 없이). */
const CYCLE_HINT: Record<QuestRiskLevel, string> = {
  high: "마지막 회독 3일 전 · 1·3·7·14일 주기",
  mid: "마지막 회독 어제 · 곧 흐려질 때",
  low: "안정권 진입 · 한 번 더 다지기",
};

export function QuestCard({ quest }: { quest: Quest; index?: number }) {
  const risk = RISK[quest.riskLevel];
  return (
    <Link href={ROUTES.play(quest.questId)} className="block">
      <Card className="flex items-center gap-3 px-4 py-3 shadow-[var(--shadow-card)] border-[var(--color-border-default)] transition-colors hover:bg-[var(--color-mint-50)]">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-mint-50)]">
          <FileText
            size={21}
            strokeWidth={1.5}
            color="var(--color-mint-700)"
            fill="none"
            aria-hidden="true"
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-bold text-[var(--color-text-strong)]">
            {quest.subject} · {quest.topic}
          </div>
          <div className="mt-0.5 text-xs text-[var(--color-text-muted)]">
            {CYCLE_HINT[quest.riskLevel]}
          </div>
        </div>
        <span
          className="shrink-0 rounded-[var(--radius-pill)] px-2.5 py-1 text-xs font-extrabold"
          style={{ background: risk.bg, color: risk.fg }}
        >
          {risk.label}
        </span>
      </Card>
    </Link>
  );
}
