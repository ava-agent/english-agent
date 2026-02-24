"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { VocabularyHighlight } from "@/types/database";

interface ChatSummaryProps {
  vocabulary: VocabularyHighlight[];
  messageCount: number;
  characterName: string;
  destination: string;
  scenario: string;
}

export function ChatSummary({
  vocabulary,
  messageCount,
  characterName,
  destination,
  scenario,
}: ChatSummaryProps) {
  return (
    <div className="mx-auto max-w-lg px-4 pt-6 pb-24">
      <div className="flex flex-col gap-4">
        {/* Header */}
        <div className="rounded-xl border bg-card p-6 text-center">
          <div className="mb-2 text-4xl">🎉</div>
          <h2 className="text-lg font-bold">对话完成！</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            和 {characterName} 在{destination} · {scenario}的对话
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border bg-card p-4 text-center">
            <p className="text-2xl font-bold text-primary">{messageCount}</p>
            <p className="text-xs text-muted-foreground">消息数</p>
          </div>
          <div className="rounded-xl border bg-card p-4 text-center">
            <p className="text-2xl font-bold text-primary">
              {vocabulary.length}
            </p>
            <p className="text-xs text-muted-foreground">新词汇</p>
          </div>
        </div>

        {/* Vocabulary learned */}
        {vocabulary.length > 0 && (
          <div className="rounded-xl border bg-card p-4">
            <h3 className="mb-3 text-sm font-medium">学到的词汇</h3>
            <div className="flex flex-col gap-2">
              {vocabulary.map((vocab, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 rounded-lg bg-muted/50 p-3"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium">{vocab.word}</p>
                    {vocab.pronunciation && (
                      <p className="text-xs text-muted-foreground">
                        {vocab.pronunciation}
                      </p>
                    )}
                    {vocab.definition && (
                      <p className="mt-0.5 text-xs">{vocab.definition}</p>
                    )}
                    {vocab.definition_zh && (
                      <p className="text-xs text-muted-foreground">
                        {vocab.definition_zh}
                      </p>
                    )}
                  </div>
                  <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">
                    已收录
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" asChild>
            <Link href="/chat">返回列表</Link>
          </Button>
          <Button className="flex-1" asChild>
            <Link href="/chat">开始新对话</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
