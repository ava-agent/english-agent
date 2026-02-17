"use server";

import { gatherReportData, generateReportMarkdown } from "@/lib/report-generator";
import { commitDailyReport } from "@/lib/github";

export async function getGitHubConfigStatus(): Promise<{
  configured: boolean;
  owner?: string;
  repo?: string;
}> {
  const token = process.env.GITHUB_TOKEN;
  const owner = process.env.GITHUB_REPO_OWNER;
  const repo = process.env.GITHUB_REPO_NAME;

  if (!token || !owner || !repo || token === "placeholder") {
    return { configured: false };
  }

  return { configured: true, owner, repo };
}

export async function publishDailyReport(date?: string): Promise<{
  success: boolean;
  error?: string;
  date?: string;
}> {
  const config = await getGitHubConfigStatus();
  if (!config.configured) {
    return { success: false, error: "GitHub 未配置。请在 Vercel 环境变量中设置 GITHUB_TOKEN、GITHUB_REPO_OWNER 和 GITHUB_REPO_NAME。" };
  }

  const targetDate = date ?? new Date().toISOString().slice(0, 10);

  try {
    const reportData = await gatherReportData(targetDate);
    if (!reportData) {
      return { success: false, error: `${targetDate} 没有学习记录，无法生成报告。` };
    }

    const markdown = generateReportMarkdown(reportData);
    await commitDailyReport(targetDate, markdown);

    return { success: true, date: targetDate };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "未知错误";
    return { success: false, error: `发布失败：${msg}` };
  }
}
