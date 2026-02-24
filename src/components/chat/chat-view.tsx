"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Send, ArrowLeft, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChatBubble } from "./chat-bubble";
import { ChatSummary } from "./chat-summary";
import { endConversation } from "@/app/actions/chat";
import { getCharacter, getDestination, getScenario } from "@/lib/chat-constants";
import type {
  ChatConversation,
  ChatMessage,
  VocabularyHighlight,
} from "@/types/database";

interface ChatViewProps {
  conversation: ChatConversation;
  initialMessages: ChatMessage[];
}

export function ChatView({ conversation, initialMessages }: ChatViewProps) {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [isEnding, setIsEnding] = useState(false);
  const [summary, setSummary] = useState<VocabularyHighlight[] | null>(
    conversation.status === "completed" ? conversation.vocabulary_learned : null
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const character = getCharacter(conversation.character_id);
  const destination = getDestination(conversation.destination);
  const scenario = getScenario(conversation.scenario);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingContent, scrollToBottom]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isStreaming) return;

    setInput("");
    setIsStreaming(true);
    setStreamingContent("");

    // Add user message optimistically
    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      conversation_id: conversation.id,
      user_id: conversation.user_id,
      role: "user",
      content: text,
      metadata: {},
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: conversation.id,
          message: text,
        }),
      });

      if (!res.ok || !res.body) {
        throw new Error("Stream failed");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        fullContent += chunk;
        setStreamingContent(fullContent);
      }

      // Add completed AI message
      const aiMsg: ChatMessage = {
        id: crypto.randomUUID(),
        conversation_id: conversation.id,
        user_id: conversation.user_id,
        role: "assistant",
        content: fullContent,
        metadata: {},
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, aiMsg]);
      setStreamingContent("");
    } catch (error) {
      console.error("Chat error:", error);
      // Show error in chat
      const errMsg: ChatMessage = {
        id: crypto.randomUUID(),
        conversation_id: conversation.id,
        user_id: conversation.user_id,
        role: "assistant",
        content: "Oops, something went wrong. Try sending your message again! 😅",
        metadata: {},
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errMsg]);
      setStreamingContent("");
    } finally {
      setIsStreaming(false);
      inputRef.current?.focus();
    }
  };

  const handleEndConversation = async () => {
    setIsEnding(true);
    const result = await endConversation(conversation.id);
    if (result.success) {
      setSummary(result.vocabulary ?? []);
    }
    setIsEnding(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      handleSend();
    }
  };

  // Show summary if conversation ended
  if (summary !== null) {
    return (
      <ChatSummary
        vocabulary={summary}
        messageCount={messages.length}
        characterName={character?.name ?? "AI"}
        destination={destination?.nameZh ?? ""}
        scenario={scenario?.nameZh ?? ""}
      />
    );
  }

  return (
    <div className="flex h-[100dvh] flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 border-b bg-background px-4 py-3">
        <button
          onClick={() => router.push("/chat")}
          className="text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <span className="text-2xl">{character?.avatar ?? "🤖"}</span>
        <div className="flex-1">
          <p className="text-sm font-medium">{character?.name ?? "AI"}</p>
          <p className="text-xs text-muted-foreground">
            {destination?.flag} {destination?.nameZh} · {scenario?.nameZh}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleEndConversation}
          disabled={isEnding}
          className="text-xs text-muted-foreground"
        >
          <LogOut className="mr-1 h-3.5 w-3.5" />
          {isEnding ? "结算中..." : "结束"}
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="mx-auto flex max-w-lg flex-col gap-3">
          {messages.map((msg) => (
            <ChatBubble
              key={msg.id}
              role={msg.role}
              content={msg.content}
              avatar={msg.role === "assistant" ? character?.avatar : undefined}
            />
          ))}

          {/* Streaming indicator */}
          {isStreaming && streamingContent && (
            <ChatBubble
              role="assistant"
              content={streamingContent}
              avatar={character?.avatar}
              isStreaming
            />
          )}

          {isStreaming && !streamingContent && (
            <div className="flex items-center gap-2">
              <span className="text-lg">{character?.avatar ?? "🤖"}</span>
              <div className="flex gap-1 rounded-2xl bg-muted px-4 py-3">
                <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:0ms]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:150ms]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:300ms]" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="border-t bg-background px-4 py-3">
        <div className="mx-auto flex max-w-lg items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isStreaming ? "等待回复中..." : "Type your message in English..."}
            disabled={isStreaming}
            className="flex-1 rounded-full border bg-muted/50 px-4 py-2.5 text-sm outline-none placeholder:text-muted-foreground/60 focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-50"
          />
          <Button
            size="icon"
            onClick={handleSend}
            disabled={!input.trim() || isStreaming}
            className="h-10 w-10 shrink-0 rounded-full"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
