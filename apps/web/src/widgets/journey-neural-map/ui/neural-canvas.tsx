"use client";

import { useEffect, useRef } from "react";
import type { JourneyNode, JourneyRegion } from "@/features/journey-map";
import { litColor, rgba, type JourneyPalette } from "../model/colors";
import {
  BRAIN_RX,
  BRAIN_RY,
  CENTER,
  hashStr,
  layoutRegionNodes,
  layoutRegions,
  type NodeLayout,
  type RegionLayout,
} from "../model/layout";
import { NEAR_THRESHOLD, Viewport } from "../model/viewport";
import { JOURNEY_MAP_STRINGS as S } from "../model/strings";

/** 한 뷰에 그릴 최대 노드 — 프레임 보장(이슈: ≤300노드/뷰). */
const MAX_NODES_PER_VIEW = 300;
const TAP_MOVE_TOL = 6; // px — 이 이하 이동이면 탭
const TAP_TIME_TOL = 280; // ms

interface NeuralCanvasProps {
  regions: JourneyRegion[];
  regionNodes: Record<string, JourneyNode[]>;
  palette: JourneyPalette;
  reducedMotion: boolean;
  /** 진입 시 중앙 정렬할 최악 영역. */
  autoFocusRegionCode: string | null;
  /** near 진입(줌인/탭)으로 영역 노드가 필요해질 때. lazy 페치 트리거. */
  onRegionEnter: (code: string) => void;
  /** 노드 탭 → 회독 진입. */
  onNodeTap: (conceptId: string) => void;
}

interface DimInfo {
  isDimming: boolean;
  riskTint: string; // dimMid | dimHigh
}

function dimInfo(
  palette: JourneyPalette,
  risk: JourneyNode["forgetting_risk"],
  due: string | null,
): DimInfo {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const overdue = due ? new Date(due + "T00:00:00").getTime() <= today.getTime() : false;
  if (risk === "high" || overdue) return { isDimming: true, riskTint: palette.dimHigh };
  if (risk === "medium") return { isDimming: true, riskTint: palette.dimMid };
  return { isDimming: false, riskTint: palette.litHigh };
}

