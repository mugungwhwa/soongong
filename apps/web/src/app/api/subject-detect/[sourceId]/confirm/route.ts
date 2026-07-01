import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/shared/lib/supabase/server";
import { createServiceClient } from "@/shared/lib/supabase/service";
import type { SubjectLabel } from "@/entities/subject-routing";

const VALID_SUBJECTS: SubjectLabel[] = ["수학", "영어", "국어", "과학", "사회", "기타"];

/**
 * PATCH /api/subject-detect/[sourceId]/confirm
 * Body: { subject: SubjectLabel }
 *
 * 1) subject_routing_results: user_corrected_subject + final_subject 업데이트
 * 2) parsed_learning_objects: subject 업데이트 (source_id 매칭)
 */
export async function PATCH(
  req: NextRequest,
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

  let body: { subject?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청 본문" }, { status: 400 });
  }

  const subject = body.subject as string | undefined;
  if (!subject || !VALID_SUBJECTS.includes(subject as SubjectLabel)) {
    return NextResponse.json(
      { error: `subject는 ${VALID_SUBJECTS.join(" | ")} 중 하나여야 합니다` },
      { status: 400 },
    );
  }

  const service = createServiceClient();

  // 1) subject_routing_results 업데이트
  const { data: routing, error: routingErr } = await service
    .from("subject_routing_results")
    .update({ user_corrected_subject: subject, final_subject: subject })
    .eq("source_id", sourceId)
    .eq("user_id", user.id)
    .select("routing_id")
    .maybeSingle();

  if (routingErr) {
    console.error("[subject-detect/confirm] routing update:", routingErr.message);
    return NextResponse.json({ error: "라우팅 결과 업데이트 실패" }, { status: 500 });
  }
  if (!routing) {
    return NextResponse.json({ error: "해당 소스를 찾을 수 없습니다" }, { status: 404 });
  }

  // 2) parsed_learning_objects.subject 업데이트 (source_id 매칭)
  const { error: objErr } = await service
    .from("parsed_learning_objects")
    .update({ subject })
    .eq("source_id", sourceId)
    .eq("user_id", user.id);

  if (objErr) {
    console.error("[subject-detect/confirm] object update:", objErr.message);
    // 학습객체 업데이트 실패는 경고만 — 라우팅은 이미 저장됨
  }

  return NextResponse.json({ ok: true, routingId: routing.routing_id, subject });
}
