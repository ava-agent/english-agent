import { getTodaySession } from "@/app/actions/session";
import { createClient } from "@/lib/supabase/server";
import { LearnPageClient } from "./client";

export default async function LearnPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { session } = await getTodaySession();

  return (
    <div className="mx-auto max-w-lg px-4 pt-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold">今日学习</h1>
        <p className="text-sm text-muted-foreground">
          {user?.email}
        </p>
      </div>

      <LearnPageClient initialSession={session} />
    </div>
  );
}
