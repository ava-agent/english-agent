"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  const router = useRouter();

  const handleGuestTrial = () => {
    // Set guest mode cookie (7 days)
    document.cookie = "guestMode=true; path=/; max-age=604800";
    router.push("/chat");
  };

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-background px-6">
      <div className="flex flex-col items-center gap-6 text-center">
        <div className="text-5xl">💬</div>
        <h1 className="text-2xl font-bold tracking-tight">
          English Learning Assistant
        </h1>
        <p className="max-w-sm text-muted-foreground">
          和 AI 伙伴模拟真实旅行场景对话，在聊天中自然学习英语。
          选择目的地、场景和角色，开始你的英语冒险。
        </p>
        <div className="flex w-full max-w-xs gap-3">
          <Link
            href="/login"
            className="flex-1 inline-flex h-11 items-center justify-center rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            登录
          </Link>
          <Button
            variant="outline"
            className="flex-1"
            onClick={handleGuestTrial}
          >
            免费试用
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          试用无需注册，对话数据仅保存在本地
        </p>
      </div>
    </div>
  );
}
