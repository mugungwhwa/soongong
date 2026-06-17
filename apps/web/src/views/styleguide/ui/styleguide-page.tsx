"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { RotateCcw, Copy, Check } from "lucide-react";
import {
  ALL_EDITABLE_VARS,
  DRAFT_STORAGE_KEY,
  buildExportText,
  buildDiff,
  readSeed,
  type TokenDraft,
} from "../model/tokens";
import { TokenEditor } from "./token-editor";
import { TokenPreview } from "./token-preview";
import { BrandGallery } from "./brand-gallery";
import { LockedDecisions } from "./locked-decisions";

interface PersistedDraft {
  tokens: TokenDraft;
  scale: number;
}

// 프리뷰 스케일 허용 범위 (TokenEditor 슬라이더와 동일).
const SCALE_MIN = 0.85;
const SCALE_MAX = 1.2;

/** 평범한 string→string 레코드인지 검증 (배열/null/중첩객체 거부). */
function isStringRecord(v: unknown): v is Record<string, string> {
  if (typeof v !== "object" || v === null || Array.isArray(v)) return false;
  return Object.values(v).every((val) => typeof val === "string");
}

function loadPersisted(): PersistedDraft | null {
  try {
    const raw = window.localStorage.getItem(DRAFT_STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return null;

    const obj = parsed as Record<string, unknown>;
    const tokens = isStringRecord(obj.tokens) ? obj.tokens : {};
    const rawScale = obj.scale;
    const scale =
      typeof rawScale === "number" &&
      Number.isFinite(rawScale) &&
      rawScale >= SCALE_MIN &&
      rawScale <= SCALE_MAX
        ? rawScale
        : 1;

    return { tokens, scale };
  } catch {
    return null;
  }
}

/**
 * /styleguide 조종석 — 좌 편집 + 우 라이브 프리뷰 2분할.
 * tokens.css(SSoT)는 직접 쓰지 않는다. 런타임 조정은 localStorage 드래프트로만,
 * 진실 반영은 오직 Export diff → Mike 가 PR 로 커밋.
 */
export function StyleguidePage() {
  const [mounted, setMounted] = useState(false);
  const [seed, setSeed] = useState<TokenDraft>({});
  const [draft, setDraft] = useState<TokenDraft>({});
  const [previewScale, setPreviewScale] = useState(1);
  const [copied, setCopied] = useState(false);

  // 마운트 시 tokens.css :root 에서 seed 를 읽고, 저장된 드래프트가 있으면 덮어쓴다.
  useEffect(() => {
    const freshSeed = readSeed();
    setSeed(freshSeed);
    const persisted = loadPersisted();
    if (persisted) {
      setDraft({ ...freshSeed, ...persisted.tokens });
      setPreviewScale(persisted.scale);
    } else {
      setDraft(freshSeed);
    }
    setMounted(true);
  }, []);

  // 드래프트 자동 저장 (마운트 후에만 — seed 로 덮어쓰는 사고 방지).
  useEffect(() => {
    if (!mounted) return;
    try {
      window.localStorage.setItem(
        DRAFT_STORAGE_KEY,
        JSON.stringify({ tokens: draft, scale: previewScale }),
      );
    } catch {
      /* 저장 실패는 무시 (프라이빗 모드 등) */
    }
  }, [draft, previewScale, mounted]);

  const handleChange = useCallback((varName: string, value: string) => {
    setDraft((prev) => ({ ...prev, [varName]: value }));
  }, []);

  const handleReset = useCallback(() => {
    setDraft(seed);
    setPreviewScale(1);
    try {
      window.localStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch {
      /* noop */
    }
  }, [seed]);

  const exportText = useMemo(
    () => buildExportText(seed, draft),
    [seed, draft],
  );
  const changedCount = useMemo(
    () => buildDiff(seed, draft).length,
    [seed, draft],
  );

  // 라이브 오버라이드 — 편집한 토큰만 프리뷰 컬럼 래퍼에 CSS 변수로 덮는다.
  const overrideStyle = useMemo(() => {
    const style: Record<string, string> = {};
    for (const varName of ALL_EDITABLE_VARS) {
      if (draft[varName]) style[varName] = draft[varName];
    }
    return style as React.CSSProperties;
  }, [draft]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(exportText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      /* 클립보드 거부 시 textarea 에서 수동 복사 */
    }
  }, [exportText]);

  if (!mounted) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[var(--color-background)] text-sm text-[var(--color-text-muted)]">
        토큰 seed 로딩 중…
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--color-background)] px-4 py-6 lg:px-8">
      <header className="mx-auto mb-6 max-w-7xl">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold text-[var(--color-text-strong)]">
            순공대장 · 디자인 토큰 플레이그라운드
          </h1>
          <span className="rounded-[var(--radius-pill)] bg-[var(--color-warning-bg)] px-2.5 py-0.5 text-[11px] font-semibold text-[var(--color-text-on-warm)]">
            dev only · noindex
          </span>
        </div>
        <p className="mt-1 max-w-3xl text-sm text-[var(--color-text-muted)]">
          tokens.css(v2 teal)를 seed 로 읽어 시각 조정하는 조종석입니다. 이 페이지는
          tokens.css 에 직접 쓰지 않습니다 — 조정은 localStorage 드래프트로만, 진실
          반영은 <strong className="text-[var(--color-text-default)]">Export diff</strong>{" "}
          → PR 한 경로뿐입니다.
        </p>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[320px_1fr]">
        {/* 좌측 — 편집 + export/reset (sticky) */}
        <aside className="lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)] lg:overflow-y-auto">
          <div className="rounded-[var(--radius-lg)] border border-[var(--color-border-default)] bg-[var(--color-surface)] p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-bold text-[var(--color-text-strong)]">
                토큰 편집
              </h2>
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1 rounded-[var(--radius-sm)] px-2 py-1 text-xs text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-bg-sunken)]"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                tokens.css로 리셋
              </button>
            </div>

            <TokenEditor
              draft={draft}
              seed={seed}
              onChange={handleChange}
              previewScale={previewScale}
              onPreviewScale={setPreviewScale}
            />

            {/* Export diff */}
            <div className="mt-6 border-t border-[var(--color-border-default)] pt-4">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-sm font-bold text-[var(--color-text-strong)]">
                  Export diff
                  <span className="ml-1.5 font-normal text-[var(--color-text-muted)]">
                    변경 {changedCount}건
                  </span>
                </h3>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1 rounded-[var(--radius-sm)] bg-[var(--color-mint-700)] px-2.5 py-1 text-xs font-semibold text-[var(--color-text-inverse)] transition-opacity hover:opacity-90"
                >
                  {copied ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                  {copied ? "복사됨" : "복사"}
                </button>
              </div>
              <textarea
                readOnly
                value={exportText}
                spellCheck={false}
                className="h-44 w-full resize-none rounded-[var(--radius-md)] border border-[var(--color-border-default)] bg-[var(--color-bg-sunken)] p-3 font-mono text-[11px] leading-relaxed text-[var(--color-text-default)]"
              />
              <p className="mt-1.5 text-[11px] text-[var(--color-text-muted)]">
                기본값 대비 변경 토큰만 출력됩니다. tokens.css 의 :root 에 반영 후 PR 로
                커밋하세요.
              </p>
            </div>
          </div>
        </aside>

        {/* 우측 — 라이브 프리뷰 (override 적용) + 정적 갤러리 + 잠긴 결정 */}
        <div className="space-y-8">
          <div style={overrideStyle} className="space-y-8">
            <div>
              <p className="mb-3 text-xs font-bold uppercase tracking-widest text-[var(--color-text-default)]">
                A · 토큰 구동 구역 (라이브)
              </p>
              <TokenPreview draft={draft} previewScale={previewScale} />
            </div>

            <div>
              <p className="mb-3 text-xs font-bold uppercase tracking-widest text-[var(--color-text-default)]">
                B · 브랜드 자산 갤러리 (정적 · 토큰 비구동)
              </p>
              <BrandGallery />
            </div>
          </div>

          <LockedDecisions />
        </div>
      </div>
    </main>
  );
}
