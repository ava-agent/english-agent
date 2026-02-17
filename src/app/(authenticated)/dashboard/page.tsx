import { createClient } from "@/lib/supabase/server";
import { getMasteryLevel, getMasteryDisplay } from "@/lib/srs";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // Fetch stats in parallel
  const [cardsResult, checkinsResult, vocabCountResult] = await Promise.all([
    supabase
      .from("user_cards")
      .select("state, stability, vocabulary(category)")
      .eq("user_id", user.id),
    supabase
      .from("daily_checkins")
      .select("checkin_date, words_learned, words_reviewed, duration_seconds, streak_count")
      .eq("user_id", user.id)
      .order("checkin_date", { ascending: false })
      .limit(30),
    supabase
      .from("vocabulary")
      .select("id", { count: "exact", head: true }),
  ]);

  const cards = cardsResult.data ?? [];
  const checkins = checkinsResult.data ?? [];
  const totalVocab = vocabCountResult.count ?? 0;

  // Calculate mastery distribution
  const masteryDist: Record<string, number> = {
    new: 0,
    learning: 0,
    familiar: 0,
    mastered: 0,
    relearning: 0,
  };
  const categoryProgress: Record<string, { total: number; mastered: number }> =
    {
      travel: { total: 0, mastered: 0 },
      software: { total: 0, mastered: 0 },
    };

  for (const card of cards) {
    const level = getMasteryLevel(card.state, card.stability);
    masteryDist[level] = (masteryDist[level] ?? 0) + 1;

    const cat = (card.vocabulary as { category?: string } | null)?.category;
    if (cat && categoryProgress[cat]) {
      categoryProgress[cat].total++;
      if (level === "mastered") categoryProgress[cat].mastered++;
    }
  }

  // Current streak
  const currentStreak = checkins.length > 0 ? checkins[0].streak_count : 0;

  // 7-day activity
  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    const checkin = checkins.find((c) => c.checkin_date === dateStr);
    last7Days.push({
      date: dateStr,
      day: ["日", "一", "二", "三", "四", "五", "六"][d.getDay()],
      active: !!checkin,
      words: (checkin?.words_learned ?? 0) + (checkin?.words_reviewed ?? 0),
    });
  }

  const totalLearned = cards.length;
  const totalMastered = masteryDist.mastered;

  return (
    <div className="mx-auto max-w-lg px-4 pt-6">
      <h1 className="mb-4 text-xl font-bold">学习面板</h1>

      <div className="grid gap-4">
        {/* Streak */}
        <div className="rounded-xl border bg-card p-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🔥</span>
            <div>
              <p className="text-2xl font-bold">{currentStreak}</p>
              <p className="text-xs text-muted-foreground">连续学习天数</p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-xl border bg-card p-4">
            <p className="text-2xl font-bold">{totalLearned}</p>
            <p className="text-xs text-muted-foreground">已学单词</p>
          </div>
          <div className="rounded-xl border bg-card p-4">
            <p className="text-2xl font-bold">{totalMastered}</p>
            <p className="text-xs text-muted-foreground">已掌握</p>
          </div>
        </div>

        {/* 7-Day Activity */}
        <div className="rounded-xl border bg-card p-4">
          <h2 className="mb-3 text-sm font-semibold">本周活动</h2>
          <div className="flex justify-between">
            {last7Days.map((day) => (
              <div key={day.date} className="flex flex-col items-center gap-1">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-md text-xs font-medium ${
                    day.active
                      ? "bg-green-500 text-white"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {day.active ? day.words : "-"}
                </div>
                <span className="text-[10px] text-muted-foreground">
                  {day.day}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Mastery Distribution */}
        <div className="rounded-xl border bg-card p-4">
          <h2 className="mb-3 text-sm font-semibold">掌握度分布</h2>
          <div className="flex gap-2">
            {Object.entries(masteryDist).map(([level, count]) => {
              const display = getMasteryDisplay(level);
              return (
                <div key={level} className="flex-1 text-center">
                  <p className="text-lg font-bold">{count}</p>
                  <p
                    className={`rounded-md px-1 py-0.5 text-[10px] font-medium ${display.color}`}
                  >
                    {display.label}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Category Progress */}
        <div className="rounded-xl border bg-card p-4">
          <h2 className="mb-3 text-sm font-semibold">分类进度</h2>
          <div className="space-y-3">
            <div>
              <div className="mb-1 flex justify-between text-xs">
                <span>旅游英语</span>
                <span className="text-muted-foreground">
                  {categoryProgress.travel.total} 已学
                </span>
              </div>
              <div className="h-2 rounded-full bg-muted">
                <div
                  className="h-2 rounded-full bg-blue-500 transition-all"
                  style={{
                    width: `${totalVocab > 0 ? (categoryProgress.travel.total / totalVocab) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
            <div>
              <div className="mb-1 flex justify-between text-xs">
                <span>软件工程英语</span>
                <span className="text-muted-foreground">
                  {categoryProgress.software.total} 已学
                </span>
              </div>
              <div className="h-2 rounded-full bg-muted">
                <div
                  className="h-2 rounded-full bg-green-500 transition-all"
                  style={{
                    width: `${totalVocab > 0 ? (categoryProgress.software.total / totalVocab) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
