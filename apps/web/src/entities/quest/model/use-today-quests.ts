"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/shared/lib/supabase/client";
import { getTodayQuestsFromDb } from "../api";
import type { Quest, QuestFormat, QuestRiskLevel, Subject } from "@/shared/contracts";
import type { Quest as DbQuest, QuestFormat as DbQuestFormat } from "../model";

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

// P3 미연결 — object_id join 후 subject/unit/topic 실값으로 교체
function mapToContractQuest(db: DbQuest): Quest {
  return {
    questId: db.quest_id,
    objectId: db.object_id,
    subject: "수학" as Subject,
    unit: "—",
    topic: "회독 문제",
    questFormat: mapFormat(db.quest_format),
    riskLevel: "mid" as QuestRiskLevel,
    forgettingRisk: 50,
    rewardXp: db.reward_xp,
    dueDate: db.due_date,
  };
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
        const rows = await getTodayQuestsFromDb(user.id);
        setQuests(rows.map(mapToContractQuest));
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
