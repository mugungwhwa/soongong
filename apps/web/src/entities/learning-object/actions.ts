"use server";

import { createServiceClient } from "@/shared/lib/supabase/service";

/**
 * 사용자 확정 과목을 학습객체에 반영한다.
 * confirm API route에서 호출 — service client로 RLS 없이 직접 업데이트.
 * userId 매개변수로 행 소유권 검증 보장.
 */
export async function updateLearningObjectSubject(
  objectId: string,
  userId: string,
  subject: string,
): Promise<boolean> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("parsed_learning_objects")
    .update({ subject })
    .eq("object_id", objectId)
    .eq("user_id", userId)
    .select("object_id")
    .maybeSingle();
  if (error) {
    console.error("[learning-object/actions] updateLearningObjectSubject:", error.message);
    return false;
  }
  return data !== null;
}
