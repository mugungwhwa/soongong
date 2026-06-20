import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/shared/lib/supabase/server";

export async function POST(req: NextRequest) {
  const { endpoint, p256dh, auth } = await req.json();
  if (!endpoint || !p256dh || !auth) {
    return NextResponse.json({ error: "필드 누락" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "인증 필요" }, { status: 401 });
  }

  const { error } = await supabase
    .from("push_subscriptions")
    .upsert(
      { user_id: user.id, endpoint, p256dh, auth },
      { onConflict: "endpoint" },
    );

  if (error) {
    console.error("[Push subscribe] DB 오류:", error.message);
    return NextResponse.json({ error: "저장 실패" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const { endpoint } = await req.json();
  if (!endpoint) {
    return NextResponse.json({ error: "endpoint 필요" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "인증 필요" }, { status: 401 });
  }

  await supabase
    .from("push_subscriptions")
    .delete()
    .eq("user_id", user.id)
    .eq("endpoint", endpoint);

  return NextResponse.json({ ok: true });
}
