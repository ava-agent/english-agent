"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { PracticeData } from "@/types/database";

interface PracticeCardProps {
  practice: PracticeData;
  onComplete: (correct: boolean) => void;
}

export function PracticeCard({ practice, onComplete }: PracticeCardProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);

  const isCorrect = selected === practice.answer;

  const handleSelect = (option: string) => {
    if (showResult) return;
    setSelected(option);
    setShowResult(true);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl border bg-card p-6">
        <p className="mb-1 text-xs font-medium text-muted-foreground">
          Fill in the blank
        </p>
        <p className="text-lg leading-relaxed">
          {practice.sentence.split("____").map((part, i, arr) => (
            <span key={i}>
              {part}
              {i < arr.length - 1 && (
                <span
                  className={cn(
                    "mx-1 inline-block min-w-[80px] border-b-2 text-center font-semibold",
                    showResult
                      ? isCorrect
                        ? "border-green-500 text-green-600"
                        : "border-red-500 text-red-600"
                      : "border-primary/50"
                  )}
                >
                  {showResult ? practice.answer : "____"}
                </span>
              )}
            </span>
          ))}
        </p>
      </div>

      {/* Options */}
      <div className="grid grid-cols-2 gap-2">
        {practice.options.map((option) => (
          <button
            key={option}
            onClick={() => handleSelect(option)}
            disabled={showResult}
            className={cn(
              "rounded-lg border p-3 text-left text-sm font-medium transition-colors",
              showResult && option === practice.answer &&
                "border-green-500 bg-green-50 text-green-700",
              showResult &&
                selected === option &&
                option !== practice.answer &&
                "border-red-500 bg-red-50 text-red-700",
              !showResult &&
                "hover:border-primary/50 hover:bg-accent active:bg-accent/80",
              showResult &&
                option !== practice.answer &&
                selected !== option &&
                "opacity-50"
            )}
          >
            {option}
          </button>
        ))}
      </div>

      {/* Result + Continue */}
      {showResult && (
        <div className="space-y-3">
          <div
            className={cn(
              "rounded-lg p-3 text-sm",
              isCorrect
                ? "bg-green-50 text-green-700"
                : "bg-red-50 text-red-700"
            )}
          >
            {isCorrect ? "正确！" : `正确答案是: ${practice.answer}`}
          </div>
          <Button
            onClick={() => onComplete(isCorrect)}
            className="h-12 w-full text-base"
          >
            继续
          </Button>
        </div>
      )}
    </div>
  );
}
