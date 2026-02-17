import { NextRequest, NextResponse } from "next/server";
import { gatherReportData, generateReportMarkdown } from "@/lib/report-generator";
import { commitDailyReport } from "@/lib/github";

export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const today = new Date().toISOString().slice(0, 10);

  const reportData = await gatherReportData(today);
  if (!reportData) {
    return NextResponse.json({ message: "No session today, skipping report" });
  }

  const markdown = generateReportMarkdown(reportData);

  try {
    await commitDailyReport(today, markdown);
    return NextResponse.json({ success: true, date: today });
  } catch (error) {
    console.error("Failed to commit report:", error);
    return NextResponse.json(
      { error: "Failed to commit report" },
      { status: 500 }
    );
  }
}
