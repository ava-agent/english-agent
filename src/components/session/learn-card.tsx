"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { VocabularyData } from "@/app/actions/session";

interface LearnCardProps {
  vocabulary: VocabularyData;
  onComplete: (needsReview: boolean) => void;
}

export function LearnCard({ vocabulary, onComplete }: LearnCardProps) {
  const [step, setStep] = useState(0);
  // Steps: 0=word+def, 1=examples, 2=dialogue, 3=rate

  return (
    <div className="flex flex-col gap-4">
      {/* Word and Definition - always visible */}
      <div className="rounded-xl border bg-card p-6">
        <div className="mb-2 flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {vocabulary.category === "travel" ? "旅游" : "软件工程"}
          </Badge>
          {vocabulary.is_phrase && (
            <Badge variant="secondary" className="text-xs">
              短语
            </Badge>
          )}
        </div>

        <h2 className="mb-1 text-2xl font-bold">{vocabulary.word}</h2>
        {vocabulary.pronunciation && (
          <p className="mb-3 text-sm text-muted-foreground">
            {vocabulary.pronunciation}
          </p>
        )}

        <p className="mb-2 text-base leading-relaxed">
          {vocabulary.definition}
        </p>
        {vocabulary.definition_zh && (
          <p className="text-sm text-muted-foreground">
            {vocabulary.definition_zh}
          </p>
        )}
      </div>

      {/* Examples - step 1 */}
      {step >= 1 && vocabulary.example_sentences.length > 0 && (
        <div className="rounded-xl border bg-card p-5">
          <h3 className="mb-3 text-sm font-semibold text-muted-foreground">
            Example Sentences
          </h3>
          <div className="space-y-3">
            {vocabulary.example_sentences.map((ex, i) => (
              <div key={i} className="border-l-2 border-primary/30 pl-3">
                <p className="text-sm font-medium">{ex.en}</p>
                <p className="text-xs text-muted-foreground">{ex.zh}</p>
                <p className="mt-0.5 text-xs italic text-muted-foreground/70">
                  {ex.context}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dialogue - step 2 */}
      {step >= 2 && vocabulary.contextual_dialogue && (
        <div className="rounded-xl border bg-card p-5">
          <h3 className="mb-1 text-sm font-semibold text-muted-foreground">
            Dialogue
          </h3>
          <p className="mb-3 text-xs text-muted-foreground">
            {vocabulary.contextual_dialogue.scenario}
          </p>
          <div className="space-y-2">
            {vocabulary.contextual_dialogue.lines.map((line, i) => (
              <div
                key={i}
                className={`flex gap-2 ${
                  line.speaker === "You" ? "justify-end" : ""
                }`}
              >
                {line.speaker !== "You" && (
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium">
                    {line.speaker[0]}
                  </span>
                )}
                <div
                  className={`rounded-lg px-3 py-1.5 text-sm ${
                    line.speaker === "You"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  {line.text}
                </div>
                {line.speaker === "You" && (
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                    Y
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-3">
        {step < 2 ? (
          <Button
            onClick={() => setStep(step + 1)}
            className="h-12 flex-1 text-base"
          >
            {step === 0 ? "查看例句" : "查看对话"}
          </Button>
        ) : step === 2 ? (
          <Button
            onClick={() => setStep(3)}
            className="h-12 flex-1 text-base"
          >
            准备好了
          </Button>
        ) : (
          <>
            <Button
              variant="outline"
              onClick={() => onComplete(true)}
              className="h-12 flex-1 text-base"
            >
              还需复习
            </Button>
            <Button
              onClick={() => onComplete(false)}
              className="h-12 flex-1 text-base"
            >
              记住了
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
