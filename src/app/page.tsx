import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-background px-6">
      <div className="flex flex-col items-center gap-6 text-center">
        <div className="text-5xl">📚</div>
        <h1 className="text-2xl font-bold tracking-tight">
          English Learning Assistant
        </h1>
        <p className="max-w-sm text-muted-foreground">
          AI 驱动的英语学习助手，聚焦旅游英语和软件工程英语。
          每天 10-30 分钟，科学复习，轻松掌握。
        </p>
        <Link
          href="/login"
          className="inline-flex h-11 items-center justify-center rounded-lg bg-primary px-8 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          开始学习
        </Link>
      </div>
    </div>
  );
}
