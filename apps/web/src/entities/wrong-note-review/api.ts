import { createClient } from "@/shared/lib/supabase/client";

export interface RecoveryVariantItem {
  tier: "V1" | "V2" | "V3";
  description: string;
  stem: string;
  answer: string;
  explanation: string;
  formulaFormat: "latex" | "plaintext";
}

export interface RecoverySession {
  questId: string | null;
  objectId: string;
  subject: string;
  topic: string;
  variants: RecoveryVariantItem[];
}

const MODE_TO_TIER: Record<string, "V1" | "V2" | "V3"> = {
  rebuild: "V1",
  maintain: "V2",
  stretch: "V3",
};

const MODE_LABELS: Record<string, string> = {
  rebuild: "기초 다지기 — 약점 개념 단계별 복습",
  maintain: "동급 변형 — 같은 약점 다른 맥락에서",
  stretch: "한 단 도전 — 약점 응용·결합 상황에서",
};

type GpRow = {
  difficulty_mode: string;
  stem: string;
  answer: string;
  explanation: string;
};

function mapGpRows(rows: GpRow[]): RecoveryVariantItem[] {
  return rows.map((g) => {
    const mode = g.difficulty_mode as "rebuild" | "maintain" | "stretch";
    return {
      tier: MODE_TO_TIER[mode] ?? "V1",
      description: MODE_LABELS[mode] ?? "변형 문항",
      stem: g.stem,
      answer: g.answer,
      explanation: g.explanation,
      formulaFormat: "latex" as const,
    };
  });
}

/**
 * objectId에 대한 오답회수 세션 데이터를 실데이터로 조회.
 *
 * 조회 순서:
 *   1) generated_problems 조회 (이미지 업로드 경로에서 이미 생성됨)
 *   2) 없으면 generate-problem Edge Function 지연 트리거 (텍스트 입력 경로 보완)
 *   3) 여전히 없으면 원본 PLO extracted_text로 V1 폴백
 *
 * mock 미사용 — 미로그인/데이터 없음은 null로 빈 상태 반환.
 */
export async function fetchRecoverySession(
  objectId: string,
): Promise<RecoverySession | null> {
  const supabase = createClient();

  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser();
  if (authErr || !user) return null;

  // 병렬: 원본 PLO + pending wrong_recovery quest + generated_problems
  const [ploRes, questRes, gpRes] = await Promise.all([
    supabase
      .from("parsed_learning_objects")
      .select("subject, topic, extracted_text")
      .eq("object_id", objectId)
      .maybeSingle(),
    supabase
      .from("review_quests")
      .select("quest_id")
      .eq("user_id", user.id)
      .eq("object_id", objectId)
      .eq("quest_mode", "wrong_recovery")
      .in("status", ["pending", "in_progress"])
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("generated_problems")
      .select("difficulty_mode, stem, answer, explanation")
      .eq("source_object_id", objectId)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(3),
  ]);

  const plo = ploRes.data as {
    subject?: string;
    topic?: string | null;
    extracted_text?: string | null;
  } | null;
  const questId = questRes.data?.quest_id ?? null;
  let gpRows = (gpRes.data ?? []) as GpRow[];

  // generated_problems 없으면 generate-problem Edge Function 지연 트리거
  if (gpRows.length === 0) {
    try {
      const { data: generated } = await supabase.functions.invoke<
        GpRow & { problem_id: string }
      >("generate-problem", { body: { object_id: objectId } });
      if (generated?.stem && generated?.answer) {
        gpRows = [generated];
      }
    } catch {
      // generate-problem 실패 (텍스트 입력/compliance 미통과) → PLO 폴백
    }
  }

  let variants: RecoveryVariantItem[] = mapGpRows(gpRows);

  // 여전히 없으면 원본 PLO 텍스트로 V1 폴백
  if (variants.length === 0 && plo?.extracted_text) {
    variants = [
      {
        tier: "V1",
        description: "원본 복습 — 개념을 처음부터 다시 확인해요",
        stem: plo.extracted_text,
        answer: "스스로 개념을 되짚어 보세요",
        explanation: "원본 자료를 참고해 개념을 정리해요.",
        formulaFormat: "plaintext",
      },
    ];
  }

  if (variants.length === 0) return null;

  return {
    questId,
    objectId,
    subject: plo?.subject ?? "수학",
    topic: plo?.topic ?? "오답 회수",
    variants,
  };
}
