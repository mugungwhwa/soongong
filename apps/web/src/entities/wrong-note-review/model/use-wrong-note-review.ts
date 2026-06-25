"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/shared/lib/supabase/client";
import type { Subject, QuestRiskLevel } from "@/shared/contracts";

export interface WrongReviewItem {
  id: string;
  subject: Subject;
  unit: string;
  concept: string;
  memoryHp: 0 | 1 | 2 | 3 | 4 | 5;
  riskLevel: QuestRiskLevel;
  dday: string;
  missReason: string;
  objectId: string;
}

export interface WrongReviewSummary {
  reviewCount: number;
  estimatedMinutes: number;
  scheduleLabel: string;
}

export interface WrongNoteReview {
  items: WrongReviewItem[];
  summary: WrongReviewSummary;
}

type QuestRow = {
  quest_id: string;
  object_id: string;
  memory_id: string | null;
  due_date: string;
};
type PloRow = {
  object_id: string;
  subject: string;
  unit: string | null;
  topic: string | null;
  detected_wrong_reason: string | null;
};
type SmiRow = {
  memory_id: string;
  forgetting_risk: string | null;
  mastery_score: number | null;
};

function localTodayStr(): string {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

function parseDateOnly(s: string): Date {
  const [y, mo, d] = s.split("-").map(Number);
  return new Date(y ?? 1970, (mo ?? 1) - 1, d ?? 1);
}

function ddayLabel(dueDate: string | null): string {
  if (!dueDate) return "D-0";
  const today = parseDateOnly(localTodayStr());
  const due = parseDateOnly(dueDate);
  const days = Math.round((due.getTime() - today.getTime()) / 86400_000);
  if (days === 0) return "D-0";
  return days > 0 ? `D-${days}` : `D+${-days}`;
}

function masteryToHp(mastery: number | null): 0 | 1 | 2 | 3 | 4 | 5 {
  const v = Math.round((mastery ?? 0) * 5);
  return Math.max(0, Math.min(5, v)) as 0 | 1 | 2 | 3 | 4 | 5;
}

function riskToLevel(risk: string | null | undefined): QuestRiskLevel {
  if (risk === "high") return "high";
  if (risk === "medium") return "mid";
  return "low";
}

const RISK_ORDER: Record<QuestRiskLevel, number> = { high: 0, mid: 1, low: 2 };

/**
 * wrong_recovery 퀘스트 목록을 실데이터로 조회.
 * mock 미사용 — 미로그인/빈 큐는 빈 배열로 처리.
 * 반환 인터페이스 유지 → wrong-notes-page 무수정.
 */
export function useWrongNoteReview(): WrongNoteReview {
  const [items, setItems] = useState<WrongReviewItem[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        const { data: rawQuests } = await supabase
          .from("review_quests")
          .select("quest_id, object_id, memory_id, due_date")
          .eq("user_id", user.id)
          .eq("quest_mode", "wrong_recovery")
          .in("status", ["pending", "in_progress"])
          .order("created_at", { ascending: true })
          .limit(20);

        const quests = (rawQuests ?? []) as QuestRow[];
        if (quests.length === 0) return;

        const objectIds = [...new Set(quests.map((q) => q.object_id))];
        const memoryIds = quests
          .map((q) => q.memory_id)
          .filter((id): id is string => id !== null);

        const [ploResult, smiResult] = await Promise.all([
          supabase
            .from("parsed_learning_objects")
            .select("object_id, subject, unit, topic, detected_wrong_reason")
            .in("object_id", objectIds),
          memoryIds.length
            ? supabase
                .from("student_memory_items")
                .select("memory_id, forgetting_risk, mastery_score")
                .in("memory_id", memoryIds)
            : Promise.resolve({ data: [] as SmiRow[], error: null }),
        ]);

        const ploMap = new Map<string, PloRow>(
          ((ploResult.data ?? []) as PloRow[]).map((p) => [p.object_id, p]),
        );
        const smiMap = new Map<string, SmiRow>(
          ((smiResult.data ?? []) as SmiRow[]).map((m) => [m.memory_id, m]),
        );

        const mapped: WrongReviewItem[] = quests.map((q) => {
          const plo = ploMap.get(q.object_id);
          const smi = q.memory_id ? smiMap.get(q.memory_id) : undefined;
          const riskLevel = riskToLevel(smi?.forgetting_risk);
          return {
            id: q.quest_id,
            subject: (plo?.subject ?? "수학") as Subject,
            unit:
              [plo?.subject, plo?.unit].filter(Boolean).join(" · ") || "—",
            concept: plo?.topic ?? "오답 회수",
            memoryHp: masteryToHp(smi?.mastery_score ?? null),
            riskLevel,
            dday: ddayLabel(q.due_date),
            missReason:
              plo?.detected_wrong_reason ?? "약점 개념을 다시 확인해요",
            objectId: q.object_id,
          };
        });

        mapped.sort(
          (a, b) =>
            (RISK_ORDER[a.riskLevel] ?? 3) - (RISK_ORDER[b.riskLevel] ?? 3),
        );
        setItems(mapped);
      } catch {
        // 실패 시 빈 목록 유지
      }
    }
    void load();
  }, []);

  const reviewCount = items.length;
  const estimatedMinutes = Math.max(2, reviewCount * 2);
  const scheduleLabel = items[0]?.dday ?? "—";

  return {
    items,
    summary: { reviewCount, estimatedMinutes, scheduleLabel },
  };
}
