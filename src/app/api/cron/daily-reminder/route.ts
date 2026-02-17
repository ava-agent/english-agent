import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendNotificationToUser } from "@/lib/notifications";
import { buildDailyReminderPayload } from "@/lib/notifications/messages";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: profiles } = await supabase.from("profiles").select("id");

  if (!profiles || profiles.length === 0) {
    return NextResponse.json({ message: "No users" });
  }

  const results = [];

  for (const profile of profiles) {
    try {
      const { data: streakData } = await supabase.rpc("get_current_streak", {
        p_user_id: profile.id,
      });

      const { count: dueCount } = await supabase
        .from("user_cards")
        .select("*", { count: "exact", head: true })
        .eq("user_id", profile.id)
        .lte("due", new Date().toISOString());

      const payload = buildDailyReminderPayload({
        streak: streakData ?? 0,
        dueCount: dueCount ?? 0,
      });

      const channelResults = await sendNotificationToUser(profile.id, payload);
      results.push({ userId: profile.id, channels: channelResults });
    } catch (error) {
      console.error(`Failed to notify user ${profile.id}:`, error);
      results.push({ userId: profile.id, error: String(error) });
    }
  }

  return NextResponse.json({ results });
}
