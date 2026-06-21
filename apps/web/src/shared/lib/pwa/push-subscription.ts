function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(b64);
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}

function arrayBufferToBase64(buf: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buf)));
}

export async function subscribeToPush(
  registration: ServiceWorkerRegistration,
): Promise<PushSubscription | null> {
  const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  if (!vapidKey) {
    console.warn("[Push] NEXT_PUBLIC_VAPID_PUBLIC_KEY 미설정 — 구독 건너뜀");
    return null;
  }
  try {
    const existing = await registration.pushManager.getSubscription();
    if (existing) return existing;

    return await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidKey).buffer as ArrayBuffer,
    });
  } catch (err) {
    console.error("[Push] 구독 실패:", err);
    return null;
  }
}

export async function sendSubscriptionToServer(
  subscription: PushSubscription,
): Promise<void> {
  const key = subscription.getKey("p256dh");
  const auth = subscription.getKey("auth");
  const res = await fetch("/api/push/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      endpoint: subscription.endpoint,
      p256dh: key ? arrayBufferToBase64(key) : "",
      auth: auth ? arrayBufferToBase64(auth) : "",
    }),
  });
  if (!res.ok) {
    throw new Error(`[Push] 서버 구독 저장 실패: ${res.status}`);
  }
}

export async function unsubscribeFromPush(
  registration: ServiceWorkerRegistration,
): Promise<void> {
  const sub = await registration.pushManager.getSubscription();
  if (!sub) return;
  await fetch("/api/push/subscribe", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ endpoint: sub.endpoint }),
  });
  await sub.unsubscribe();
}
