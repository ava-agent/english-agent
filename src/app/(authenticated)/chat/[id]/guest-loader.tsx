"use client";

import { useMemo } from "react";
import { redirect } from "next/navigation";
import { ChatView } from "@/components/chat/chat-view";
import type { ChatConversation, ChatMessage } from "@/types/database";

export function GuestChatLoader({ conversationId }: { conversationId: string }) {
  const { conversation, initialMessages } = useMemo(() => {
    if (typeof window === "undefined") {
      return { conversation: null, initialMessages: [] };
    }

    const stored = sessionStorage.getItem(`guest-conv-${conversationId}`);
    if (!stored) {
      return { conversation: null, initialMessages: [] };
    }

    const conv = JSON.parse(stored) as ChatConversation & { greeting?: string };
    const msgs: ChatMessage[] = conv.greeting
      ? [
          {
            id: crypto.randomUUID(),
            conversation_id: conv.id,
            user_id: conv.user_id,
            role: "assistant" as const,
            content: conv.greeting,
            metadata: {},
            created_at: conv.created_at,
          },
        ]
      : [];

    return { conversation: conv, initialMessages: msgs };
  }, [conversationId]);

  if (!conversation) {
    redirect("/chat");
  }

  return (
    <ChatView
      conversation={conversation}
      initialMessages={initialMessages}
      isGuest
    />
  );
}
