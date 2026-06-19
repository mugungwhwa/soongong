import Image from "next/image";

/**
 * 브랜드 자산 갤러리 — 보드 6~10. 정적(next/image), 토큰 비구동.
 * PNG 는 색이 baked 되어 슬라이더 영향을 받지 않는다(레퍼런스 표시 전용).
 * 자산은 PR #61(apps/web/public/brand/)이 소유 — 여기선 배치·렌더만 한다.
 */

const BRAND = "/brand";

function TrackTag({ kind }: { kind: "플랫" | "3D" }) {
  return (
    <span className="rounded-[var(--radius-pill)] bg-[var(--color-bg-sunken)] px-2 py-0.5 text-[10px] font-semibold text-[var(--color-text-default)]">
      {kind}
    </span>
  );
}

function Caption({ path }: { path: string }) {
  return (
    <p className="mt-1 font-mono text-[10px] text-[var(--color-text-muted)]">
      {path}
    </p>
  );
}

/**
 * 로고 A안 워드마크 — design-system-lock §2-2 (목업 폴백).
 * SVG <text> + stroke 렌더(Arial Black 계열, RockoUltraFLF 임베드 금지).
 * 색은 토큰 구동(fill·stroke = --color-mint-900 = o900 로고 기본색).
 * Illustrator 아웃라인 SVG path 확보 전까지의 잠정 렌더.
 */
function LogoWordmark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 270 42"
      role="img"
      aria-label="SOONGONG 워드마크"
      className={className}
      style={{ overflow: "visible" }}
    >
      <text
        x="4"
        y="34"
        fontFamily="'Arial Black','Helvetica Neue',Arial,sans-serif"
        fontSize={34}
        fontWeight={900}
        letterSpacing={4}
        strokeWidth={2.5}
        strokeLinejoin="round"
        strokeLinecap="round"
        paintOrder="stroke"
        style={{
          fill: "var(--color-mint-900)",
          stroke: "var(--color-mint-900)",
        }}
      >
        SOONGONG
      </text>
    </svg>
  );
}

function GalleryBoard({
  n,
  title,
  children,
}: {
  n: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[var(--radius-lg)] border border-[var(--color-border-default)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-card)]">
      <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[var(--color-text-muted)]">
        <span className="inline-flex h-5 w-5 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--color-bg-sunken)] text-[10px] text-[var(--color-text-default)]">
          {n}
        </span>
        {title}
      </h3>
      {children}
    </section>
  );
}

