import webpush from "web-push";

export function initWebPush() {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;

  if (!publicKey || !privateKey) {
    console.warn("VAPID keys not configured, push notifications disabled");
    return;
  }

  webpush.setVapidDetails(
    "mailto:english-learning@example.com",
    publicKey,
    privateKey
  );
}

export async function sendPushNotification(
  subscription: webpush.PushSubscription,
  payload: { title: string; body: string; url?: string }
) {
  initWebPush();
  await webpush.sendNotification(subscription, JSON.stringify(payload));
}