export function NeuralCanvas({
  regions,
  regionNodes,
  palette,
  reducedMotion,
  autoFocusRegionCode,
  onRegionEnter,
  onNodeTap,
}: NeuralCanvasProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const vpRef = useRef(new Viewport());

  // 매 프레임 최신 props 참조(rAF 클로저 갱신 회피).
  const stateRef = useRef({
    regions,
    regionNodes,
    palette,
    reducedMotion,
    onRegionEnter,
    onNodeTap,
  });
  stateRef.current = {
    regions,
    regionNodes,
    palette,
    reducedMotion,
    onRegionEnter,
    onNodeTap,
  };

  // 영역 레이아웃 캐시(regions 동일하면 재계산 안 함).
  // 키에 stats까지 포함 — region_code 집합이 같아도 통계가 갱신되면 stale 방지
  // (lobe 반경은 node_count 파생, 렌더는 mastery_avg/dimming/risk 의존).
  const regionLayoutRef = useRef<RegionLayout[]>([]);
  const regionLayoutKeyRef = useRef<string>("");
  {
    const key = regions
      .map(
        (r) =>
          `${r.region_code}:${r.node_count}:${r.mastery_avg}:${r.dimming_count}:${r.risk_score}`,
      )
      .join("|");
    if (key !== regionLayoutKeyRef.current) {
      regionLayoutRef.current = layoutRegions(regions);
      regionLayoutKeyRef.current = key;
    }
  }

  // near 노드 레이아웃 메모(영역별).
  const nodeLayoutCache = useRef<Map<string, NodeLayout[]>>(new Map());

  // 인터랙션 상태(rAF/이벤트 공유).
  const interaction = useRef({
    pointers: new Map<number, { x: number; y: number }>(),
    dragging: false,
    lastX: 0,
    lastY: 0,
    lastT: 0,
    vx: 0,
    vy: 0,
    downX: 0,
    downY: 0,
    downT: 0,
    pinchDist: 0,
    pinchMidX: 0,
    pinchMidY: 0,
    hoverConceptId: null as string | null,
    activeRegionCode: null as string | null,
    didInitFocus: false,
  });

  function getNodeLayout(code: string, center: { x: number; y: number }): NodeLayout[] {
    const cached = nodeLayoutCache.current.get(code);
    if (cached) return cached;
    const nodes = stateRef.current.regionNodes[code];
    if (!nodes) return [];
    const laid = layoutRegionNodes(nodes, center);
    nodeLayoutCache.current.set(code, laid);
    return laid;
  }

  // regionNodes 갱신 시 해당 캐시 무효화(새 노드 반영).
  useEffect(() => {
    nodeLayoutCache.current.clear();
  }, [regionNodes]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let dpr = Math.min(window.devicePixelRatio || 1, 2.5);
    let viewW = 0;
    let viewH = 0;

    function resize() {
      const rect = container!.getBoundingClientRect();
      viewW = Math.max(1, rect.width);
      viewH = Math.max(1, rect.height);
      dpr = Math.min(window.devicePixelRatio || 1, 2.5);
      canvas!.width = Math.round(viewW * dpr);
      canvas!.height = Math.round(viewH * dpr);
      canvas!.style.width = `${viewW}px`;
      canvas!.style.height = `${viewH}px`;
      // 최초 1회: 최악 영역 auto-focus(없으면 전체 뇌 중심).
      const it = interaction.current;
      if (!it.didInitFocus && viewW > 1) {
        it.didInitFocus = true;
        const focus = stateRef.current.regions.find(
          (r) => r.region_code === autoFocusRegionCode,
        );
        const layout = regionLayoutRef.current;
        if (focus && layout.length) {
          const fl = layout.find((l) => l.region.region_code === focus.region_code);
          if (fl) {
            vpRef.current.centerOn(1.25, fl.x, fl.y, viewW, viewH);
            return;
          }
        }
        vpRef.current.centerOn(0.85, CENTER.x, CENTER.y, viewW, viewH);
      }
    }

    const ro = new ResizeObserver(resize);
    ro.observe(container);
    resize();

    // ── 가시성: 화면 밖/탭 숨김 시 rAF 루프 자체를 취소·재개(배터리·CPU 절약) ──
    // 렌더만 스킵하면 콜백이 계속 돌아 절감이 제한적이므로 루프를 멈췄다 재개한다.
    let visible = true;
    let running = false;
    let raf = 0;
    let lastFrame = performance.now();

    function startLoop() {
      if (running || !visible || document.hidden) return;
      running = true;
      lastFrame = performance.now();
      raf = requestAnimationFrame(frame);
    }

    function stopLoop() {
      running = false;
      if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    }

    const io = new IntersectionObserver(
      (entries) => {
        visible = entries[0]?.isIntersecting ?? true;
        if (visible) startLoop();
        else stopLoop();
      },
      { threshold: 0.01 },
    );
    io.observe(container);

    function onVisibilityChange() {
      if (document.hidden) stopLoop();
      else startLoop();
    }
    document.addEventListener("visibilitychange", onVisibilityChange);

    function frame(now: number) {
      if (!running) return;
      raf = requestAnimationFrame(frame);
      const dt = Math.min(48, now - lastFrame);
      lastFrame = now;

      const vp = vpRef.current;
      const it = interaction.current;
      vp.tick(dt, it.dragging);

      // near LOD: 뷰포트 중앙에 가장 가까운 영역을 active로, 노드 lazy 요청.
      const layout = regionLayoutRef.current;
      if (vp.scale >= NEAR_THRESHOLD && layout.length) {
        const cw = vp.screenToWorld(viewW / 2, viewH / 2);
        let nearest: RegionLayout | null = null;
        let best = Infinity;
        for (const rl of layout) {
          const d = (rl.x - cw.x) ** 2 + (rl.y - cw.y) ** 2;
          if (d < best) {
            best = d;
            nearest = rl;
          }
        }
        if (nearest && nearest.region.region_code !== it.activeRegionCode) {
          it.activeRegionCode = nearest.region.region_code;
          stateRef.current.onRegionEnter(nearest.region.region_code);
        }
      } else {
        it.activeRegionCode = null;
      }

      render(now);
    }

    function render(now: number) {
      const vp = vpRef.current;
      const it = interaction.current;
      const { palette: pal, reducedMotion: rm } = stateRef.current;
      const phase = rm ? 0 : now / 1000;

      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx!.clearRect(0, 0, viewW, viewH);

      // ── 배경: 딥 틸 라디알(글로우 대비, 캔버스 한정 표면) ──
      const bg = ctx!.createRadialGradient(
        viewW / 2,
        viewH * 0.42,
        0,
        viewW / 2,
        viewH * 0.42,
        Math.max(viewW, viewH) * 0.75,
      );
      bg.addColorStop(0, pal.bgCenter);
      bg.addColorStop(1, pal.bgEdge);
      ctx!.fillStyle = bg;
      ctx!.fillRect(0, 0, viewW, viewH);

      // ── 뇌 실루엣(은은한 외곽) ──
      drawBrainSilhouette(ctx!, vp, pal);

      const near = vp.scale >= NEAR_THRESHOLD;
      const layout = regionLayoutRef.current;

      ctx!.save();
      ctx!.globalCompositeOperation = "lighter"; // 불빛 가산 합성

      for (const rl of layout) {
        const isActive = rl.region.region_code === it.activeRegionCode;
        if (near && isActive) continue; // active 영역은 노드로 대체
        drawRegionLobe(ctx!, vp, pal, rl, phase, viewW, viewH);
      }

      // near: active 영역 노드 렌더(culling + ≤300).
      let hoverDrawn: { x: number; y: number; label: string } | null = null;
      if (near && it.activeRegionCode) {
        const rl = layout.find((l) => l.region.region_code === it.activeRegionCode);
        if (rl) {
          const nodes = getNodeLayout(it.activeRegionCode, { x: rl.x, y: rl.y });
          const visibleNodes = cullNodes(nodes, vp, viewW, viewH);
          for (const nl of visibleNodes) {
            const s = vp.worldToScreen(nl.x, nl.y);
            const r = nl.radius * vp.scale;
            const di = dimInfo(pal, nl.node.forgetting_risk, nl.node.next_review_due);
            drawGlow(ctx!, s.x, s.y, r, nl.node.mastery, di, pal, phase, hashStr(nl.node.concept_id));
            if (nl.node.concept_id === it.hoverConceptId) {
              hoverDrawn = {
                x: s.x,
                y: s.y,
                label: nl.node.topic_name ?? nl.node.unit_name ?? "",
              };
            }
          }
        }
      }
      ctx!.restore();

      // ── 라벨(가산합성 밖, 또렷하게) ──
      ctx!.textAlign = "center";
      ctx!.textBaseline = "middle";
      if (!near) {
        // far: 영역명만(글자 충돌 방지).
        for (const rl of layout) {
          const s = vp.worldToScreen(rl.x, rl.y);
          const r = rl.radius * vp.scale;
          drawLabel(ctx!, rl.region.region_name, s.x, s.y + r + 16, pal, 13, true);
        }
      } else if (it.activeRegionCode) {
        // near: unit 라벨(클러스터) + 호버 개념명.
        const rl = layout.find((l) => l.region.region_code === it.activeRegionCode);
        if (rl) {
          drawUnitLabels(
            ctx!,
            vp,
            pal,
            getNodeLayout(it.activeRegionCode, { x: rl.x, y: rl.y }),
            viewW,
            viewH,
          );
        }
        if (hoverDrawn && hoverDrawn.label) {
          drawTooltip(ctx!, hoverDrawn.x, hoverDrawn.y, hoverDrawn.label, pal);
        }
      }
    }

    startLoop();

    // ── 포인터 이벤트(팬/줌/핀치/탭/호버) ──
    function toLocal(e: PointerEvent): { x: number; y: number } {
      const rect = canvas!.getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    }

    function onPointerDown(e: PointerEvent) {
      canvas!.setPointerCapture(e.pointerId);
      const p = toLocal(e);
      const it = interaction.current;
      it.pointers.set(e.pointerId, p);
      if (it.pointers.size === 1) {
        it.dragging = true;
        it.lastX = p.x;
        it.lastY = p.y;
        it.lastT = performance.now();
        it.vx = 0;
        it.vy = 0;
        it.downX = p.x;
        it.downY = p.y;
        it.downT = performance.now();
        vpRef.current.stopMomentum();
      } else if (it.pointers.size === 2) {
        const pts = [...it.pointers.values()];
        it.pinchDist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
        it.pinchMidX = (pts[0].x + pts[1].x) / 2;
        it.pinchMidY = (pts[0].y + pts[1].y) / 2;
        it.dragging = false;
      }
    }

    function onPointerMove(e: PointerEvent) {
      const it = interaction.current;
      const p = toLocal(e);
      if (!it.pointers.has(e.pointerId)) {
        // 호버(near 노드 툴팁용)
        updateHover(p);
        return;
      }
      it.pointers.set(e.pointerId, p);

      if (it.pointers.size === 2) {
        const pts = [...it.pointers.values()];
        const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
        const midX = (pts[0].x + pts[1].x) / 2;
        const midY = (pts[0].y + pts[1].y) / 2;
        if (it.pinchDist > 0) {
          vpRef.current.zoomAt(midX, midY, dist / it.pinchDist);
          vpRef.current.panBy(midX - it.pinchMidX, midY - it.pinchMidY);
        }
        it.pinchDist = dist;
        it.pinchMidX = midX;
        it.pinchMidY = midY;
      } else if (it.dragging) {
        const dx = p.x - it.lastX;
        const dy = p.y - it.lastY;
        vpRef.current.panBy(dx, dy);
        const nowT = performance.now();
        const dtm = Math.max(1, nowT - it.lastT);
        // 속도(px/ms) 저역통과로 부드럽게.
        it.vx = it.vx * 0.6 + (dx / dtm) * 0.4;
        it.vy = it.vy * 0.6 + (dy / dtm) * 0.4;
        it.lastX = p.x;
        it.lastY = p.y;
        it.lastT = nowT;
      }
    }

    function updateHover(p: { x: number; y: number }) {
      const it = interaction.current;
      const vp = vpRef.current;
      if (vp.scale < NEAR_THRESHOLD || !it.activeRegionCode) {
        if (it.hoverConceptId) it.hoverConceptId = null;
        return;
      }
      const rl = regionLayoutRef.current.find(
        (l) => l.region.region_code === it.activeRegionCode,
      );
      if (!rl) return;
      const w = vp.screenToWorld(p.x, p.y);
      const nodes = getNodeLayout(it.activeRegionCode, { x: rl.x, y: rl.y });
      let found: string | null = null;
      for (const nl of nodes) {
        const rr = Math.max(nl.radius, 14);
        if ((nl.x - w.x) ** 2 + (nl.y - w.y) ** 2 <= rr * rr) {
          found = nl.node.concept_id;
          break;
        }
      }
      it.hoverConceptId = found;
      canvas!.style.cursor = found ? "pointer" : "grab";
    }

    function endPointer(e: PointerEvent) {
      const it = interaction.current;
      const wasSize = it.pointers.size;
      const p = it.pointers.get(e.pointerId) ?? toLocal(e);
      it.pointers.delete(e.pointerId);
      if (canvas!.hasPointerCapture(e.pointerId)) {
        canvas!.releasePointerCapture(e.pointerId);
      }

      if (wasSize === 1) {
        const movedDist = Math.hypot(p.x - it.downX, p.y - it.downY);
        const elapsed = performance.now() - it.downT;
        if (movedDist <= TAP_MOVE_TOL && elapsed <= TAP_TIME_TOL) {
          handleTap(p);
        } else {
          // 드래그 종료 → 관성.
          vpRef.current.fling(it.vx, it.vy);
        }
        it.dragging = false;
      }
      if (it.pointers.size < 2) it.pinchDist = 0;
      if (it.pointers.size === 0) it.dragging = false;
    }

    function handleTap(p: { x: number; y: number }) {
      const vp = vpRef.current;
      const w = vp.screenToWorld(p.x, p.y);
      const layout = regionLayoutRef.current;
      const it = interaction.current;

      // near + active 영역 → 노드 hit-test 우선.
      if (vp.scale >= NEAR_THRESHOLD && it.activeRegionCode) {
        const rl = layout.find((l) => l.region.region_code === it.activeRegionCode);
        if (rl) {
          const nodes = getNodeLayout(it.activeRegionCode, { x: rl.x, y: rl.y });
          for (const nl of nodes) {
            const rr = Math.max(nl.radius, 16);
            if ((nl.x - w.x) ** 2 + (nl.y - w.y) ** 2 <= rr * rr) {
              stateRef.current.onNodeTap(nl.node.concept_id);
              return;
            }
          }
        }
      }
      // 영역 lobe hit-test → 줌인(near) + 노드 lazy 요청.
      for (const rl of layout) {
        if ((rl.x - w.x) ** 2 + (rl.y - w.y) ** 2 <= rl.radius * rl.radius) {
          vp.animateTo(2.0, rl.x, rl.y, viewW, viewH);
          stateRef.current.onRegionEnter(rl.region.region_code);
          return;
        }
      }
    }

    function onWheel(e: WheelEvent) {
      e.preventDefault();
      const p = toLocal(e as unknown as PointerEvent);
      const factor = Math.exp(-e.deltaY * 0.0015); // 부드러운 지수 줌
      vpRef.current.zoomAt(p.x, p.y, factor);
    }

    canvas.style.cursor = "grab";
    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerup", endPointer);
    canvas.addEventListener("pointercancel", endPointer);
    canvas.addEventListener("pointerleave", (e) => {
      interaction.current.hoverConceptId = null;
      if (interaction.current.pointers.has(e.pointerId)) endPointer(e);
    });
    canvas.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      stopLoop();
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibilityChange);
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", endPointer);
      canvas.removeEventListener("pointercancel", endPointer);
      canvas.removeEventListener("wheel", onWheel);
    };
    // 마운트 시 1회 셋업. 최신 props는 stateRef로 읽음.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full overflow-hidden rounded-[var(--radius-lg)]"
      style={{ touchAction: "none" }}
      role="application"
      aria-label={S.canvasAriaLabel}
    >
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  );
}

