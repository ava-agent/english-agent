import { getSettings } from "@/app/actions/settings";
import { getGitHubConfigStatus } from "@/app/actions/report";
import { SettingsClient } from "./client";

export default async function SettingsPage() {
  const [settings, githubConfig] = await Promise.all([
    getSettings(),
    getGitHubConfigStatus(),
  ]);

  return (
    <div className="mx-auto max-w-lg px-4 pt-6">
      <h1 className="mb-4 text-xl font-bold">设置</h1>
      <SettingsClient
        initialSettings={
          settings ?? {
            daily_new_words: 10,
            session_length_minutes: 20,
            travel_weight: 0.5,
            notification_hour: 9,
            timezone: "Asia/Shanghai",
          }
        }
        githubConfig={githubConfig}
      />
    </div>
  );
}
