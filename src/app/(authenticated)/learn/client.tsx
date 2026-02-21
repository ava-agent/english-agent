"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SessionContainer } from "@/components/session/session-container";
import {
  generateDailySession,
  type SessionData,
} from "@/app/actions/session";
import { SessionSummary } from "@/components/session/session-summary";

interface LearnPageClientProps {
  initialSession: SessionData | null;
}

export function LearnPageClient({ initialSession }: LearnPageClientProps) {
  const [session, setSession] = useState<SessionData | null>(initialSession);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStartSession = async () => {
    setLoading(true);
    setError(null);

    const result = await generateDailySession();
    if (result.error) {
      setError(result.error);
    } else if (result.session) {
      setSession(result.session);
    }

    setLoading(false);
  };

  // Session completed
  if (session?.status === "completed") {
    return (
      <SessionSummary
        newWords={session.new_words_learned}
        reviewed={session.words_reviewed}
        durationSeconds={session.duration_seconds}
        totalItems={session.total_items}
        completedItems={session.completed_items}
      />
    );
  }

  // Session in progress
  if (session?.status === "in_progress") {
    return <SessionContainer session={session} />;
  }

  // No session yet
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-xl border bg-card p-8 text-center">
      <div className="text-4xl">🎯</div>
      <h2 className="text-lg font-semibold">准备好了吗？</h2>
      <p className="text-sm text-muted-foreground">
        今日 Session 将包含复习卡片、新词学习和练习
      </p>
      {error && (
        <div className="flex flex-col items-center gap-2">
          <p className="text-sm text-destructive">{error}</p>
          <Button variant="outline" size="sm" onClick={handleStartSession} disabled={loading}>
            重试
          </Button>
        </div>
      )}
      <Button
        onClick={handleStartSession}
        disabled={loading}
        className="h-12 px-8 text-base"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            正在生成...
          </>
        ) : (
          "开始今日学习"
        )}
      </Button>
    </div>
  );
}
