"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { LearnCard } from "./learn-card";
import { ReviewCard } from "./review-card";
import { PracticeCard } from "./practice-card";
import { SessionProgress } from "./session-progress";
import { SessionSummary } from "./session-summary";
import { useTimer } from "@/hooks/use-timer";
import {
  saveSessionProgress,
  completeSession,
  getVocabularyByIds,
  type SessionData,
  type VocabularyData,
} from "@/app/actions/session";
import { submitReview, createUserCard } from "@/app/actions/review";
import { Rating, type Grade } from "@/lib/srs";
import { getMasteryLevel } from "@/lib/srs";
import type { SessionPlanItem, PracticeData } from "@/types/database";

interface SessionContainerProps {
  session: SessionData;
}

export function SessionContainer({ session }: SessionContainerProps) {
  const [currentIndex, setCurrentIndex] = useState(session.current_index);
  const [completedItems, setCompletedItems] = useState(session.completed_items);
  const [newWordsLearned, setNewWordsLearned] = useState(
    session.new_words_learned
  );
  const [wordsReviewed, setWordsReviewed] = useState(session.words_reviewed);
  const [isComplete, setIsComplete] = useState(false);
  const [vocabularyMap, setVocabularyMap] = useState<
    Record<string, VocabularyData>
  >({});
  const [loading, setLoading] = useState(true);

  const sessionStartTime = useRef(Date.now());
  const cardTimer = useTimer();

  const plan = session.plan;
  const items = plan.items ?? [];

  // Prefetch all vocabulary data
  useEffect(() => {
    async function loadVocabulary() {
      const vocabIds = items
        .map((item) => item.vocabulary_id)
        .filter((id): id is string => !!id);
      const uniqueIds = [...new Set(vocabIds)];

      if (uniqueIds.length > 0) {
        const vocabs = await getVocabularyByIds(uniqueIds);
        const map: Record<string, VocabularyData> = {};
        for (const v of vocabs) {
          map[v.id] = v;
        }
        setVocabularyMap(map);
      }
      setLoading(false);
      cardTimer.start();
    }
    loadVocabulary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getDurationSeconds = useCallback(() => {
    return Math.round((Date.now() - sessionStartTime.current) / 1000) +
      session.duration_seconds;
  }, [session.duration_seconds]);

  const advanceToNext = useCallback(
    async (
      incrementNew: boolean,
      incrementReview: boolean
    ) => {
      const nextIndex = currentIndex + 1;
      const nextCompleted = completedItems + 1;
      const nextNew = newWordsLearned + (incrementNew ? 1 : 0);
      const nextReviewed = wordsReviewed + (incrementReview ? 1 : 0);

      setCurrentIndex(nextIndex);
      setCompletedItems(nextCompleted);
      if (incrementNew) setNewWordsLearned(nextNew);
      if (incrementReview) setWordsReviewed(nextReviewed);

      // Save progress to DB
      await saveSessionProgress(session.id, {
        current_index: nextIndex,
        completed_items: nextCompleted,
        new_words_learned: nextNew,
        words_reviewed: nextReviewed,
        duration_seconds: getDurationSeconds(),
      });

      // Check if session is complete
      if (nextIndex >= items.length) {
        await completeSession(session.id, {
          new_words_learned: nextNew,
          words_reviewed: nextReviewed,
          duration_seconds: getDurationSeconds(),
        });
        setIsComplete(true);
      }

      cardTimer.reset();
      cardTimer.start();
    },
    [
      currentIndex,
      completedItems,
      newWordsLearned,
      wordsReviewed,
      session.id,
      items.length,
      getDurationSeconds,
      cardTimer,
    ]
  );

  // Handle learn card completion
  const handleLearnComplete = useCallback(
    async (needsReview: boolean) => {
      const item = items[currentIndex];
      if (!item?.vocabulary_id) return;

      const rating = (needsReview ? Rating.Again : Rating.Good) as Grade;
      await createUserCard(
        item.vocabulary_id,
        rating,
        session.id,
        cardTimer.elapsed()
      );
      await advanceToNext(true, false);
    },
    [currentIndex, items, session.id, cardTimer, advanceToNext]
  );

  // Handle review card rating
  const handleReviewRate = useCallback(
    async (rating: 1 | 2 | 3 | 4) => {
      const item = items[currentIndex];
      if (!item?.card_id) return;

      await submitReview(
        item.card_id,
        rating as Grade,
        session.id,
        cardTimer.elapsed()
      );
      await advanceToNext(false, true);
    },
    [currentIndex, items, session.id, cardTimer, advanceToNext]
  );

  // Handle practice completion
  const handlePracticeComplete = useCallback(
    async (_correct: boolean) => {
      await advanceToNext(false, false);
    },
    [advanceToNext]
  );

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="h-2 animate-pulse rounded-full bg-muted" />
        <div className="h-64 animate-pulse rounded-xl bg-muted" />
      </div>
    );
  }

  if (isComplete || currentIndex >= items.length) {
    return (
      <SessionSummary
        newWords={newWordsLearned}
        reviewed={wordsReviewed}
        durationSeconds={getDurationSeconds()}
        totalItems={items.length}
        completedItems={completedItems}
      />
    );
  }

  const currentItem: SessionPlanItem = items[currentIndex];
  const vocabulary = currentItem.vocabulary_id
    ? vocabularyMap[currentItem.vocabulary_id]
    : null;

  return (
    <div className="flex flex-col gap-4">
      <SessionProgress
        current={completedItems}
        total={items.length}
        newWords={newWordsLearned}
        reviewed={wordsReviewed}
      />

      {currentItem.type === "learn" && vocabulary && (
        <LearnCard
          key={currentIndex}
          vocabulary={vocabulary}
          onComplete={handleLearnComplete}
        />
      )}

      {currentItem.type === "review" && vocabulary && (
        <ReviewCard
          key={currentIndex}
          vocabulary={vocabulary}
          masteryLevel={getMasteryLevel(2, 0)}
          onRate={handleReviewRate}
        />
      )}

      {currentItem.type === "practice" && currentItem.practice_data && (
        <PracticeCard
          key={currentIndex}
          practice={currentItem.practice_data as PracticeData}
          onComplete={handlePracticeComplete}
        />
      )}

      {/* Fallback for missing data */}
      {!vocabulary && currentItem.type !== "practice" && (
        <div className="rounded-xl border bg-card p-6 text-center">
          <p className="text-muted-foreground">加载词汇数据中...</p>
          <button
            onClick={() => advanceToNext(false, false)}
            className="mt-3 text-sm text-primary underline"
          >
            跳过
          </button>
        </div>
      )}
    </div>
  );
}