export function BrandGallery() {
  return (
    <div className="space-y-5">
      {/* 6. LOGO — 플랫 심볼 + 워드마크 lockup, light/크림 2버전 (lock §2 A안) */}
      <GalleryBoard n={6} title="Logo · Lockup">
        <div className="mb-3 flex items-center gap-2">
          <TrackTag kind="플랫" />
          <span className="text-xs text-[var(--color-text-default)]">
            플랫 = in-app / 로고 심볼 트랙
          </span>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {[
            { bg: "var(--color-bg-elevated)", label: "light 배경" },
            { bg: "var(--color-bg)", label: "크림 배경 (#F8FBF7)" },
          ].map((variant) => (
            <div
              key={variant.label}
              className="flex flex-col items-center justify-center gap-3 rounded-[var(--radius-md)] border border-[var(--color-border-default)] px-5 py-7"
              style={{ background: variant.bg }}
            >
              {/* lockup: 심볼 + 워드마크 가로 정렬. 심볼 높이가 워드마크 cap을
                  살짝 상회하도록 비율 잡고, 심볼 중심을 워드마크에 baseline 정렬 */}
              <div className="flex items-center gap-2.5">
                <Image
                  src={`${BRAND}/soongong_icon_main.png`}
                  alt="순공대장 플랫 심볼"
                  width={44}
                  height={44}
                  className="h-11 w-11 shrink-0 object-contain"
                />
                <span className="flex flex-col items-start leading-none">
                  <LogoWordmark className="h-7 w-auto" />
                  <span className="mt-1 text-[9px] font-medium tracking-[0.18em] text-[var(--color-text-muted)]">
                    순공대장
                  </span>
                </span>
              </div>
              <span className="text-[11px] text-[var(--color-text-muted)]">
                {variant.label}
              </span>
            </div>
          ))}
        </div>
        <Caption path="public/brand/soongong_icon_main.png" />
        {/* ⚠️ Mike 결정 게이트 — 폰트 최종 선택 보류. 리드 임의 확정 금지(lock §2-5). */}
        <p className="mt-3 rounded-[var(--radius-sm)] bg-[var(--color-bg-sunken)] px-3 py-2 text-[10px] leading-relaxed text-[var(--color-text-default)]">
          <span className="font-semibold">워드마크 폰트: A안(잠정)</span> — 시스템
          Arial Black 계열 + SVG stroke 렌더(RockoUltraFLF 임베드 금지).
          <br />B 후보 3종(Lilita One · Fredoka · Bowlby One, Google Fonts SIL
          OFL) <span className="font-semibold">Mike 최종 선택 대기</span> — 전환은
          별도 티켓.
        </p>
      </GalleryBoard>

      {/* 7. APP ICON — icon.png 라운드 스퀘어 + 마스킹 미리보기 */}
      <GalleryBoard n={7} title="App Icon">
        <div className="mb-2 flex items-center gap-2">
          <TrackTag kind="3D" />
          <span className="text-xs text-[var(--color-text-default)]">
            3D 얼굴 · 라운드 스퀘어
          </span>
        </div>
        <div className="flex flex-wrap items-end gap-5">
          {[
            { px: 96, radius: "var(--radius-xl)", label: "round square" },
            { px: 72, radius: "var(--radius-pill)", label: "원형 마스크" },
            { px: 48, radius: "var(--radius-lg)", label: "small" },
          ].map((m) => (
            <div key={m.label} className="flex flex-col items-center gap-1.5">
              <span
                className="overflow-hidden border border-[var(--color-border-default)]"
                style={{
                  width: m.px,
                  height: m.px,
                  borderRadius: m.radius,
                }}
              >
                <Image
                  src={`${BRAND}/icon.png`}
                  alt="순공대장 앱 아이콘"
                  width={m.px}
                  height={m.px}
                  className="h-full w-full object-cover"
                />
              </span>
              <span className="text-[10px] text-[var(--color-text-muted)]">
                {m.label}
              </span>
            </div>
          ))}
        </div>
        <Caption path="public/brand/icon.png" />
      </GalleryBoard>

      {/* 8. MASCOT — soongong-main.png 풀바디 */}
      <GalleryBoard n={8} title="Mascot">
        <div className="mb-2 flex items-center gap-2">
          <TrackTag kind="3D" />
          <span className="text-xs text-[var(--color-text-default)]">
            3D = 마케팅 / hero · 풀바디 마스코트
          </span>
        </div>
        <div className="flex justify-center rounded-[var(--radius-md)] bg-[var(--color-bg-sunken)] p-4">
          <Image
            src={`${BRAND}/soongong-main.png`}
            alt="순공이 풀바디 마스코트"
            width={220}
            height={220}
            className="h-auto w-[220px] max-w-full object-contain"
          />
        </div>
        <Caption path="public/brand/soongong-main.png" />
      </GalleryBoard>

      {/* 9. CHARACTER — sub-girl-alpha.png / sub-boy-alpha.png (배경 투명, SOO-79) */}
      <GalleryBoard n={9} title="Character · 보조">
        <div className="mb-2 flex items-center gap-2">
          <TrackTag kind="3D" />
          <span className="text-xs text-[var(--color-text-default)]">
            휴먼 보조 캐릭터 2종 (배경 투명)
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[
            { file: "sub-girl-alpha.png", label: "sub-girl" },
            { file: "sub-boy-alpha.png", label: "sub-boy" },
          ].map((c) => (
            <div
              key={c.file}
              className="flex flex-col items-center gap-2 rounded-[var(--radius-md)] bg-[var(--color-bg-sunken)] p-3"
            >
              <Image
                src={`${BRAND}/${c.file}`}
                alt={`보조 캐릭터 ${c.label}`}
                width={140}
                height={140}
                className="h-auto w-[140px] max-w-full object-contain"
              />
              <span className="font-mono text-[10px] text-[var(--color-text-muted)]">
                public/brand/{c.file}
              </span>
            </div>
          ))}
        </div>
      </GalleryBoard>

      {/* 10. HERO — main_concepting_.png 배너 썸네일 */}
      <GalleryBoard n={10} title="Hero · 배너">
        <div className="mb-2 flex items-center gap-2">
          <TrackTag kind="3D" />
          <span className="text-xs text-[var(--color-text-default)]">
            마케팅 컨텍스트 예시 (hero 배너)
          </span>
        </div>
        <div className="overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border-default)]">
          <Image
            src={`${BRAND}/main_concepting_.png`}
            alt="순공대장 hero 배너"
            width={760}
            height={320}
            className="h-auto w-full object-cover"
          />
        </div>
        <Caption path="public/brand/main_concepting_.png" />
      </GalleryBoard>
    </div>
  );
}
