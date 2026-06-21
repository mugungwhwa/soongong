"use client";
import { StatCard } from "./stat-card";
import { useGameState } from "@/entities/user-game-state";
import { Flame, Brain, Clock, Zap, Trophy } from "lucide-react";

export function StatsGrid() {
  const s = useGameState();
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      <StatCard Icon={Flame} label="스트릭" value={s.streakDays} suffix="일" />
      <StatCard Icon={Brain} label="기억 HP" value={s.memoryHp} suffix="/5" />
      <StatCard Icon={Clock} label="오늘 학습" value={s.todayMinutes} suffix="분" />
      <StatCard Icon={Zap} label="오늘 XP" value={s.todayXp} suffix="XP" />
      <StatCard Icon={Trophy} label="등급" value={s.rank} />
    </div>
  );
}
