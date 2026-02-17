export interface NotificationPayload {
  title: string;
  body: string;
  markdown?: string;
  url?: string;
}

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://english-agent.vercel.app";

export function buildDailyReminderPayload(stats?: {
  streak: number;
  dueCount: number;
}): NotificationPayload {
  const streakLine = stats
    ? `\n当前连续学习: ${stats.streak} 天\n待复习单词: ${stats.dueCount} 个`
    : "";

  const body = `每日英语学习时间到了！来学习新单词吧！${streakLine}`;

  const markdown =
    `## 每日学习提醒\n\n${body}\n\n[开始学习 >>](${appUrl}/learn)`;

  return {
    title: "English Learning Time!",
    body,
    markdown,
    url: "/learn",
  };
}

export function buildSessionCompletePayload(stats: {
  newWords: number;
  reviewed: number;
  durationSeconds: number;
  streak: number;
}): NotificationPayload {
  const minutes = Math.floor(stats.durationSeconds / 60);
  const seconds = stats.durationSeconds % 60;

  const body =
    `今日学习完成！\n` +
    `新学单词: ${stats.newWords}\n` +
    `复习单词: ${stats.reviewed}\n` +
    `学习时长: ${minutes}分${seconds}秒\n` +
    `连续天数: ${stats.streak} 天`;

  const markdown =
    `## 学习完成报告\n\n` +
    `| 指标 | 数值 |\n|------|------|\n` +
    `| 新学单词 | ${stats.newWords} |\n` +
    `| 复习单词 | ${stats.reviewed} |\n` +
    `| 学习时长 | ${minutes}分${seconds}秒 |\n` +
    `| 连续天数 | ${stats.streak} 天 |\n`;

  return {
    title: "学习完成！",
    body,
    markdown,
    url: "/dashboard",
  };
}
