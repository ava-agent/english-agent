"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface ChatBubbleProps {
  role: "user" | "assistant" | "system";
  content: string;
  avatar?: string;
  isStreaming?: boolean;
}

export function ChatBubble({ role, content, avatar, isStreaming }: ChatBubbleProps) {
  const isUser = role === "user";

  return (
    <div
      className={cn("flex gap-2", isUser ? "flex-row-reverse" : "flex-row")}
    >
      {!isUser && (
        <span className="mt-1 shrink-0 text-lg">{avatar ?? "🤖"}</span>
      )}
      <div
        className={cn(
          "max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-muted",
          isStreaming && "animate-pulse"
        )}
      >
        <FormattedContent content={content} isUser={isUser} />
      </div>
    </div>
  );
}

// ============================================
// Render bold words with vocabulary highlights
// ============================================

function FormattedContent({
  content,
  isUser,
}: {
  content: string;
  isUser: boolean;
}) {
  if (isUser) {
    return <span>{content}</span>;
  }

  // Split content by **bold** markers
  const parts = content.split(/(\*\*[^*]+\*\*)/g);

  return (
    <span>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          const word = part.slice(2, -2);
          return <VocabWord key={i} word={word} />;
        }
        return <span key={i}>{part}</span>;
      })}
    </span>
  );
}

// ============================================
// Vocabulary word with tap-to-show definition
// ============================================

function VocabWord({ word }: { word: string }) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <span className="relative inline">
      <button
        onClick={() => setShowTooltip(!showTooltip)}
        className="font-semibold text-primary underline decoration-primary/30 decoration-wavy underline-offset-2"
      >
        {word}
      </button>
      {showTooltip && (
        <span className="absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg border bg-popover px-3 py-1.5 text-xs shadow-md">
          <span className="font-medium">{word}</span>
          <span className="ml-1 text-muted-foreground">· tap to dismiss</span>
        </span>
      )}
    </span>
  );
}
