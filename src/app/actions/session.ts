"use server";

import { createClient } from "@/lib/supabase/server";
import { buildSessionPlan } from "@/lib/session-builder";
import type { SessionPlan } from "@/types/database";

export interface SessionData {
  id: string;
  session_date: string;
  status: "in_progress" | "completed" | "abandoned";
  plan: SessionPlan;
  current_index: number;
  total_items: number;
  completed_items: number;
  new_words_learned: number;
  words_reviewed: number;
  started_at: string;
  duration_seconds: number;
}

export interface VocabularyData {
  id: string;
  word: string;
  pronunciation: string | null;
  definition: string;
  definition_zh: string | null;
  category: string;
  subcategory: string;
  example_sentences: { en: string; zh: string; context: string }[];
  contextual_dialogue: {
    scenario: string;
    lines: { speaker: string; text: string }[];
  } | null;
  is_phrase: boolean;
}

/**
 * Get or generate today's session
 */
export async function getTodaySession(): Promise<{
  session: SessionData | null;
  error?: string;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { session: null, error: "Not authenticated" };

  const today = new Date().toISOString().slice(0, 10);

  // Check for existing session today
  const { data: existing } = await supabase
    .from("sessions")
    .select("*")
    .eq("user_id", user.id)
    .eq("session_date", today)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (existing) {
    return { session: existing as unknown as SessionData };
  }

  return { session: null };
}

/**
 * Generate a new daily session
 */
export async function generateDailySession(): Promise<{
  session: SessionData | null;
  error?: string;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { session: null, error: "Not authenticated" };

  const today = new Date().toISOString().slice(0, 10);

  // Check for existing session today (prevent duplicate generation)
  const { data: existing } = await supabase
    .from("sessions")
    .select("*")
    .eq("user_id", user.id)
    .eq("session_date", today)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (existing) {
    return { session: existing as unknown as SessionData };
  }

  // Get user settings
  const { data: profile } = await supabase
    .from("profiles")
    .select("daily_new_words, travel_weight")
    .eq("id", user.id)
    .single();

  const settings = {
    daily_new_words: profile?.daily_new_words ?? 10,
    travel_weight: profile?.travel_weight ?? 0.5,
  };

  // Build session plan
  const plan = await buildSessionPlan(user.id, settings);

  if (plan.items.length === 0) {
    return { session: null, error: "No vocabulary available for today's session" };
  }

  // Create session in database
  const { data: session, error } = await supabase
    .from("sessions")
    .insert({
      user_id: user.id,
      session_date: today,
      status: "in_progress",
      plan: plan as unknown as Record<string, unknown>,
      total_items: plan.items.length,
      completed_items: 0,
      current_index: 0,
      new_words_learned: 0,
      words_reviewed: 0,
      duration_seconds: 0,
    })
    .select()
    .single();

  if (error) {
    return { session: null, error: error.message };
  }

  return { session: session as unknown as SessionData };
}

/**
 * Get vocabulary data for a specific item
 */
export async function getVocabularyById(
  vocabularyId: string
): Promise<VocabularyData | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("vocabulary")
    .select("*")
    .eq("id", vocabularyId)
    .single();

  return data as VocabularyData | null;
}

/**
 * Get vocabulary data for multiple items
 */
export async function getVocabularyByIds(
  vocabularyIds: string[]
): Promise<VocabularyData[]> {
  if (vocabularyIds.length === 0) return [];

  const supabase = await createClient();
  const { data } = await supabase
    .from("vocabulary")
    .select("*")
    .in("id", vocabularyIds);

  return (data ?? []) as VocabularyData[];
}

/**
 * Save session progress (called after each card interaction)
 */
export async function saveSessionProgress(
  sessionId: string,
  updates: {
    current_index: number;
    completed_items: number;
    new_words_learned: number;
    words_reviewed: number;
    duration_seconds: number;
  }
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("sessions")
    .update(updates)
    .eq("id", sessionId);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Complete a session
 */
export async function completeSession(
  sessionId: string,
  finalStats: {
    new_words_learned: number;
    words_reviewed: number;
    duration_seconds: number;
  }
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  // Update session
  const { data: session, error: updateError } = await supabase
    .from("sessions")
    .update({
      status: "completed",
      completed_at: new Date().toISOString(),
      ...finalStats,
    })
    .eq("id", sessionId)
    .select("session_date, total_items, completed_items")
    .single();

  if (updateError) {
    return { success: false, error: updateError.message };
  }

  // Record daily check-in
  const today = session?.session_date ?? new Date().toISOString().slice(0, 10);

  // Calculate streak
  const { data: prevCheckin } = await supabase
    .from("daily_checkins")
    .select("streak_count, checkin_date")
    .eq("user_id", user.id)
    .order("checkin_date", { ascending: false })
    .limit(1)
    .single();

  let streakCount = 1;
  if (prevCheckin) {
    const prevDate = new Date(prevCheckin.checkin_date);
    const todayDate = new Date(today);
    const diffDays = Math.round(
      (todayDate.getTime() - prevDate.getTime()) / 86400000
    );
    if (diffDays === 1) {
      streakCount = prevCheckin.streak_count + 1;
    } else if (diffDays === 0) {
      streakCount = prevCheckin.streak_count;
    }
  }

  await supabase.from("daily_checkins").upsert(
    {
      user_id: user.id,
      checkin_date: today,
      session_id: sessionId,
      words_learned: finalStats.new_words_learned,
      words_reviewed: finalStats.words_reviewed,
      duration_seconds: finalStats.duration_seconds,
      streak_count: streakCount,
    },
    {
      onConflict: "user_id,checkin_date",
    }
  );

  return { success: true };
}

