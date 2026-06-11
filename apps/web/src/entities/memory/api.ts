import { createClient } from "@/shared/lib/supabase/client";
import type { StudentMemoryItem } from "./model";

export async function getMemoryItemsByIds(
  memoryIds: string[],
): Promise<StudentMemoryItem[]> {
  if (!memoryIds.length) return [];
  const supabase = createClient();
  const { data, error } = await supabase
    .from("student_memory_items")
    .select("*")
    .in("memory_id", memoryIds);
  if (error) {
    console.error("[memory/api] getMemoryItemsByIds:", error.message);
    return [];
  }
  return (data ?? []) as StudentMemoryItem[];
}

export async function getHighRiskMemoryItems(
  userId: string,
): Promise<StudentMemoryItem[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("student_memory_items")
    .select("*")
    .eq("user_id", userId)
    .eq("forgetting_risk", "high")
    .order("next_review_at", { ascending: true });
  if (error) {
    console.error("[memory/api] getHighRiskMemoryItems:", error.message);
    return [];
  }
  return (data ?? []) as StudentMemoryItem[];
}

export async function getMemoryByObjectId(
  userId: string,
  objectId: string,
): Promise<StudentMemoryItem | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("student_memory_items")
    .select("*")
    .eq("user_id", userId)
    .eq("object_id", objectId)
    .maybeSingle();
  if (error) {
    console.error("[memory/api] getMemoryByObjectId:", error.message);
    return null;
  }
  return (data as StudentMemoryItem) ?? null;
}
