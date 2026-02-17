import { createClient } from "@supabase/supabase-js";
import { sendTelegramMessage } from "./telegram";
import { sendServerChanMessage } from "./serverchan";
import { sendPushNotification } from "../push";
import type { NotificationPayload } from "./messages";

export type { NotificationPayload } from "./messages";

export interface NotificationResult {
  channel: string;
  success: boolean;
  error?: string;
}

export async function sendNotificationToUser(
  userId: string,
  payload: NotificationPayload
): Promise<NotificationResult[]> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: profile } = await supabase
    .from("profiles")
    .select("telegram_enabled, telegram_chat_id, serverchan_enabled, serverchan_sendkey")
    .eq("id", userId)
    .single();

  if (!profile) return [];

  const tasks: Promise<NotificationResult>[] = [];

  // Telegram
  if (profile.telegram_enabled && profile.telegram_chat_id) {
    tasks.push(
      sendTelegramMessage(profile.telegram_chat_id, payload.body)
        .then((r) => ({ channel: "telegram", ...r }))
    );
  }

  // ServerChan
  if (profile.serverchan_enabled && profile.serverchan_sendkey) {
    tasks.push(
      sendServerChanMessage(
        profile.serverchan_sendkey,
        payload.title,
        payload.markdown ?? payload.body
      ).then((r) => ({ channel: "serverchan", ...r }))
    );
  }

  // Web Push
  const { data: subs } = await supabase
    .from("push_subscriptions")
    .select("endpoint, p256dh, auth_key")
    .eq("user_id", userId);

  if (subs && subs.length > 0) {
    for (const sub of subs) {
      tasks.push(
        sendPushNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth_key },
          },
          { title: payload.title, body: payload.body, url: payload.url }
        )
          .then(() => ({ channel: "webpush", success: true }))
          .catch((e: unknown) => ({
            channel: "webpush",
            success: false,
            error: String(e),
          }))
      );
    }
  }

  return Promise.all(tasks);
}
