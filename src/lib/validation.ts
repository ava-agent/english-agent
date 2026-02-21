import { z } from "zod";

export const updateSettingsSchema = z.object({
  daily_new_words: z.number().int().min(5).max(20).optional(),
  session_length_minutes: z.number().int().min(5).max(60).optional(),
  travel_weight: z.number().min(0).max(1).optional(),
  notification_hour: z.number().int().min(0).max(23).optional(),
  timezone: z.string().min(1).max(50).optional(),
  telegram_chat_id: z.string().max(50).nullable().optional(),
  telegram_enabled: z.boolean().optional(),
  serverchan_sendkey: z.string().max(100).nullable().optional(),
  serverchan_enabled: z.boolean().optional(),
});

export const testNotificationSchema = z.object({
  channel: z.enum(["telegram", "serverchan"]),
  config: z.object({
    chatId: z.string().max(50).optional(),
    sendkey: z.string().max(100).optional(),
  }),
});
