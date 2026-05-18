"use client";
import { useEffect, useState } from "react";

export function XpCounter({
  from = 0,
  to,
  duration = 1200,
}: {
  from?: number;
  to: number;
  duration?: number;
}) {
  const [v, setV] = useState(from);
  useEffect(() => {
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setV(Math.round(from + (to - from) * eased));
      if (p < 1) requestAnimationFrame(tick);
    };
    const id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [from, to, duration]);
  return <span>{v}</span>;
}
