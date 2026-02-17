import { createClient } from "@supabase/supabase-js";
import { getMasteryLevel } from "@/lib/srs";

interface ReportData {
  date: string;
  session: {
    status: string;
    new_words_learned: number;
    words_reviewed: number;
    duration_seconds: number;
    completed_items: number;
    total_items: number;
  } | null;
  streak: number;
  masteryDist: Record<string, number>;
  categoryProgress: Record<string, { total: number; mastered: number }>;
  newWords: { word: string; category: string; definition: string }[];
  reviewedWords: { word: string; rating: number; next_review: string }[];
}

export async function gatherReportData(date: string): Promise<ReportData | null> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Get all users (single user app, but iterate just in case)
  const { data: profiles } = await supabase.from("profiles").select("id");
  if (!profiles || profiles.length === 0) return null;

  const userId = profiles[0].id;

  // Get today's session
  const { data: session } = await supabase
    .from("sessions")
    .select("*")
    .eq("user_id", userId)
    .eq("session_date", date)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (!session) return null;

  // Get today's check-in
  const { data: checkin } = await supabase
    .from("daily_checkins")
    .select("streak_count")
    .eq("user_id", userId)
    .eq("checkin_date", date)
    .single();

  // Get today's review logs with vocabulary
  const { data: reviewLogs } = await supabase
    .from("review_logs")
    .select("rating, vocabulary_id, state_before, scheduled_days, vocabulary(word, category, definition)")
    .eq("session_id", session.id);

  // Get mastery distribution
  const { data: cards } = await supabase
    .from("user_cards")
    .select("state, stability, vocabulary(category)")
    .eq("user_id", userId);

  const masteryDist: Record<string, number> = {
    new: 0, learning: 0, familiar: 0, mastered: 0, relearning: 0,
  };
  const categoryProgress: Record<string, { total: number; mastered: number }> = {
    travel: { total: 0, mastered: 0 },
    software: { total: 0, mastered: 0 },
  };

  for (const card of cards ?? []) {
    const level = getMasteryLevel(card.state, card.stability);
    masteryDist[level]++;
    const cat = (card.vocabulary as { category?: string } | null)?.category;
    if (cat && categoryProgress[cat]) {
      categoryProgress[cat].total++;
      if (level === "mastered") categoryProgress[cat].mastered++;
    }
  }

  // Separate new words and reviewed words
  const newWords: ReportData["newWords"] = [];
  const reviewedWords: ReportData["reviewedWords"] = [];

  for (const log of reviewLogs ?? []) {
    const vocab = log.vocabulary as { word?: string; category?: string; definition?: string } | null;
    if (!vocab) continue;

    if (log.state_before === 0) {
      newWords.push({
        word: vocab.word ?? "",
        category: vocab.category ?? "",
        definition: vocab.definition ?? "",
      });
    } else {
      const nextDate = new Date();
      nextDate.setDate(nextDate.getDate() + (log.scheduled_days ?? 0));
      reviewedWords.push({
        word: vocab.word ?? "",
        rating: log.rating,
        next_review: nextDate.toISOString().slice(5, 10),
      });
    }
  }

  return {
    date,
    session: session ? {
      status: session.status,
      new_words_learned: session.new_words_learned,
      words_reviewed: session.words_reviewed,
      duration_seconds: session.duration_seconds,
      completed_items: session.completed_items,
      total_items: session.total_items,
    } : null,
    streak: checkin?.streak_count ?? 0,
    masteryDist,
    categoryProgress,
    newWords,
    reviewedWords,
  };
}

export function generateReportMarkdown(data: ReportData): string {
  const { date, session, streak, masteryDist, categoryProgress, newWords, reviewedWords } = data;
  const dayOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][
    new Date(date).getDay()
  ];

  const duration = session
    ? `${Math.floor(session.duration_seconds / 60)}m ${session.duration_seconds % 60}s`
    : "N/A";

  const ratingLabel = (r: number) =>
    ({ 1: "Again", 2: "Hard", 3: "Good", 4: "Easy" })[r] ?? "Unknown";

  let md = `# English Learning Report - ${date} (${dayOfWeek})\n\n`;

  md += `## Session Summary\n`;
  md += `- **Duration**: ${duration}\n`;
  md += `- **Status**: ${session?.status ?? "N/A"}\n`;
  md += `- **Progress**: ${session?.completed_items ?? 0}/${session?.total_items ?? 0} items\n`;
  md += `- **Streak**: ${streak} days\n\n`;

  if (newWords.length > 0) {
    md += `## New Words Learned (${newWords.length})\n`;
    md += `| Word | Category | Definition |\n`;
    md += `|------|----------|------------|\n`;
    for (const w of newWords) {
      md += `| ${w.word} | ${w.category} | ${w.definition.slice(0, 60)}${w.definition.length > 60 ? "..." : ""} |\n`;
    }
    md += `\n`;
  }

  if (reviewedWords.length > 0) {
    md += `## Words Reviewed (${reviewedWords.length})\n`;
    md += `| Word | Rating | Next Review |\n`;
    md += `|------|--------|-------------|\n`;
    for (const w of reviewedWords) {
      md += `| ${w.word} | ${ratingLabel(w.rating)} | ${w.next_review} |\n`;
    }
    md += `\n`;
  }

  md += `## Mastery Progress\n`;
  md += `| New | Learning | Familiar | Mastered | Relearning |\n`;
  md += `|-----|----------|----------|----------|------------|\n`;
  md += `| ${masteryDist.new} | ${masteryDist.learning} | ${masteryDist.familiar} | ${masteryDist.mastered} | ${masteryDist.relearning} |\n\n`;

  md += `## Category Breakdown\n`;
  md += `- **Travel English**: ${categoryProgress.travel.total} words (${categoryProgress.travel.mastered} mastered)\n`;
  md += `- **Software Engineering**: ${categoryProgress.software.total} words (${categoryProgress.software.mastered} mastered)\n\n`;

  md += `---\n*Generated automatically by English Learning Assistant*\n`;

  return md;
}
