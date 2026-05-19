"use client";
import dynamic from "next/dynamic";
import "tldraw/tldraw.css";

const Tldraw = dynamic(() => import("tldraw").then((m) => m.Tldraw), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center w-full h-[400px] rounded-[var(--radius-lg)] bg-[var(--color-bg-sunken)] text-sm text-[var(--color-text-muted)]">
      캔버스 로딩 중…
    </div>
  ),
});

export function PadCanvas() {
  return (
    <div className="w-full h-[400px] rounded-[var(--radius-lg)] overflow-hidden border border-[var(--color-border-default)]">
      <Tldraw />
    </div>
  );
}
