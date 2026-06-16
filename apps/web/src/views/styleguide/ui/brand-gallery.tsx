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
      {/* 6. LOGO — 플랫 심볼 + 워드마크 lockup, light/크림 2버전 */}
      <GalleryBoard n={6} title="Logo · Lockup">
        <div className="mb-2 flex items-center gap-2">
          <TrackTag kind="플랫" />
          <span className="text-xs text-[var(--color-text-default)]">
            플랫 = in-app / 로고 심볼
          </span>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {[
            { bg: "var(--color-bg-elevated)", label: "light 배경" },
            { bg: "var(--color-bg)", label: "크림 배경" },
          ].map((variant) => (
            <div
              key={variant.label}
              className="flex flex-col items-center justify-center gap-2 rounded-[var(--radius-md)] border border-[var(--color-border-default)] p-5"
              style={{ background: variant.bg }}
            >
              <div className="flex items-center gap-3">
                <Image
                  src={`${BRAND}/soongong_icon_main.png`}
                  alt="순공대장 플랫 심볼"
                  width={48}
                  height={48}
                  className="h-12 w-12 object-contain"
                />
                <span className="text-xl font-bold text-[var(--color-text-strong)]">
                  순공대장
                </span>
              </div>
              <span className="text-[11px] text-[var(--color-text-muted)]">
                {variant.label}
              </span>
            </div>
          ))}
        </div>
        <Caption path="public/brand/soongong_icon_main.png" />
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

      {/* 9. CHARACTER — sub-girl.png / sub-boy.png */}
      <GalleryBoard n={9} title="Character · 보조">
        <div className="mb-2 flex items-center gap-2">
          <TrackTag kind="3D" />
          <span className="text-xs text-[var(--color-text-default)]">
            휴먼 보조 캐릭터 2종
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[
            { file: "sub-girl.png", label: "sub-girl" },
            { file: "sub-boy.png", label: "sub-boy" },
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
