"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/shared/lib/supabase/client";
import type { Subject } from "@/shared/contracts";

export interface ForgettingItem {
  subject: Subject;
  /** 표시용 개념 라벨(단원·유형 결합). */
  topic: string;
  /** 0–100 망각 위험 점수. */
  risk: number;
}

function riskToScore(risk: string): number {
  if (risk === "high") return 80;
  if (risk === "medium") return 50;
  return 20;
}

export function useForgettingTop(): ForgettingItem[] {
  const [items, setItems] = useState<ForgettingItem[]>([]);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("student_memory_items")
        .select(
          "memory_id, forgetting_risk, concept_key, parsed_learning_objects(subject, topic, unit)",
        )
        .eq("user_id", user.id)
        .in("forgetting_risk", ["high", "medium"])
        .order("updated_at", { ascending: true })
        .limit(20);

      if (error) {
        console.error("[useForgettingTop]", error.message);
        return;
      }
      if (!data?.length) return;

      type SmiRow = {
        memory_id: string;
        forgetting_risk: string;
        concept_key: string;
        parsed_learning_objects: {
          subject: string;
          topic: string | null;
          unit: string | null;
        } | null;
      };
      setItems(
        (data as unknown as SmiRow[])
          .sort((a, b) => riskToScore(b.forgetting_risk) - riskToScore(a.forgetting_risk))
          .slice(0, 3)
          .map((row) => {
            const plo = row.parsed_learning_objects;
            const topic =
              plo?.topic ?? plo?.unit ?? row.concept_key ?? "회독 개념";
            return {
              subject: (plo?.subject ?? "수학") as Subject,
              topic,
              risk: riskToScore(row.forgetting_risk),
            };
          }),
      );
    };
    load();
  }, []);

  return items;
}
