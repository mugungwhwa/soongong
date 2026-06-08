import { createClient } from "@/shared/lib/supabase/client";
import type { RecordSolveEventInput, SolveEvent } from "./model";

/**
 * 풀이 캔버스 산출물(stroke JSON + 선택적 PNG)을 solutions 버킷에 업로드.
 * 경로: solutions/<user_id>/<quest_id>.{json,png}
 * 인증/스토리지 실패는 graceful-degrade — 가능한 경로만 반환.
 */
export async function uploadSolution(
  questId: string,
  strokeJSON: unknown,
  pngBlob?: Blob | null,
): Promise<{ stroke_url?: string; solution_image_url?: string }> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return {};

  const result: { stroke_url?: string; solution_image_url?: string } = {};

  const jsonPath = `${user.id}/${questId}.json`;
  const { error: jsonErr } = await supabase.storage
    .from("solutions")
    .upload(
      jsonPath,
      new Blob([JSON.stringify(strokeJSON)], { type: "application/json" }),
      { upsert: true, contentType: "application/json" },
    );
  if (!jsonErr) result.stroke_url = jsonPath;

  if (pngBlob) {
    const pngPath = `${user.id}/${questId}.png`;
    const { error: pngErr } = await supabase.storage
      .from("solutions")
      .upload(pngPath, pngBlob, { upsert: true, contentType: "image/png" });
    if (!pngErr) result.solution_image_url = pngPath;
  }

  return result;
}

/**
 * 풀이 이벤트 1건 기록. 비로그인/미연결 시 null 반환(데모 흐름 보존).
 */
export async function recordSolveEvent(
  input: RecordSolveEventInput,
): Promise<SolveEvent | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("solve_events")
    .insert({
      user_id: user.id,
      attempt_number: 1,
      ...input,
    })
    .select()
    .single();

  if (error) {
    console.error("[solve-event/api] recordSolveEvent error:", error.message);
    return null;
  }
  return data as SolveEvent;
}
