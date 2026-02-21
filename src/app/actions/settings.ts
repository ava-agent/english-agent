"use server";

import { createClient } from "@/lib/supabase/server";
import { updateSettingsSchema } from "@/lib/validation";

export interface UserSettings {
  daily_new_words: number;
  session_length_minutes: number;
  travel_weight: number;
  notification_hour: number;
  timezone: string;
  telegram_chat_id: string | null;
  telegram_enabled: boolean;
  serverchan_sendkey: string | null;
  serverchan_enabled: boolean;
}

export async function getSettings(): Promise<UserSettings | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("daily_new_words, session_length_minutes, travel_weight, notification_hour, timezone, telegram_chat_id, telegram_enabled, serverchan_sendkey, serverchan_enabled")
    .eq("id", user.id)
    .single();

  return data as UserSettings | null;
}

export async function updateSettings(
  settings: Partial<UserSettings>
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const parsed = updateSettingsSchema.safeParse(settings);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid settings" };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      ...parsed.data,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}
