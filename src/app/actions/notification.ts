"use server";

import { createClient } from "@/lib/supabase/server";
import { sendTelegramMessage } from "@/lib/notifications/telegram";
import { sendServerChanMessage } from "@/lib/notifications/serverchan";

export async function sendTestNotification(
  channel: "telegram" | "serverchan",
  config: { chatId?: string; sendkey?: string }
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "未登录" };

  const title = "测试通知";
  const body = "这是一条测试通知，如果您收到了，说明配置成功！";

  if (channel === "telegram") {
    if (!config.chatId) return { success: false, error: "请输入 Telegram Chat ID" };
    return sendTelegramMessage(config.chatId, `*${title}*\n\n${body}`);
  }

  if (channel === "serverchan") {
    if (!config.sendkey) return { success: false, error: "请输入 Server酱 SendKey" };
    return sendServerChanMessage(config.sendkey, title, body);
  }

  return { success: false, error: "未知渠道" };
}
