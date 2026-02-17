"use client";

import { useState, useCallback } from "react";
import { ReviewCard } from "@/components/session/review-card";
import { SessionProgress } from "@/components/session/session-progress";
import { submitReview } from "@/app/actions/review";
import { getMasteryLevel, type Grade } from "@/lib/srs";
import { useTimer } from "@/hooks/use-timer";
import type { VocabularyData } from "@/app/actions/session";

interface DueCard {
  id: string;
  state: number;
  stability: number;
  vocabulary: {
    id: string;
    word: string;
    pronunciation: string | null;
    definition: string;
    definition_zh: string | null;
    category: string;
    subcategory: string;
    example_sentences: { en: string; zh: string; context: string }[];
    is_phrase: boolean;
  } | null;
}

interface ReviewPageClientProps {
  dueCards: DueCard[];
}

export function ReviewPageClient({ dueCards }: ReviewPageClientProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completed, setCompleted] = useState(0);
  const cardTimer = useTimer();

  const handleRate = useCallback(
    async (rating: 1 | 2 | 3 | 4) => {
      const card = dueCards[currentIndex];
      if (!card) return;

      await submitReview(card.id, rating as Grade, null, cardTimer.elapsed());
      setCompleted((c) => c + 1);
      setCurrentIndex((i) => i + 1);
      cardTimer.reset();
      cardTimer.start();
    },
    [currentIndex, dueCards, cardTimer]
  );

  if (dueCards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-xl border bg-card p-8 text-center">
        <div className="text-4xl">✅</div>
        <h2 className="text-lg font-semibold">没有待复习的单词</h2>
        <p className="text-sm text-muted-foreground">
          所有到期的单词都已复习完毕，继续保持！
        </p>
      </div>
    );
  }

  if (currentIndex >= dueCards.length) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-xl border bg-card p-8 text-center">
        <div className="text-5xl">🎉</div>
        <h2 className="text-lg font-semibold">复习完成！</h2>
        <p className="text-sm text-muted-foreground">
          已复习 {completed} 个单词
        </p>
      </div>
    );
  }

  const card = dueCards[currentIndex];
  if (!card.vocabulary) return null;

  const vocabulary: VocabularyData = {
    ...card.vocabulary,
    contextual_dialogue: null,
  };

  return (
    <div className="flex flex-col gap-4">
      <SessionProgress
        current={completed}
        total={dueCards.length}
        newWords={0}
        reviewed={completed}
      />
      <ReviewCard
        key={card.id}
        vocabulary={vocabulary}
        masteryLevel={getMasteryLevel(card.state, card.stability)}
        onRate={handleRate}
      />
    </div>
  );
}
