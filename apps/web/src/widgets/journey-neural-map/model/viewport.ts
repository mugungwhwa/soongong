// 뷰포트 컨트롤러 — 줌/팬 + 관성(momentum) + 이징(easing).
// "굉장히 부드러움"(Mike 비타협): GPU 친화 transform 모델만 다루고,
// 실제 그리기는 캔버스 rAF 루프가 tick() 결과로 수행한다.
//
// 좌표: screen = world * scale + offset. (offset = tx,ty, 스크린 px)

export const ZOOM_MIN = 0.55;
export const ZOOM_MAX = 4.5;
/** 이 스케일 이상이면 near LOD(개별 노드) 진입. */
export const NEAR_THRESHOLD = 1.7;

export class Viewport {
  scale = 1;
  tx = 0;
  ty = 0;

  // 이징 타깃(탭-줌/auto-focus). animating 동안 현재값이 타깃으로 수렴.
  private targetScale = 1;
  private targetTx = 0;
  private targetTy = 0;
  private animating = false;

  // 관성(손 뗀 뒤 감속). 스크린 px/ms.
  private vx = 0;
  private vy = 0;

  clampScale(s: number): number {
    return Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, s));
  }

  worldToScreen(wx: number, wy: number): { x: number; y: number } {
    return { x: wx * this.scale + this.tx, y: wy * this.scale + this.ty };
  }

  screenToWorld(sx: number, sy: number): { x: number; y: number } {
    return { x: (sx - this.tx) / this.scale, y: (sy - this.ty) / this.scale };
  }

  /** 직접 팬(드래그 중). 이징/관성 취소. */
  panBy(dx: number, dy: number) {
    this.tx += dx;
    this.ty += dy;
    this.animating = false;
  }

  /** 커서/핀치 중심을 고정한 채 줌(연속). */
  zoomAt(sx: number, sy: number, factor: number) {
    const next = this.clampScale(this.scale * factor);
    if (next === this.scale) return;
    const wx = (sx - this.tx) / this.scale;
    const wy = (sy - this.ty) / this.scale;
    this.scale = next;
    this.tx = sx - wx * this.scale;
    this.ty = sy - wy * this.scale;
    this.animating = false;
  }

  /** 손 뗀 순간 속도 부여 → 관성 감속 시작. */
  fling(vx: number, vy: number) {
    this.vx = vx;
    this.vy = vy;
    this.animating = false;
  }

  stopMomentum() {
    this.vx = 0;
    this.vy = 0;
  }

  /** 월드 좌표를 화면 중앙(viewW/2,viewH/2)에 두도록 이징 애니메이션. auto-focus·탭드릴. */
  animateTo(scale: number, worldX: number, worldY: number, viewW: number, viewH: number) {
    this.targetScale = this.clampScale(scale);
    this.targetTx = viewW / 2 - worldX * this.targetScale;
    this.targetTy = viewH / 2 - worldY * this.targetScale;
    this.animating = true;
    this.stopMomentum();
  }

  /** 초기 배치(애니메이션 없이). */
  centerOn(scale: number, worldX: number, worldY: number, viewW: number, viewH: number) {
    this.scale = this.clampScale(scale);
    this.tx = viewW / 2 - worldX * this.scale;
    this.ty = viewH / 2 - worldY * this.scale;
    this.targetScale = this.scale;
    this.targetTx = this.tx;
    this.targetTy = this.ty;
    this.animating = false;
    this.stopMomentum();
  }

  get isAnimating(): boolean {
    return this.animating;
  }

  /** 프레임 갱신. dt=ms. 위치가 변했으면 true. */
  tick(dt: number, isDragging: boolean): boolean {
    let moved = false;

    if (this.animating) {
      // 시간 보정 lerp(프레임레이트 독립). k=수렴 속도.
      const k = 1 - Math.pow(0.0026, dt / 1000); // ~0.16 @16ms
      this.scale += (this.targetScale - this.scale) * k;
      this.tx += (this.targetTx - this.tx) * k;
      this.ty += (this.targetTy - this.ty) * k;
      const done =
        Math.abs(this.targetScale - this.scale) < 0.001 &&
        Math.abs(this.targetTx - this.tx) < 0.4 &&
        Math.abs(this.targetTy - this.ty) < 0.4;
      if (done) {
        this.scale = this.targetScale;
        this.tx = this.targetTx;
        this.ty = this.targetTy;
        this.animating = false;
      }
      moved = true;
    } else if (!isDragging && (Math.abs(this.vx) > 0.01 || Math.abs(this.vy) > 0.01)) {
      // 관성 감속(지수). dt 보정.
      const decay = Math.pow(0.93, dt / 16);
      this.tx += this.vx * dt;
      this.ty += this.vy * dt;
      this.vx *= decay;
      this.vy *= decay;
      if (Math.abs(this.vx) < 0.01 && Math.abs(this.vy) < 0.01) {
        this.vx = 0;
        this.vy = 0;
      }
      moved = true;
    }

    return moved;
  }
}
