import { createClient } from "@/shared/lib/supabase/client";
import type { Source, SourceType } from "./model";

export async function createSource(payload: {
  source_type: SourceType;
  raw_url?: string;
  raw_text?: string;
  storage_policy?: "temporary" | "derived_only";
  metadata?: Record<string, unknown>;
}): Promise<Source | null> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("external_sources")
    .insert({
      user_id: user.id,
      source_type: payload.source_type,
      raw_url: payload.raw_url ?? null,
      raw_text: payload.raw_text ?? null,
      storage_policy: payload.storage_policy ?? "temporary",
      license_status: "user_private",
      metadata: payload.metadata ?? {},
    })
    .select()
    .single();

  return (data as Source) ?? null;
}

export async function runIntakePipeline(sourceId: string): Promise<void> {
  const supabase = createClient();
  await supabase.functions.invoke("compliance-gate", {
    body: { source_id: sourceId },
  });
}

export async function uploadSourceFile(
  userId: string,
  file: File
): Promise<string | null> {
  const supabase = createClient();
  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${userId}/${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage
    .from("uploads")
    .upload(path, file, { contentType: file.type, upsert: false });

  if (error) {
    console.error("upload error", error);
    return null;
  }
  return path;
}
