"use client";

import { Progress } from "@/components/ui/progress";

interface SessionProgressProps {
  current: number;
  total: number;
  newWords: number;
  reviewed: number;
}

export function SessionProgress({
  current,
  total,
  newWords,
  reviewed,
}: SessionProgressProps) {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          {current} / {total}
        </span>
        <div className="flex gap-3">
          <span>新词 {newWords}</span>
          <span>复习 {reviewed}</span>
        </div>
      </div>
      <Progress value={percentage} className="h-2" />
    </div>
  );
}
