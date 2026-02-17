"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";

interface SessionSummaryProps {
  newWords: number;
  reviewed: number;
  durationSeconds: number;
  totalItems: number;
  completedItems: number;
}

export function SessionSummary({
  newWords,
  reviewed,
  durationSeconds,
  totalItems,
  completedItems,
}: SessionSummaryProps) {
  const minutes = Math.floor(durationSeconds / 60);
  const seconds = durationSeconds % 60;
  const completionRate = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="text-5xl">🎉</div>
      <h1 className="text-xl font-bold">
        {completionRate >= 100 ? "今日学习完成！" : "学习进度已保存"}
      </h1>

      <div className="grid w-full grid-cols-2 gap-3">
        <div className="rounded-xl border bg-card p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">{newWords}</p>
          <p className="text-xs text-muted-foreground">新学单词</p>
        </div>
        <div className="rounded-xl border bg-card p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{reviewed}</p>
          <p className="text-xs text-muted-foreground">复习单词</p>
        </div>
        <div className="rounded-xl border bg-card p-4 text-center">
          <p className="text-2xl font-bold">
            {minutes}:{seconds.toString().padStart(2, "0")}
          </p>
          <p className="text-xs text-muted-foreground">学习时长</p>
        </div>
        <div className="rounded-xl border bg-card p-4 text-center">
          <p className="text-2xl font-bold">{completionRate}%</p>
          <p className="text-xs text-muted-foreground">完成率</p>
        </div>
      </div>

      <div className="flex w-full gap-3">
        <Link href="/dashboard" className="flex-1">
          <Button variant="outline" className="h-12 w-full text-base">
            查看面板
          </Button>
        </Link>
        <Link href="/learn" className="flex-1">
          <Button className="h-12 w-full text-base">返回</Button>
        </Link>
      </div>
    </div>
  );
}
