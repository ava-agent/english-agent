"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { getMasteryLevel, getMasteryDisplay } from "@/lib/srs";

interface VocabCardData {
  id: string;
  state: number;
  stability: number;
  due: string;
  reps: number;
  vocabulary: {
    id: string;
    word: string;
    pronunciation: string | null;
    definition: string;
    definition_zh: string | null;
    category: string;
    subcategory: string;
    is_phrase: boolean;
  } | null;
}

interface VocabularyListProps {
  cards: VocabCardData[];
}

export function VocabularyList({ cards }: VocabularyListProps) {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const filtered = useMemo(() => {
    return cards.filter((card) => {
      if (!card.vocabulary) return false;
      const matchesSearch =
        search === "" ||
        card.vocabulary.word.toLowerCase().includes(search.toLowerCase()) ||
        (card.vocabulary.definition_zh?.includes(search) ?? false);
      const matchesCategory =
        categoryFilter === "all" ||
        card.vocabulary.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [cards, search, categoryFilter]);

  if (cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-xl border bg-card p-8 text-center">
        <div className="text-4xl">📖</div>
        <p className="text-sm text-muted-foreground">
          还没有学习任何词汇，去学习页面开始吧！
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Search */}
      <Input
        placeholder="搜索单词或中文..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* Category filter */}
      <div className="flex gap-2">
        {["all", "travel", "software"].map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              categoryFilter === cat
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {cat === "all" ? "全部" : cat === "travel" ? "旅游" : "软件工程"}
          </button>
        ))}
        <span className="ml-auto self-center text-xs text-muted-foreground">
          {filtered.length} 词
        </span>
      </div>

      {/* List */}
      <div className="space-y-2">
        {filtered.map((card) => {
          if (!card.vocabulary) return null;
          const level = getMasteryLevel(card.state, card.stability);
          const mastery = getMasteryDisplay(level);

          return (
            <div
              key={card.id}
              className="rounded-lg border bg-card p-3"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">
                      {card.vocabulary.word}
                    </span>
                    {card.vocabulary.pronunciation && (
                      <span className="text-xs text-muted-foreground">
                        {card.vocabulary.pronunciation}
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">
                    {card.vocabulary.definition_zh ?? card.vocabulary.definition}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge className={`text-[10px] ${mastery.color}`}>
                    {mastery.label}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground">
                    {card.reps}次
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
