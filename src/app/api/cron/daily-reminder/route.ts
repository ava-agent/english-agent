import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendPushNotification } from "@/lib/push";

export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Get all push subscriptions
  const { data: subscriptions } = await supabase
    .from("push_subscriptions")
    .select("subscription");

  if (!subscriptions || subscriptions.length === 0) {
    return NextResponse.json({ message: "No subscriptions" });
  }

  let sent = 0;
  for (const sub of subscriptions) {
    try {
      await sendPushNotification(sub.subscription, {
        title: "English Learning Time!",
        body: "每日英语学习时间到了，来学习新单词吧！",
        url: "/learn",
      });
      sent++;
    } catch (error) {
      console.error("Failed to send push:", error);
    }
  }

  return NextResponse.json({ sent });
}
