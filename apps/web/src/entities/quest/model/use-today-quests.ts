"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/shared/lib/supabase/client";
import { getTodayQuestsEnriched } from "../api";
import type { Quest, QuestFormat, QuestRiskLevel, Subject } from "@/shared/contracts";
import type { QuestFormat as DbQuestFormat } from "../model";

const VARIATION_FORMATS = new Set<DbQuestFormat>([
  "number_variation",
  "target_change",
  "representation",
  "condition",
  "combo",
]);

function mapFormat(dbFormat: DbQuestFormat): QuestFormat {
  return VARIATION_FORMATS.has(dbFormat) ? "변형" : "회독";
}

function mapRiskLevel(risk: "low" | "medium" | "high"): QuestRiskLevel {
  return risk === "medium" ? "mid" : risk;
}

function mapForgettingRisk(risk: "low" | "medium" | "high"): number {
  return risk === "low" ? 20 : risk === "medium" ? 50 : 80;
}

export function useTodayQuests(): {
  quests: Quest[];
  loading: boolean;
  error: string | null;
} {
  const [quests, setQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;
        const rows = await getTodayQuestsEnriched(user.id);
        setQuests(
          rows.map(({ quest, subject, unit, topic, forgetting_risk }) => ({
            questId: quest.quest_id,
            objectId: quest.object_id,
            subject: subject as Subject,
            unit,
            topic,
            questFormat: mapFormat(quest.quest_format),
            riskLevel: mapRiskLevel(forgetting_risk),
            forgettingRisk: mapForgettingRisk(forgetting_risk),
            rewardXp: quest.reward_xp,
            dueDate: quest.due_date,
          })),
        );
      } catch (e) {
        setError(e instanceof Error ? e.message : "퀘스트를 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return { quests, loading, error };
}
