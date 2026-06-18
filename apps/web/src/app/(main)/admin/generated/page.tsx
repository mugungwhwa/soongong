import { redirect } from "next/navigation";
import { AdminGeneratedPage } from "@/views/admin-generated";
import { requireAdmin } from "@/shared/lib/admin/auth";
import { createClient } from "@/shared/lib/supabase/server";
import { env } from "@/shared/config/env";
import {
  MOCK_GENERATED_PROBLEMS,
  type DifficultyLevelCode,
  type DifficultyMode,
  type GeneratedProblemReviewItem,
} from "@/entities/generated-problem";

export const dynamic = "force-dynamic";

// 0023 generated_problems → 0015 parsed_learning_objects (source_object_id) 1:1 조인.
type SourceRow = {
  extracted_text: string | null;
  detected_wrong_reason: string | null;
  student_note: string | null;
};

type GeneratedProblemRow = {
  problem_id: string;
  subject: string;
  unit: string | null;
  topic: string;
  difficulty_level: DifficultyLevelCode;
  difficulty_mode: DifficultyMode;
  stem: string;
  choices: string[] | null;
  answer: string;
  explanation: string;
  targets_wrong_reason: string[];
  created_at: string;
  // PostgREST 임베드는 to-one 관계도 객체/배열로 올 수 있어 둘 다 수용.
  source: SourceRow | SourceRow[] | null;
};

function mapRow(row: GeneratedProblemRow): GeneratedProblemReviewItem {
  const src = Array.isArray(row.source) ? (row.source[0] ?? null) : row.source;
  return {
    problemId: row.problem_id,
    subject: row.subject,
    unit: row.unit,
    topic: row.topic,
    difficultyLevel: row.difficulty_level,
    difficultyMode: row.difficulty_mode,
    stem: row.stem,
    choices: row.choices,
    answer: row.answer,
    explanation: row.explanation,
    targetsWrongReason: row.targets_wrong_reason ?? [],
    source: src
      ? {
          extractedText: src.extracted_text,
          detectedWrongReason: src.detected_wrong_reason,
          studentNote: src.student_note,
        }
      : null,
    createdAt: row.created_at,
  };
}

async function loadItems(): Promise<{
  items: GeneratedProblemReviewItem[];
  usingMock: boolean;
}> {
  // MOCK_MODE(기본 true): 라이브 조회 생략하고 샘플로 화면을 보장.
  if (env.NEXT_PUBLIC_MOCK_MODE) {
    return { items: MOCK_GENERATED_PROBLEMS, usingMock: true };
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("generated_problems")
      .select(
        `problem_id, subject, unit, topic, difficulty_level, difficulty_mode,
         stem, choices, answer, explanation, targets_wrong_reason, created_at,
         source:parsed_learning_objects!source_object_id (
           extracted_text, detected_wrong_reason, student_note
         )`,
      )
      .order("created_at", { ascending: false })
      .limit(50);

    if (error || !data || data.length === 0) {
      // 라이브 0건이면 빈 상태(듀공 카피)를 보여준다 — 샘플로 가리지 않음.
      return { items: [], usingMock: false };
    }
    return {
      items: (data as unknown as GeneratedProblemRow[]).map(mapRow),
      usingMock: false,
    };
  } catch {
    return { items: [], usingMock: false };
  }
}

export default async function Page() {
  try {
    await requireAdmin();
  } catch {
    redirect("/");
  }
  const { items, usingMock } = await loadItems();
  return <AdminGeneratedPage items={items} usingMock={usingMock} />;
}
