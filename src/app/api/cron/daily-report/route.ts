import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { gatherReportData, generateReportMarkdown } from "@/lib/report-generator";
import { commitDailyReport } from "@/lib/github";

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

  const { data: profiles } = await supabase.from("profiles").select("id");
  if (!profiles || profiles.length === 0) {
    return NextResponse.json({ message: "No users found" });
  }

  const today = new Date().toISOString().slice(0, 10);
  const results: { userId: string; success: boolean; error?: string }[] = [];

  for (const profile of profiles) {
    try {
      const reportData = await gatherReportData(today, profile.id);
      if (!reportData) {
        results.push({ userId: profile.id, success: false, error: "No session" });
        continue;
      }

      const markdown = generateReportMarkdown(reportData);
      await commitDailyReport(today, markdown);
      results.push({ userId: profile.id, success: true });
    } catch (error) {
      console.error(`Failed to commit report for user ${profile.id}:`, error);
      results.push({ userId: profile.id, success: false, error: "Commit failed" });
    }
  }

  return NextResponse.json({ date: today, results });
}
