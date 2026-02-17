"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getMasteryDisplay } from "@/lib/srs";
import type { VocabularyData } from "@/app/actions/session";

interface ReviewCardProps {
  vocabulary: VocabularyData;
  masteryLevel: string;
  onRate: (rating: 1 | 2 | 3 | 4) => void;
}

export function ReviewCard({
  vocabulary,
  masteryLevel,
  onRate,
}: ReviewCardProps) {
  const [flipped, setFlipped] = useState(false);
  const mastery = getMasteryDisplay(masteryLevel);

  return (
    <div className="flex flex-col gap-4">
      {/* Card */}
      <div
        className="min-h-[240px] cursor-pointer rounded-xl border bg-card p-6"
        onClick={() => !flipped && setFlipped(true)}
      >
        <div className="mb-3 flex items-center gap-2">
          <Badge className={`text-xs ${mastery.color}`}>
            {mastery.label}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {vocabulary.category === "travel" ? "旅游" : "软件工程"}
          </Badge>
        </div>

        {/* Front: word only */}
        <h2 className="mb-2 text-2xl font-bold">{vocabulary.word}</h2>
        {vocabulary.pronunciation && (
          <p className="mb-4 text-sm text-muted-foreground">
            {vocabulary.pronunciation}
          </p>
        )}

        {!flipped ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-sm text-muted-foreground">
              点击查看答案
            </p>
          </div>
        ) : (
          /* Back: definition + example */
          <div className="space-y-3">
            <div>
              <p className="text-base leading-relaxed">
                {vocabulary.definition}
              </p>
              {vocabulary.definition_zh && (
                <p className="mt-1 text-sm text-muted-foreground">
                  {vocabulary.definition_zh}
                </p>
              )}
            </div>

            {vocabulary.example_sentences.length > 0 && (
              <div className="border-l-2 border-primary/30 pl-3">
                <p className="text-sm font-medium">
                  {vocabulary.example_sentences[0].en}
                </p>
                <p className="text-xs text-muted-foreground">
                  {vocabulary.example_sentences[0].zh}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Rating buttons - only show when flipped */}
      {flipped && (
        <div className="grid grid-cols-4 gap-2">
          <Button
            variant="outline"
            onClick={() => onRate(1)}
            className="h-14 flex-col gap-0.5 border-red-200 text-red-600 hover:bg-red-50"
          >
            <span className="text-sm font-medium">忘了</span>
            <span className="text-[10px] text-muted-foreground">Again</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => onRate(2)}
            className="h-14 flex-col gap-0.5 border-orange-200 text-orange-600 hover:bg-orange-50"
          >
            <span className="text-sm font-medium">困难</span>
            <span className="text-[10px] text-muted-foreground">Hard</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => onRate(3)}
            className="h-14 flex-col gap-0.5 border-green-200 text-green-600 hover:bg-green-50"
          >
            <span className="text-sm font-medium">记得</span>
            <span className="text-[10px] text-muted-foreground">Good</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => onRate(4)}
            className="h-14 flex-col gap-0.5 border-blue-200 text-blue-600 hover:bg-blue-50"
          >
            <span className="text-sm font-medium">简单</span>
            <span className="text-[10px] text-muted-foreground">Easy</span>
          </Button>
        </div>
      )}
    </div>
  );
}