// ── 그리기 헬퍼 ───────────────────────────────────────────────────────────

function cullNodes(
  nodes: NodeLayout[],
  vp: Viewport,
  viewW: number,
  viewH: number,
): NodeLayout[] {
  const margin = 80;
  const visible: NodeLayout[] = [];
  for (const nl of nodes) {
    const s = vp.worldToScreen(nl.x, nl.y);
    if (s.x >= -margin && s.x <= viewW + margin && s.y >= -margin && s.y <= viewH + margin) {
      visible.push(nl);
    }
  }
  if (visible.length <= MAX_NODES_PER_VIEW) return visible;
  // 초과 시 화면 중앙 가까운 노드 우선(프레임 보장).
  const cx = viewW / 2;
  const cy = viewH / 2;
  return visible
    .map((nl) => {
      const s = vp.worldToScreen(nl.x, nl.y);
      return { nl, d: (s.x - cx) ** 2 + (s.y - cy) ** 2 };
    })
    .sort((a, b) => a.d - b.d)
    .slice(0, MAX_NODES_PER_VIEW)
    .map((x) => x.nl);
}

function drawBrainSilhouette(ctx: CanvasRenderingContext2D, vp: Viewport, pal: JourneyPalette) {
  const c = vp.worldToScreen(CENTER.x, CENTER.y);
  const rx = BRAIN_RX * vp.scale * 1.15;
  const ry = BRAIN_RY * vp.scale * 1.2;
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(c.x, c.y, rx, ry, 0, 0, Math.PI * 2);
  ctx.strokeStyle = rgba(pal.outline, 0.18);
  ctx.lineWidth = 1.5;
  ctx.stroke();
  // 중앙 분리선(좌우 반구 암시)
  ctx.beginPath();
  ctx.moveTo(c.x, c.y - ry);
  ctx.lineTo(c.x, c.y + ry);
  ctx.strokeStyle = rgba(pal.outline, 0.1);
  ctx.stroke();
  ctx.restore();
}

