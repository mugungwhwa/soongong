"use client";

import {
  EDIT_GROUPS,
  lengthToNumber,
  type TokenDraft,
} from "../model/tokens";

interface TokenEditorProps {
  draft: TokenDraft;
  seed: TokenDraft;
  onChange: (varName: string, value: string) => void;
  previewScale: number;
  onPreviewScale: (v: number) => void;
}

/** 좌측 편집 패널 — 컬러 피커 + radius·spacing 슬라이더 + 타이포 스케일(프리뷰 전용). */
export function TokenEditor({
  draft,
  seed,
  onChange,
  previewScale,
  onPreviewScale,
}: TokenEditorProps) {
  return (
    <div className="space-y-6">
      {EDIT_GROUPS.map((group) => (
        <fieldset key={group.title} className="space-y-3">
          <legend className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
            {group.title}
          </legend>
          <div className="space-y-2">
            {group.tokens.map((t) => {
              const value = draft[t.varName] ?? "";
              const isDirty =
                (seed[t.varName] ?? "").toLowerCase() !== value.toLowerCase();
              return (
                <div
                  key={t.varName}
                  className="flex items-center justify-between gap-3"
                >
                  <label
                    htmlFor={`edit-${t.varName}`}
                    className="flex min-w-0 flex-1 items-center gap-1.5 text-sm text-[var(--color-text-default)]"
                  >
                    <span className="truncate">{t.label}</span>
                    {isDirty && (
                      <span
                        aria-label="변경됨"
                        title="기본값과 다름 (export 대상)"
                        className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-mint-700)]"
                      />
                    )}
                  </label>

                  {t.kind === "color" ? (
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-[var(--color-text-muted)]">
                        {value}
                      </span>
                      <input
                        id={`edit-${t.varName}`}
                        type="color"
                        value={value}
                        onChange={(e) => onChange(t.varName, e.target.value)}
                        className="h-7 w-9 cursor-pointer rounded border border-[var(--color-border-default)] bg-transparent p-0.5"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="w-12 text-right font-mono text-xs text-[var(--color-text-muted)]">
                        {value}
                      </span>
                      <input
                        id={`edit-${t.varName}`}
                        type="range"
                        min={group.range?.min ?? 0}
                        max={group.range?.max ?? 32}
                        step={group.range?.step ?? 1}
                        value={lengthToNumber(value)}
                        onChange={(e) =>
                          onChange(t.varName, `${e.target.value}px`)
                        }
                        className="w-28 accent-[var(--color-mint-700)]"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </fieldset>
      ))}

      {/* 타이포 스케일 — 백킹 토큰 없음. 프리뷰 미세조정 전용, export 제외. */}
      <fieldset className="space-y-2">
        <legend className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
          타이포 스케일{" "}
          <span className="font-normal normal-case text-[var(--color-text-disabled)]">
            (프리뷰 전용 · export 제외)
          </span>
        </legend>
        <div className="flex items-center gap-2">
          <span className="w-12 text-right font-mono text-xs text-[var(--color-text-muted)]">
            {previewScale.toFixed(2)}×
          </span>
          <input
            type="range"
            min={0.85}
            max={1.2}
            step={0.01}
            value={previewScale}
            onChange={(e) => onPreviewScale(parseFloat(e.target.value))}
            className="w-28 accent-[var(--color-mint-700)]"
          />
        </div>
      </fieldset>
    </div>
  );
}
