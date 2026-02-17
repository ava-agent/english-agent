"use server";

import { createClient } from "@/lib/supabase/server";
import {
  type Grade,
  reviewCard,
  dbFieldsToCard,
  cardToDbFields,
  createNewCard,
  formatNextReview,
} from "@/lib/srs";

export interface ReviewResult {
  success: boolean;
  nextReview: string;
  newState: number;
  error?: string;
}

/**
 * Submit a review rating for an existing card
 */
export async function submitReview(
  cardId: string,
  rating: Grade,
  sessionId: string | null,
  durationMs: number
): Promise<ReviewResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, nextReview: "", newState: 0, error: "Not authenticated" };

  // Get current card state
  const { data: cardRow, error: fetchError } = await supabase
    .from("user_cards")
    .select("*")
    .eq("id", cardId)
    .single();

  if (fetchError || !cardRow) {
    return { success: false, nextReview: "", newState: 0, error: "Card not found" };
  }

  // Convert to FSRS card and process review
  const card = dbFieldsToCard(cardRow);
  const stateBefore = cardRow.state;
  const stabilityBefore = cardRow.stability;

  const { card: updatedCard } = reviewCard(card, rating);
  const dbFields = cardToDbFields(updatedCard);

  // Update card in database
  const { error: updateError } = await supabase
    .from("user_cards")
    .update({
      ...dbFields,
      updated_at: new Date().toISOString(),
    })
    .eq("id", cardId);

  if (updateError) {
    return { success: false, nextReview: "", newState: 0, error: updateError.message };
  }

  // Log the review
  await supabase.from("review_logs").insert({
    user_id: user.id,
    card_id: cardId,
    vocabulary_id: cardRow.vocabulary_id,
    session_id: sessionId,
    rating,
    state_before: stateBefore,
    state_after: dbFields.state,
    stability_before: stabilityBefore,
    stability_after: dbFields.stability,
    elapsed_days: dbFields.elapsed_days,
    scheduled_days: dbFields.scheduled_days,
    review_duration_ms: durationMs,
  });

  return {
    success: true,
    nextReview: formatNextReview(updatedCard),
    newState: dbFields.state,
  };
}

/**
 * Create a new card for a vocabulary item (when user first encounters it)
 */
export async function createUserCard(
  vocabularyId: string,
  rating: Grade,
  sessionId: string | null,
  durationMs: number
): Promise<ReviewResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, nextReview: "", newState: 0, error: "Not authenticated" };

  // Check if card already exists
  const { data: existing } = await supabase
    .from("user_cards")
    .select("id")
    .eq("user_id", user.id)
    .eq("vocabulary_id", vocabularyId)
    .single();

  if (existing) {
    // Card already exists, do a normal review
    return submitReview(existing.id, rating, sessionId, durationMs);
  }

  // Create new FSRS card and process the first review
  const newCard = createNewCard();
  const { card: updatedCard } = reviewCard(newCard, rating);
  const dbFields = cardToDbFields(updatedCard);

  const { data: inserted, error: insertError } = await supabase
    .from("user_cards")
    .insert({
      user_id: user.id,
      vocabulary_id: vocabularyId,
      ...dbFields,
    })
    .select("id")
    .single();

  if (insertError || !inserted) {
    return { success: false, nextReview: "", newState: 0, error: insertError?.message ?? "Insert failed" };
  }

  // Log the review
  await supabase.from("review_logs").insert({
    user_id: user.id,
    card_id: inserted.id,
    vocabulary_id: vocabularyId,
    session_id: sessionId,
    rating,
    state_before: 0,
    state_after: dbFields.state,
    stability_before: 0,
    stability_after: dbFields.stability,
    elapsed_days: 0,
    scheduled_days: dbFields.scheduled_days,
    review_duration_ms: durationMs,
  });

  return {
    success: true,
    nextReview: formatNextReview(updatedCard),
    newState: dbFields.state,
  };
}
