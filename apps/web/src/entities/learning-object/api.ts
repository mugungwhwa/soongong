import { createClient } from "@/shared/lib/supabase/client";
import type { ParsedLearningObject } from "./model";

export async function getLearningObjectById(
  objectId: string,
): Promise<ParsedLearningObject | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("parsed_learning_objects")
    .select("*")
    .eq("object_id", objectId)
    .single();
  if (error || !data) return null;
  return data as ParsedLearningObject;
}

export async function getLearningObjectsByIds(
  objectIds: string[],
): Promise<ParsedLearningObject[]> {
  if (!objectIds.length) return [];
  const supabase = createClient();
  const { data, error } = await supabase
    .from("parsed_learning_objects")
    .select("*")
    .in("object_id", objectIds);
  if (error) {
    console.error("[learning-object/api] getLearningObjectsByIds:", error.message);
    return [];
  }
  return (data ?? []) as ParsedLearningObject[];
}

export async function getLearningObjectsByUser(
  userId: string,
): Promise<ParsedLearningObject[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("parsed_learning_objects")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) {
    console.error("[learning-object/api] getLearningObjectsByUser:", error.message);
    return [];
  }
  return (data ?? []) as ParsedLearningObject[];
}
