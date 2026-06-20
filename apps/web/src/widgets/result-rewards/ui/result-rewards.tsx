"use client";
import { motion } from "framer-motion";
import { Trophy, Flame, Heart } from "lucide-react";
import { Card } from "@/shared/ui/card";
import { MascotReaction } from "@/shared/ui/mascot-reaction";
import { XpCounter } from "./xp-counter";
import { useGameState } from "@/entities/user-game-state";
import { resultToMood } from "@/entities/game/lib/mascot-mood";

export function ResultRewards({ earnedXp = 60 }: { earnedXp?: number }) {
  const s = useGameState();
  const { mood, reason } = resultToMood(true, s.streakDays);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="p-8 text-center space-y-6 shadow-[var(--shadow-elevated)]">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
        >
          <MascotReaction mood={mood} size="xl" reason={reason} className="mx-auto" />
        </motion.div>
        <div>
          <div className="text-3xl font-bold text-[var(--color-text-on-warm)] inline-block bg-[var(--color-xp)] px-4 py-1 rounded-[var(--radius-pill)]">
            +<XpCounter to={earnedXp} /> XP
          </div>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">
            오늘 회독 완료!
          </p>
        </div>
        <div className="grid grid-cols-3 gap-3 text-sm">
          <div>
            <div className="flex justify-center">
              <Flame size={28} strokeWidth={1.5} style={{ color: "var(--color-mint-700)" }} />
            </div>
            <div className="font-semibold">{s.streakDays}일</div>
            <div className="text-[var(--color-text-muted)]">스트릭</div>
          </div>
          <div>
            <div className="flex justify-center">
              <Heart size={28} strokeWidth={1.5} style={{ color: "var(--color-mint-700)" }} />
            </div>
            <div className="font-semibold">{s.memoryHp}/5</div>
            <div className="text-[var(--color-text-muted)]">기억 HP</div>
          </div>
          <div>
            <div className="flex justify-center">
              <Trophy size={28} strokeWidth={1.5} style={{ color: "var(--color-mint-700)" }} />
            </div>
            <div className="font-semibold">{s.rank}</div>
            <div className="text-[var(--color-text-muted)]">등급</div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
