import { createClient } from "@/shared/lib/supabase/client";
import type { SubjectRoutingResult } from "./model";

export async function getPendingConfirmations(
  userId: string,
): Promise<SubjectRoutingResult[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("subject_routing_results")
    .select("*")
    .eq("user_id", userId)
    .eq("needs_user_confirmation", true)
    .is("final_subject", null)
    .order("created_at", { ascending: false });
  if (error) {
    console.error("[subject-routing/api] getPendingConfirmations:", error.message);
    return [];
  }
  return (data ?? []) as SubjectRoutingResult[];
}

export async function confirmSubjectRouting(
  routingId: string,
  userId: string,
  correctedSubject: string,
): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase
    .from("subject_routing_results")
    .update({ user_corrected_subject: correctedSubject, final_subject: correctedSubject })
    .eq("routing_id", routingId)
    .eq("user_id", userId);
  if (error) {
    console.error("[subject-routing/api] confirmSubjectRouting:", error.message);
    return false;
  }
  return true;
}

export async function getRoutingResult(
  sourceId: string,
): Promise<SubjectRoutingResult | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("subject_routing_results")
    .select("*")
    .eq("source_id", sourceId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) {
    console.error("[subject-routing/api] getRoutingResult:", error.message);
    return null;
  }
  return (data as SubjectRoutingResult) ?? null;
}
