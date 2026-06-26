import type { ReactNode } from "react";

/**
 * StatCard — 홈(/today) · 내기록(/me) 공통 stats 4박스 타일의 단일 공용 컴포넌트.
 *
 * 치수(최소높이·패딩·radius·gap)는 tokens.css `--stat-card-*` SSoT 에서만 온다.
 * 화면마다 임의 px 를 박지 말고 항상 이 컴포넌트를 쓴다(중앙 통제, SOO-143).
 *
 * 등높이 보장:
 *  - 부모 grid 는 기본 `align-items: stretch` + `--stat-card-gap`.
 *  - 카드는 `h-full` + `min-h` 토큰 → 한 카드만(기억HP 점 행) 키가 늘던 불일치 차단.
 *  - 보조행(children, 예: 기억HP 0–5 점)은 `mt-auto` 로 바닥 정렬해
 *    값 baseline 을 다른 타일과 맞추고 카드 높이를 늘리지 않는다.
 */
export function StatCard({
  icon,
  label,
  value,
  suffix,
  children,
}: {
  /** 라벨 좌측 아이콘(lucide 엘리먼트 등). 색은 mint-500 으로 통일된다. */
  icon: ReactNode;
  label: string;
  value: string | number;
  suffix?: string;
  /** 값 아래 보조 표현(예: 기억HP 0–5 정수 점). 바닥 정렬된다. */
  children?: ReactNode;
}) {
  return (
    <div
      className="flex h-full flex-col gap-1 border border-[var(--color-border-default)] bg-[var(--color-surface)] shadow-[var(--shadow-card)] min-h-[var(--stat-card-min-h)] p-[var(--stat-card-pad)] rounded-[var(--stat-card-radius)]"
    >
      <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--color-text-muted)]">
        <span className="flex text-[var(--color-mint-500)]">{icon}</span>
        <span>{label}</span>
      </div>
      <div className="text-xl font-extrabold tracking-tight text-[var(--color-text-strong)]">
        {value}
        {suffix && (
          <span className="ml-1 text-xs font-bold text-[var(--color-text-muted)]">
            {suffix}
          </span>
        )}
      </div>
      {children ? <div className="mt-auto">{children}</div> : null}
    </div>
  );
}
