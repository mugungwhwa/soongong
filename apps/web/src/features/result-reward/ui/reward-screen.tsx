"use client";
import { useEffect, useRef } from "react";
import { motion, useMotionValue, animate } from "framer-motion";
import confetti from "canvas-confetti";
import { PartyPopper, Flame, Heart } from "lucide-react";
import { Card } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Mascot } from "@/shared/ui/mascot";
import { getConfettiColors } from "@/shared/lib/confetti-colors";

type Props = {
  xpDelta: number;
  streak: number;
  hpAfter: number;
  message: string;
  onNext: () => void;
  onHome: () => void;
};

export function RewardScreen({ xpDelta, streak, hpAfter, message, onNext, onHome }: Props) {
  const xpMv = useMotionValue(0);
  const xpDisplayRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.4 },
      colors: getConfettiColors(),
    });
    const controls = animate(xpMv, xpDelta, {
      duration: 0.8,
      ease: "easeOut",
      onUpdate: (v) => {
        if (xpDisplayRef.current) xpDisplayRef.current.textContent = Math.floor(v).toString();
      },
    });
    return () => controls.stop();
  }, [xpDelta, xpMv]);

  return (
    <main className="min-h-dvh flex items-center justify-center p-xl bg-bg">
      <Card className="w-full max-w-sm text-center p-xl space-y-lg">
        <motion.h1
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="text-display flex items-center justify-center gap-2"
        >
          <PartyPopper size={36} strokeWidth={1.5} style={{ color: "var(--color-mint-700)" }} />
          회독퀘스트 성공!
        </motion.h1>

        <div className="space-y-md">
          <div className="text-h2 text-primary">
            +<span ref={xpDisplayRef}>0</span> XP
          </div>
          <div className="text-body text-text-secondary flex items-center justify-center gap-1">
            <Flame size={16} strokeWidth={1.5} style={{ color: "var(--color-mint-700)" }} />
            {streak}일 스트릭
            <span className="mx-1">·</span>
            <Heart size={16} strokeWidth={1.5} style={{ color: "var(--color-mint-700)" }} />
            {hpAfter}/5
          </div>
        </div>

        <div className="flex justify-center">
          <Mascot mood="celebrate" size="xl" />
        </div>

        <p className="text-body text-text-primary">{message}</p>

        <div className="flex gap-sm">
          <Button variant="outline" onClick={onHome} className="flex-1">
            홈으로
          </Button>
          <Button onClick={onNext} className="flex-1">
            다음 회독퀘스트
          </Button>
        </div>
      </Card>
    </main>
  );
}
