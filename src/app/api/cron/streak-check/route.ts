import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Get all users
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, streak_freeze_remaining");

  if (!profiles) {
    return NextResponse.json({ message: "No profiles" });
  }

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().slice(0, 10);

  for (const profile of profiles) {
    // Check if they had a check-in yesterday
    const { data: checkin } = await supabase
      .from("daily_checkins")
      .select("id")
      .eq("user_id", profile.id)
      .eq("checkin_date", yesterdayStr)
      .single();

    if (!checkin && profile.streak_freeze_remaining > 0) {
      // Use streak freeze - create a placeholder check-in
      await supabase.from("daily_checkins").insert({
        user_id: profile.id,
        checkin_date: yesterdayStr,
        words_learned: 0,
        words_reviewed: 0,
        duration_seconds: 0,
        streak_count: 0,
        used_freeze: true,
      });

      await supabase
        .from("profiles")
        .update({
          streak_freeze_remaining: profile.streak_freeze_remaining - 1,
        })
        .eq("id", profile.id);
    }
  }

  return NextResponse.json({ success: true });
}
