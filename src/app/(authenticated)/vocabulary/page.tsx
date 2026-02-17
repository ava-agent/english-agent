import { createClient } from "@/lib/supabase/server";
import { VocabularyList } from "@/components/vocabulary/vocab-list";

export default async function VocabularyPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // Get all vocabulary the user has encountered, with their card state
  const { data: userCards } = await supabase
    .from("user_cards")
    .select(
      `
      id,
      state,
      stability,
      due,
      reps,
      vocabulary (
        id,
        word,
        pronunciation,
        definition,
        definition_zh,
        category,
        subcategory,
        is_phrase
      )
    `
    )
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  return (
    <div className="mx-auto max-w-lg px-4 pt-6">
      <h1 className="mb-4 text-xl font-bold">词汇库</h1>
      <VocabularyList cards={(userCards ?? []) as unknown as Parameters<typeof VocabularyList>[0]["cards"]} />
    </div>
  );
}