function drawGlow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  mastery: number,
  di: DimInfo,
  pal: JourneyPalette,
  phase: number,
  seed: number,
) {
  // dimming 노드는 부드러운 펄스(급격한 on/off 금지).
  const pulse = di.isDimming ? 0.5 + 0.5 * Math.sin(phase * 2 + (seed % 100) / 16) : 1;
  const baseAlpha = (0.28 + mastery * 0.55) * (di.isDimming ? 0.55 + 0.45 * pulse : 1);
  const glowR = r * (di.isDimming ? 2.2 + 0.4 * pulse : 2.4);
  const bodyColor = di.isDimming ? di.riskTint : litColor(pal, mastery);

  const g = ctx.createRadialGradient(x, y, 0, x, y, glowR);
  g.addColorStop(0, rgba(pal.glowCore, baseAlpha));
  g.addColorStop(0.35, rgba(bodyColor, baseAlpha * 0.8));
  g.addColorStop(1, rgba(bodyColor, 0));
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, glowR, 0, Math.PI * 2);
  ctx.fill();

  // 코어
  ctx.fillStyle = rgba(pal.glowCore, Math.min(1, baseAlpha + 0.2));
  ctx.beginPath();
  ctx.arc(x, y, Math.max(1.5, r * 0.42), 0, Math.PI * 2);
  ctx.fill();
}

