"use client";
import { StatCard } from "./stat-card";
import { useGameState } from "@/entities/user-game-state";
import { Flame, Brain, Clock, Zap } from "lucide-react";

// 스탯 4박스(스트릭·기억HP·순공시간·XP) — design-review §2-2 잠긴 위계.
// 등급은 TierJourneyHero strip이 전담하므로 여기서 중복 노출하지 않는다 (SOO-121 de-dup).
export function StatsGrid() {
  const s = useGameState();
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <StatCard Icon={Flame} label="스트릭" value={s.streakDays} suffix="일" />
      <StatCard Icon={Brain} label="기억 HP" value={s.memoryHp} suffix="/5" />
      <StatCard Icon={Clock} label="오늘 학습" value={s.todayMinutes} suffix="분" />
      <StatCard Icon={Zap} label="오늘 XP" value={s.todayXp} suffix="XP" />
    </div>
  );
}
