// deno-lint-ignore-file
import { getAdminClient } from "../_shared/supabase.ts";
import { withCors } from "../_shared/cors.ts";

const TEMPORARY_RETENTION_DAYS = 30;
const DERIVED_ONLY_RETENTION_DAYS = 7;

Deno.serve(withCors(async (req: Request) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  const supabase = getAdminClient();
  const now = Date.now();
  const tempCutoff = new Date(now - TEMPORARY_RETENTION_DAYS * 86400_000).toISOString();
  const derivedCutoff = new Date(now - DERIVED_ONLY_RETENTION_DAYS * 86400_000).toISOString();

  const { data: tempExpired } = await supabase
    .from("external_sources")
    .select("source_id, raw_url, storage_policy")
    .eq("storage_policy", "temporary")
    .not("raw_url", "is", null)
    .lt("created_at", tempCutoff);

  const { data: derivedExpired } = await supabase
    .from("external_sources")
    .select("source_id, raw_url, storage_policy")
    .eq("storage_policy", "derived_only")
    .not("raw_url", "is", null)
    .lt("created_at", derivedCutoff);

  const expired = [...(tempExpired ?? []), ...(derivedExpired ?? [])];
  if (expired.length === 0) {
    return Response.json({ deleted: 0, failed: 0, total: 0 });
  }

  let deleted = 0;
  let failed = 0;

  for (const row of expired) {
    try {
      if (row.raw_url) {
        await supabase.storage.from("uploads").remove([row.raw_url]);
      }
      await supabase
        .from("external_sources")
        .update({ raw_url: null })
        .eq("source_id", row.source_id);
      deleted++;
    } catch (e) {
      console.error(`failed source_id=${row.source_id}`, e);
      failed++;
    }
  }

  return Response.json({ deleted, failed, total: expired.length });
}));
