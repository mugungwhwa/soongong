import { NextRequest, NextResponse } from "next/server";
import webpush from "web-push";
import { createServiceClient } from "@/shared/lib/supabase/service";

function initVapid() {
  const pub = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const priv = process.env.VAPID_PRIVATE_KEY;
  if (!pub || !priv) {
    throw new Error("VAPID 키 미설정 — NEXT_PUBLIC_VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY 확인");
  }
  webpush.setVapidDetails(
    `mailto:${process.env.VAPID_CONTACT_EMAIL ?? "admin@soongong.app"}`,
    pub,
    priv,
  );
}

export async function POST(req: NextRequest) {
  try {
    initVapid();
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }

  const adminKey = req.headers.get("x-admin-key");
  if (adminKey !== process.env.PUSH_ADMIN_SECRET) {
    return NextResponse.json({ error: "권한 없음" }, { status: 403 });
  }

  const { userId, title, body, url } = await req.json();

  const supabase = createServiceClient();
  const query = supabase.from("push_subscriptions").select("endpoint, p256dh, auth");
  if (userId) query.eq("user_id", userId);

  const { data: subs, error } = await query;
  if (error) {
    return NextResponse.json({ error: "구독 조회 실패" }, { status: 500 });
  }

  const payload = JSON.stringify({ title, body, url: url ?? "/" });
  const results = await Promise.allSettled(
    (subs ?? []).map((sub) =>
      webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        payload,
      ),
    ),
  );

  const sent = results.filter((r) => r.status === "fulfilled").length;
  const failed = results.filter((r) => r.status === "rejected").length;

  return NextResponse.json({ sent, failed });
}
