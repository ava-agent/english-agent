"use server";

import { createClient } from "@/lib/supabase/server";

export interface UserSettings {
  daily_new_words: number;
  session_length_minutes: number;
  travel_weight: number;
  notification_hour: number;
  timezone: string;
}

export async function getSettings(): Promise<UserSettings | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("daily_new_words, session_length_minutes, travel_weight, notification_hour, timezone")
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

  const { error } = await supabase
    .from("profiles")
    .update({
      ...settings,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}
