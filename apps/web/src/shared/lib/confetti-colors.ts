/**
 * 브랜드 축하 연출(canvas-confetti) 색 — 토큰 SSoT(tokens.css)에서 런타임 해석.
 *
 * canvas-confetti는 canvas에 직접 그리므로 CSS 변수(`var(--x)`)를 받지 못하고
 * 리터럴 색 문자열을 요구한다. 과거엔 그래서 hex를 컴포넌트에 직접 박았고(SOO-56 G1),
 * 팔레트 교체 시 토큰과 어긋나는 drift가 발생했다.
 *
 * 이 브릿지는 `getComputedStyle`로 토큰 값을 읽어 hex를 반환한다 →
 * tokens.css 한 곳만 바꾸면 confetti 색도 자동 정합(drift 차단).
 * 클라이언트(useEffect)에서만 호출한다. SSR이거나 토큰 중 하나라도 해석 실패 시
 * undefined를 반환해 canvas-confetti가 자체 기본 색으로 폴백하도록 둔다
 * (부분 배열을 반환하면 브랜드 팔레트가 일부만 적용되므로 all-or-nothing).
 */
const CONFETTI_TOKEN_VARS = [
  "--color-mint-700", // teal-strong
  "--color-xp", // reward gold
  "--color-mint-500", // teal-mid
] as const;

export function getConfettiColors(): string[] | undefined {
  if (typeof window === "undefined") return undefined;
  const styles = getComputedStyle(document.documentElement);
  const colors = CONFETTI_TOKEN_VARS.map((v) => styles.getPropertyValue(v).trim());
  return colors.every(Boolean) ? colors : undefined;
}
