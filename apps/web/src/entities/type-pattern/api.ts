import { createClient } from "@/shared/lib/supabase/client";
import type { TypePatternCard } from "./model";

// embedding 컬럼 제외 — 클라이언트에서 vector fetch 불필요 (RAG는 Edge Function 담당)
const COLUMNS =
  "type_id,subject,unit,topic,type_name,stem_structure,cognitive_skill,common_mistakes,variation_axes,difficulty_factors,validation_rules,copyright_safety_rules,created_at,updated_at";

export async function getTypePatternCard(
  typeId: string,
): Promise<TypePatternCard | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("type_pattern_cards")
    .select(COLUMNS)
    .eq("type_id", typeId)
    .single();
  if (error || !data) return null;
  return data as TypePatternCard;
}

export async function getTypePatternsBySubject(
  subject: string,
): Promise<TypePatternCard[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("type_pattern_cards")
    .select(COLUMNS)
    .eq("subject", subject)
    .order("type_name");
  if (error) {
    console.error("[type-pattern/api] getTypePatternsBySubject:", error.message);
    return [];
  }
  return (data ?? []) as TypePatternCard[];
}
