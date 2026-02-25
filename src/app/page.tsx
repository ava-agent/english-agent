import Link from "next/link";

export default function Home() {
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
        <Link
          href="/login"
          className="inline-flex h-11 items-center justify-center rounded-lg bg-primary px-8 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          开始对话
        </Link>
      </div>
    </div>
  );
}
