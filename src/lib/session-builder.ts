import { createClient } from "@/lib/supabase/server";
import { generatePracticeItems, type GeneratedPractice } from "@/lib/llm";
import type {
  SessionPlan,
  SessionPlanItem,
  PracticeData,
} from "@/types/database";

/**
 * Build a review queue from cards that are due for review
 */
async function buildReviewQueue(userId: string, limit: number) {
  const supabase = await createClient();
  const now = new Date().toISOString();

  const { data } = await supabase
    .from("user_cards")
    .select("*, vocabulary(*)")
    .eq("user_id", userId)
    .lte("due", now)
    .neq("state", 0) // exclude New cards
    .order("due", { ascending: true })
    .limit(limit);

  return data ?? [];
}

/**
 * Select new vocabulary from the corpus that the user hasn't encountered
 */
async function selectNewVocabulary(
  userId: string,
  count: number,
  travelWeight: number
) {
  const supabase = await createClient();

  // Get already-encountered vocabulary IDs
  const { data: existingCards } = await supabase
    .from("user_cards")
    .select("vocabulary_id")
    .eq("user_id", userId);

  const knownIds = (existingCards ?? []).map((c) => c.vocabulary_id);

  // Calculate how many from each category
  const travelCount = Math.round(count * travelWeight);
  const softwareCount = count - travelCount;

  const results = [];

  // Fetch travel vocabulary
  if (travelCount > 0) {
    let query = supabase
      .from("vocabulary")
      .select("*")
      .eq("category", "travel")
      .order("difficulty_tier", { ascending: true })
      .limit(travelCount);

    if (knownIds.length > 0) {
      query = query.not("id", "in", `(${knownIds.join(",")})`);
    }

    const { data } = await query;
    if (data) results.push(...data);
  }

  // Fetch software vocabulary
  if (softwareCount > 0) {
    let query = supabase
      .from("vocabulary")
      .select("*")
      .eq("category", "software")
      .order("difficulty_tier", { ascending: true })
      .limit(softwareCount);

    if (knownIds.length > 0) {
      query = query.not("id", "in", `(${knownIds.join(",")})`);
    }

    const { data } = await query;
    if (data) results.push(...data);
  }

  return results;
}

/**
 * Interleave review, learn, and practice items into a session
 */
function interleaveItems(
  reviewItems: SessionPlanItem[],
  learnItems: SessionPlanItem[],
  practiceItems: SessionPlanItem[]
): SessionPlanItem[] {
  const items: SessionPlanItem[] = [];
  let ri = 0,
    li = 0,
    pi = 0;
  let counter = 0;

  // Pattern: 2 review, 3 new, 1 practice, repeat
  while (ri < reviewItems.length || li < learnItems.length) {
    const phase = counter % 6;
    if (phase < 2 && ri < reviewItems.length) {
      items.push(reviewItems[ri++]);
    } else if (phase < 5 && li < learnItems.length) {
      items.push(learnItems[li++]);
    } else if (pi < practiceItems.length) {
      items.push(practiceItems[pi++]);
    } else if (ri < reviewItems.length) {
      items.push(reviewItems[ri++]);
    } else if (li < learnItems.length) {
      items.push(learnItems[li++]);
    }
    counter++;
  }

  // Append remaining practice items
  while (pi < practiceItems.length) {
    items.push(practiceItems[pi++]);
  }

  return items;
}

/**
 * Build a complete daily session plan
 */
export async function buildSessionPlan(
  userId: string,
  settings: { daily_new_words: number; travel_weight: number }
): Promise<SessionPlan> {
  const { daily_new_words, travel_weight } = settings;

  // 1. Get review queue (~35% of total items)
  const reviewLimit = Math.ceil(daily_new_words * 0.6);
  const reviewCards = await buildReviewQueue(userId, reviewLimit);

  // 2. Select new vocabulary
  const newVocabulary = await selectNewVocabulary(
    userId,
    daily_new_words,
    travel_weight
  );

  // 3. Generate practice items (LLM call)
  const practiceCount = Math.min(3, Math.ceil(newVocabulary.length / 3));
  const wordsForPractice = newVocabulary.slice(0, practiceCount * 2).map((v) => ({
    id: v.id,
    word: v.word,
    definition: v.definition,
  }));

  let practiceData: GeneratedPractice[] = [];
  try {
    practiceData = await generatePracticeItems(wordsForPractice, practiceCount);
  } catch {
    // If LLM fails, proceed without practice items
    console.error("Failed to generate practice items, proceeding without");
  }

  // 4. Build session plan items
  const reviewPlanItems: SessionPlanItem[] = reviewCards.map((card) => ({
    type: "review" as const,
    vocabulary_id: card.vocabulary_id,
    card_id: card.id,
  }));

  const learnPlanItems: SessionPlanItem[] = newVocabulary.map((vocab) => ({
    type: "learn" as const,
    vocabulary_id: vocab.id,
  }));

  const practicePlanItems: SessionPlanItem[] = practiceData.map((p) => ({
    type: "practice" as const,
    vocabulary_id: p.vocabulary_id,
    practice_data: p as PracticeData,
  }));

  // 5. Interleave
  const items = interleaveItems(
    reviewPlanItems,
    learnPlanItems,
    practicePlanItems
  );

  return { items };
}
