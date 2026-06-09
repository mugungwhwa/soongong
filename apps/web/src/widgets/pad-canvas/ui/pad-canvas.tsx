"use client";
import dynamic from "next/dynamic";
import "tldraw/tldraw.css";
import { getSnapshot, type Editor } from "tldraw";

const Tldraw = dynamic(() => import("tldraw").then((m) => m.Tldraw), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center w-full h-[400px] rounded-[var(--radius-lg)] bg-[var(--color-bg-sunken)] text-sm text-[var(--color-text-muted)]">
      캔버스 로딩 중…
    </div>
  ),
});

/** 부모(회독 플레이)가 제출 시점에 풀이를 직렬화/렌더할 수 있는 핸들. */
export interface PadCanvasHandle {
  /** tldraw store 스냅샷(stroke JSON). Storage 저장용. */
  getStrokeJSON: () => unknown;
  /** 현재 페이지 PNG. 빈 캔버스/실패 시 null (graceful). */
  exportPNG: () => Promise<Blob | null>;
}

export function PadCanvas({
  onReady,
}: {
  onReady?: (handle: PadCanvasHandle) => void;
}) {
  function handleMount(editor: Editor) {
    onReady?.({
      getStrokeJSON: () => getSnapshot(editor.store),
      exportPNG: async () => {
        try {
          const ids = Array.from(editor.getCurrentPageShapeIds());
          if (ids.length === 0) return null;
          const { blob } = await editor.toImage(ids, {
            format: "png",
            background: false,
          });
          return blob;
        } catch {
          return null;
        }
      },
    });
  }

  return (
    <div className="w-full h-[400px] rounded-[var(--radius-lg)] overflow-hidden border border-[var(--color-border-default)]">
      <Tldraw onMount={handleMount} />
    </div>
  );
}
