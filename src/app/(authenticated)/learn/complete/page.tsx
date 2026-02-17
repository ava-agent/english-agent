export default function SessionCompletePage() {
  return (
    <div className="mx-auto max-w-lg px-4 pt-6">
      <div className="flex flex-col items-center justify-center gap-4 rounded-xl border bg-card p-8 text-center">
        <div className="text-5xl">🎉</div>
        <h1 className="text-xl font-bold">今日学习完成！</h1>
        <p className="text-sm text-muted-foreground">
          学习报告将在此显示
        </p>
      </div>
    </div>
  );
}
