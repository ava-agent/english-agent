"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DESTINATIONS,
  SCENARIOS,
  CHARACTERS,
  type Destination,
  type Scenario,
} from "@/lib/chat-constants";
import { startConversation } from "@/app/actions/chat";
import type { ChatCharacter, ChatConversation } from "@/types/database";

type Step = "destination" | "scenario" | "character";

interface ChatPageClientProps {
  initialConversations: ChatConversation[];
}

export function ChatPageClient({ initialConversations }: ChatPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isNewConversation = searchParams.get("new") === "1";
  const [step, setStep] = useState<Step>(isNewConversation ? "destination" : "destination");
  const [selectedDest, setSelectedDest] = useState<Destination | null>(null);
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeConversations = initialConversations.filter(
    (c) => c.status === "active"
  );

  const handleSelectDestination = (dest: Destination) => {
    setSelectedDest(dest);
    setStep("scenario");
  };

  const handleSelectScenario = (scenario: Scenario) => {
    setSelectedScenario(scenario);
    setStep("character");
  };

  const handleSelectCharacter = async (character: ChatCharacter) => {
    if (!selectedDest || !selectedScenario) return;

    setLoading(true);
    setError(null);

    const result = await startConversation(
      character.id,
      selectedDest.id,
      selectedScenario.id
    );

    if (result.success && result.conversation) {
      router.push(`/chat/${result.conversation.id}`);
    } else {
      setError(result.error ?? "创建对话失败");
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (step === "character") setStep("scenario");
    else if (step === "scenario") setStep("destination");
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center gap-3 py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">正在创建对话...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 pb-24">
      {/* Active conversations */}
      {activeConversations.length > 0 && step === "destination" && !isNewConversation && (
        <div className="rounded-xl border bg-card p-4">
          <h2 className="mb-3 text-sm font-medium text-muted-foreground">
            进行中的对话
          </h2>
          <div className="flex flex-col gap-2">
            {activeConversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => router.push(`/chat/${conv.id}`)}
                className="flex items-center gap-3 rounded-lg border p-3 text-left transition-colors hover:bg-accent"
              >
                <span className="text-2xl">
                  {DESTINATIONS.find((d) => d.id === conv.destination)?.flag ?? "🌍"}
                </span>
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    {DESTINATIONS.find((d) => d.id === conv.destination)?.nameZh ?? conv.destination}
                    {" · "}
                    {SCENARIOS.find((s) => s.id === conv.scenario)?.nameZh ?? conv.scenario}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {conv.message_count} 条消息
                  </p>
                </div>
                <span className="text-xs text-primary">继续 →</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step indicator */}
      {step !== "destination" && (
        <button
          onClick={handleBack}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          ← 返回
        </button>
      )}

      {error && (
        <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Step 1: Destination */}
      {step === "destination" && (
        <>
          <h2 className="text-base font-medium">选择旅行目的地</h2>
          <div className="grid grid-cols-2 gap-3">
            {DESTINATIONS.map((dest) => (
              <button
                key={dest.id}
                onClick={() => handleSelectDestination(dest)}
                className="flex flex-col items-center gap-2 rounded-xl border bg-card p-4 transition-all hover:border-primary hover:shadow-sm"
              >
                <span className="text-3xl">{dest.flag}</span>
                <span className="text-sm font-medium">{dest.nameZh}</span>
                <span className="text-xs text-muted-foreground">
                  {dest.name}
                </span>
              </button>
            ))}
          </div>
        </>
      )}

      {/* Step 2: Scenario */}
      {step === "scenario" && selectedDest && (
        <>
          <h2 className="text-base font-medium">
            {selectedDest.flag} {selectedDest.nameZh} · 选择场景
          </h2>
          <div className="flex flex-col gap-3">
            {SCENARIOS.map((scenario) => (
              <button
                key={scenario.id}
                onClick={() => handleSelectScenario(scenario)}
                className="flex items-center gap-3 rounded-xl border bg-card p-4 text-left transition-all hover:border-primary hover:shadow-sm"
              >
                <span className="text-2xl">{scenario.icon}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium">{scenario.nameZh}</p>
                  <p className="text-xs text-muted-foreground">
                    {scenario.description}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </>
      )}

      {/* Step 3: Character */}
      {step === "character" && selectedDest && selectedScenario && (
        <>
          <h2 className="text-base font-medium">
            选择你的聊天伙伴
          </h2>
          <p className="text-xs text-muted-foreground">
            {selectedDest.flag} {selectedDest.nameZh} · {selectedScenario.icon}{" "}
            {selectedScenario.nameZh}
          </p>
          <div className="flex flex-col gap-3">
            {CHARACTERS.map((character) => (
              <Button
                key={character.id}
                variant="outline"
                className="flex h-auto items-start gap-3 rounded-xl p-4 text-left"
                onClick={() => handleSelectCharacter(character)}
              >
                <span className="text-3xl">{character.avatar}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{character.name}</p>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {character.personality}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground/70 line-clamp-2">
                    {character.background}
                  </p>
                </div>
              </Button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
