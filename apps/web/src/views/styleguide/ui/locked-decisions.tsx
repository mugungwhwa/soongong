/**
 * 읽기 전용 — ui-master §4.2 "잠긴 결정 11 / 절대 금지 7" + 플랫/3D 2트랙 원칙 인용.
 * 조정 대상 아님(표시만). 규칙은 인용하되 값(hex)은 복붙하지 않는다
 * (SSoT = tokens.css / ui-master; lint:tokens 통과).
 */

const LOCKED: { k: string; v: string }[] = [
  { k: "모티프", v: "듀공(sea dugong) — 라운드 / 통통 / 친근. 마스코트 락" },
  { k: "톤", v: "Light Study Garden · 카와이 스티커" },
  { k: "레퍼런스", v: "듀오링고 + 카카오 헤이바이브 + 클래스101" },
  { k: "이미지 생성", v: "GPT-4o (ChatGPT Plus) — Mike 직접" },
  { k: "비율 / 사이즈", v: "정사각형 1:1 · 1024 / 512 / 256 / 128 / 64 PNG" },
  { k: "2트랙 원칙", v: "플랫 = in-app / 로고 심볼 · 3D = 마케팅 / hero" },
];

const FORBIDDEN: string[] = [
  "어두운 게임풍 톤 · 짙은 남색 계열 · 어두운 색조",
  "위협적 캐릭터화 (학습 = 공포 프레이밍)",
  "외주 발주 (작가 / 일러스트레이터)",
  "토스 단일 reference 차용",
  "Midjourney 신규 생성 (v0.1만 보존)",
  "DALL-E 3 단독 (캐릭터 일관성 약함)",
  "다른 마스코트로 갈아끼우기 (순공이 락)",
];

export function LockedDecisions() {
  return (
    <section className="rounded-[var(--radius-lg)] border border-[var(--color-border-default)] bg-[var(--color-bg-sunken)] p-5">
      <h3 className="mb-1 text-xs font-semibold uppercase tracking-widest text-[var(--color-text-muted)]">
        잠긴 결정 · 절대 금지 (읽기 전용)
      </h3>
      <p className="mb-4 text-[11px] text-[var(--color-text-muted)]">
        출처: ui-master §4.2 — 조정 대상 아님, 표시만. 값은 tokens.css가 SSoT.
      </p>

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <h4 className="mb-2 text-[11px] font-bold text-[var(--color-text-strong)]">
            잠긴 결정
          </h4>
          <dl className="space-y-1.5">
            {LOCKED.map((d) => (
              <div key={d.k} className="flex gap-2 text-xs">
                <dt className="w-24 shrink-0 font-semibold text-[var(--color-text-default)]">
                  {d.k}
                </dt>
                <dd className="text-[var(--color-text-muted)]">{d.v}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div>
          <h4 className="mb-2 text-[11px] font-bold text-[var(--color-text-strong)]">
            절대 금지 (회귀 시 즉시 거절)
          </h4>
          <ul className="space-y-1.5">
            {FORBIDDEN.map((f) => (
              <li
                key={f}
                className="flex gap-2 text-xs text-[var(--color-text-muted)]"
              >
                <span
                  aria-hidden
                  className="shrink-0 font-bold text-[var(--color-danger)]"
                >
                  ✕
                </span>
                {f}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
