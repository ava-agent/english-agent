import {
  createEmptyCard,
  fsrs,
  generatorParameters,
  Rating,
  type Card,
  type Grade,
  type RecordLogItem,
} from "ts-fsrs";

// Initialize FSRS with sensible defaults
const params = generatorParameters({
  enable_fuzz: true, // add randomness to intervals to avoid clustering
  enable_short_term: true, // enable learning steps for new cards
  maximum_interval: 365, // max 1 year between reviews
});

const f = fsrs(params);

export { Rating };
export type { Card, Grade };

/**
 * Create a new empty FSRS card
 */
export function createNewCard(): Card {
  return createEmptyCard(new Date());
}

/**
 * Process a review rating and return updated card + log
 */
export function reviewCard(
  card: Card,
  rating: Grade
): { card: Card; log: RecordLogItem } {
  const now = new Date();
  const scheduling = f.repeat(card, now);
  const result = scheduling[rating];
  return {
    card: result.card,
    log: result,
  };
}

/**
 * Get all possible scheduling results for a card (for preview)
 */
export function previewScheduling(card: Card) {
  const now = new Date();
  const scheduling = f.repeat(card, now);
  return {
    again: scheduling[Rating.Again].card,
    hard: scheduling[Rating.Hard].card,
    good: scheduling[Rating.Good].card,
    easy: scheduling[Rating.Easy].card,
  };
}

/**
 * Convert FSRS Card to database-storable fields
 */
export function cardToDbFields(card: Card) {
  return {
    due: card.due.toISOString(),
    stability: card.stability,
    difficulty: card.difficulty,
    elapsed_days: card.elapsed_days,
    scheduled_days: card.scheduled_days,
    reps: card.reps,
    lapses: card.lapses,
    state: card.state as number,
    last_review: card.last_review?.toISOString() ?? null,
  };
}

/**
 * Convert database fields back to an FSRS Card
 */
export function dbFieldsToCard(fields: {
  due: string;
  stability: number;
  difficulty: number;
  elapsed_days: number;
  scheduled_days: number;
  reps: number;
  lapses: number;
  state: number;
  last_review: string | null;
}): Card {
  return {
    due: new Date(fields.due),
    stability: fields.stability,
    difficulty: fields.difficulty,
    elapsed_days: fields.elapsed_days,
    scheduled_days: fields.scheduled_days,
    reps: fields.reps,
    lapses: fields.lapses,
    state: fields.state,
    last_review: fields.last_review
      ? new Date(fields.last_review)
      : new Date(),
  } as Card;
}

/**
 * Get a human-readable mastery level from card state
 */
export function getMasteryLevel(
  state: number,
  stability: number
): "new" | "learning" | "familiar" | "mastered" | "relearning" {
  switch (state) {
    case 0:
      return "new";
    case 1:
      return "learning";
    case 2:
      if (stability > 30) return "mastered";
      return "familiar";
    case 3:
      return "relearning";
    default:
      return "new";
  }
}

/**
 * Get display info for a mastery level
 */
export function getMasteryDisplay(level: string): {
  label: string;
  color: string;
} {
  const map: Record<string, { label: string; color: string }> = {
    new: { label: "新词", color: "bg-zinc-200 text-zinc-700" },
    learning: { label: "学习中", color: "bg-blue-100 text-blue-700" },
    familiar: { label: "熟悉", color: "bg-yellow-100 text-yellow-700" },
    mastered: { label: "已掌握", color: "bg-green-100 text-green-700" },
    relearning: { label: "重学中", color: "bg-orange-100 text-orange-700" },
  };
  return map[level] ?? map.new;
}

/**
 * Format the next review date as a human-readable string
 */
export function formatNextReview(card: Card): string {
  const now = new Date();
  const due = card.due;
  const diffMs = due.getTime() - now.getTime();
  const diffMins = Math.round(diffMs / 60000);
  const diffHours = Math.round(diffMs / 3600000);
  const diffDays = Math.round(diffMs / 86400000);

  if (diffMins < 1) return "马上";
  if (diffMins < 60) return `${diffMins} 分钟后`;
  if (diffHours < 24) return `${diffHours} 小时后`;
  if (diffDays === 1) return "明天";
  if (diffDays < 30) return `${diffDays} 天后`;
  if (diffDays < 365) return `${Math.round(diffDays / 30)} 个月后`;
  return `${Math.round(diffDays / 365)} 年后`;
}
