import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/shared/lib/supabase/server";

/** GET /api/subject-detect/[sourceId] — 소스에 대한 과목 판별 결과 조회 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ sourceId: string }> },
) {
  const { sourceId } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "인증 필요" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("subject_routing_results")
    .select("*")
    .eq("source_id", sourceId)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("[subject-detect/GET]", error.message);
    return NextResponse.json({ error: "조회 실패" }, { status: 500 });
  }

  return NextResponse.json({ data });
}