function drawRegionLobe(
  ctx: CanvasRenderingContext2D,
  vp: Viewport,
  pal: JourneyPalette,
  rl: RegionLayout,
  phase: number,
  _viewW: number,
  _viewH: number,
) {
  const s = vp.worldToScreen(rl.x, rl.y);
  const r = rl.radius * vp.scale;
  const di: DimInfo =
    rl.region.dimming_count > 0
      ? { isDimming: true, riskTint: rl.region.risk_score >= 2.5 ? pal.dimHigh : pal.dimMid }
      : { isDimming: false, riskTint: pal.litHigh };
  drawGlow(ctx, s.x, s.y, r, rl.region.mastery_avg, di, pal, phase, hashStr(rl.region.region_code));
}

function drawLabel(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  pal: JourneyPalette,
  size: number,
  bold: boolean,
) {
  if (!text) return;
  ctx.font = `${bold ? "700" : "500"} ${size}px Pretendard, system-ui, sans-serif`;
  ctx.lineWidth = 3;
  ctx.strokeStyle = rgba(pal.bgEdge, 0.85);
  ctx.strokeText(text, x, y);
  ctx.fillStyle = pal.label;
  ctx.fillText(text, x, y);
}

function drawUnitLabels(
  ctx: CanvasRenderingContext2D,
  vp: Viewport,
  pal: JourneyPalette,
  nodes: NodeLayout[],
  viewW: number,
  viewH: number,
) {
  // unit별 노드 중심(평균) 산출 → 라벨 1개.
  const groups = new Map<string, { x: number; y: number; n: number }>();
  for (const nl of nodes) {
    const key = nl.node.unit_name ?? "";
    if (!key) continue;
    const g = groups.get(key) ?? { x: 0, y: 0, n: 0 };
    g.x += nl.x;
    g.y += nl.y;
    g.n += 1;
    groups.set(key, g);
  }
  for (const [name, g] of groups) {
    const s = vp.worldToScreen(g.x / g.n, g.y / g.n);
    if (s.x < -40 || s.x > viewW + 40 || s.y < -40 || s.y > viewH + 40) continue;
    drawLabel(ctx, name, s.x, s.y, pal, 12, false);
  }
}

function drawTooltip(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  text: string,
  pal: JourneyPalette,
) {
  ctx.font = `600 13px Pretendard, system-ui, sans-serif`;
  const padX = 10;
  const w = ctx.measureText(text).width + padX * 2;
  const h = 26;
  const bx = x - w / 2;
  const by = y - 18 - h;
  ctx.fillStyle = rgba(pal.glowCore, 0.96);
  roundRect(ctx, bx, by, w, h, 8);
  ctx.fill();
  ctx.fillStyle = pal.bgEdge;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, x, by + h / 2);
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
