"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { updateSettings, type UserSettings } from "@/app/actions/settings";
import { publishDailyReport } from "@/app/actions/report";

interface SettingsClientProps {
  initialSettings: UserSettings;
  githubConfig: {
    configured: boolean;
    owner?: string;
    repo?: string;
  };
}

export function SettingsClient({ initialSettings, githubConfig }: SettingsClientProps) {
  const [settings, setSettings] = useState(initialSettings);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [reportMessage, setReportMessage] = useState<string | null>(null);
  const router = useRouter();

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    const result = await updateSettings(settings);
    if (result.success) {
      setMessage("设置已保存");
    } else {
      setMessage(result.error ?? "保存失败");
    }
    setSaving(false);
  };

  const handlePublishReport = async () => {
    setPublishing(true);
    setReportMessage(null);
    const result = await publishDailyReport();
    if (result.success) {
      setReportMessage(`已发布 ${result.date} 的学习报告到 GitHub`);
    } else {
      setReportMessage(result.error ?? "发布失败");
    }
    setPublishing(false);
  };

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">学习设置</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Daily new words */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">每日新词数量</p>
                <p className="text-xs text-muted-foreground">
                  每次 Session 学习的新词数
                </p>
              </div>
              <span className="text-sm font-semibold">
                {settings.daily_new_words}
              </span>
            </div>
            <input
              type="range"
              min="5"
              max="20"
              value={settings.daily_new_words}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  daily_new_words: Number(e.target.value),
                })
              }
              className="w-full"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>5</span>
              <span>20</span>
            </div>
          </div>

          {/* Session length */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Session 目标时长</p>
                <p className="text-xs text-muted-foreground">分钟</p>
              </div>
              <span className="text-sm font-semibold">
                {settings.session_length_minutes} 分钟
              </span>
            </div>
            <div className="flex gap-2">
              {[10, 15, 20, 30].map((min) => (
                <button
                  key={min}
                  onClick={() =>
                    setSettings({
                      ...settings,
                      session_length_minutes: min,
                    })
                  }
                  className={`flex-1 rounded-lg border py-2 text-sm font-medium transition-colors ${
                    settings.session_length_minutes === min
                      ? "border-primary bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  }`}
                >
                  {min}
                </button>
              ))}
            </div>
          </div>

          {/* Category weight */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">分类权重</p>
                <p className="text-xs text-muted-foreground">
                  旅游 vs 软件工程
                </p>
              </div>
              <span className="text-sm font-semibold">
                {Math.round(settings.travel_weight * 100)} :{" "}
                {Math.round((1 - settings.travel_weight) * 100)}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={settings.travel_weight * 100}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  travel_weight: Number(e.target.value) / 100,
                })
              }
              className="w-full"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>全部旅游</span>
              <span>均衡</span>
              <span>全部软工</span>
            </div>
          </div>

          {/* Save */}
          <Button onClick={handleSave} disabled={saving} className="w-full">
            {saving ? "保存中..." : "保存设置"}
          </Button>
          {message && (
            <p className="text-center text-sm text-muted-foreground">
              {message}
            </p>
          )}
        </CardContent>
      </Card>

      {/* GitHub Report */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">GitHub 学习报告</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-muted-foreground">
            每日学习完成后，自动将学习报告发布到 GitHub 仓库。也可以手动发布。
          </p>
          <div className="rounded-lg border p-3">
            <div className="flex items-center gap-2">
              <div
                className={`h-2 w-2 rounded-full ${
                  githubConfig.configured ? "bg-green-500" : "bg-yellow-500"
                }`}
              />
              <span className="text-sm">
                {githubConfig.configured
                  ? `已连接：${githubConfig.owner}/${githubConfig.repo}`
                  : "未配置"}
              </span>
            </div>
            {!githubConfig.configured && (
              <p className="mt-2 text-xs text-muted-foreground">
                请在 Vercel 环境变量中设置 GITHUB_TOKEN、GITHUB_REPO_OWNER 和 GITHUB_REPO_NAME
              </p>
            )}
          </div>
          <Button
            onClick={handlePublishReport}
            disabled={publishing || !githubConfig.configured}
            variant="outline"
            className="w-full"
          >
            {publishing ? "发布中..." : "手动发布今日报告"}
          </Button>
          {reportMessage && (
            <p className="text-center text-sm text-muted-foreground">
              {reportMessage}
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">账户</CardTitle>
        </CardHeader>
        <CardContent>
          <Button
            variant="destructive"
            onClick={handleSignOut}
            className="w-full"
          >
            退出登录
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
