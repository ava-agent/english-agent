import { createClient } from "@/lib/supabase/server";
import { ReviewPageClient } from "./client";

export default async function ReviewPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // Get due review cards
  const now = new Date().toISOString();
  const { data: dueCards, count } = await supabase
    .from("user_cards")
    .select("id, state, stability, vocabulary(id, word, pronunciation, definition, definition_zh, category, subcategory, example_sentences, is_phrase)", { count: "exact" })
    .eq("user_id", user.id)
    .lte("due", now)
    .neq("state", 0)
    .order("due", { ascending: true })
    .limit(50);

  return (
    <div className="mx-auto max-w-lg px-4 pt-6">
      <h1 className="mb-2 text-xl font-bold">快速复习</h1>
      <p className="mb-4 text-sm text-muted-foreground">
        {count ?? 0} 个单词需要复习
      </p>

      <ReviewPageClient dueCards={(dueCards ?? []) as unknown as Parameters<typeof ReviewPageClient>[0]["dueCards"]} />
    </div>
  );
}
