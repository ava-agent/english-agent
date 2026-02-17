"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { updateSettings, type UserSettings } from "@/app/actions/settings";
import { publishDailyReport } from "@/app/actions/report";
import { sendTestNotification } from "@/app/actions/notification";

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
  const [testingTg, setTestingTg] = useState(false);
  const [testingSc, setTestingTc] = useState(false);
  const [notifyMessage, setNotifyMessage] = useState<string | null>(null);
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

  const handleTestNotification = async (channel: "telegram" | "serverchan") => {
    const setLoading = channel === "telegram" ? setTestingTg : setTestingTc;
    setLoading(true);
    setNotifyMessage(null);

    const config =
      channel === "telegram"
        ? { chatId: settings.telegram_chat_id ?? "" }
        : { sendkey: settings.serverchan_sendkey ?? "" };

    const result = await sendTestNotification(channel, config);
    if (result.success) {
      setNotifyMessage(`${channel === "telegram" ? "Telegram" : "Server酱"} 测试通知已发送`);
    } else {
      setNotifyMessage(result.error ?? "发送失败");
    }
    setLoading(false);
  };

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <div className="space-y-4">
      {/* 学习设置 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">学习设置</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div>
            <div className="mb-2 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">每日新词数量</p>
                <p className="text-xs text-muted-foreground">每次 Session 学习的新词数</p>
              </div>
              <span className="text-sm font-semibold">{settings.daily_new_words}</span>
            </div>
            <input
              type="range"
              min="5"
              max="20"
              value={settings.daily_new_words}
              onChange={(e) =>
                setSettings({ ...settings, daily_new_words: Number(e.target.value) })
              }
              className="w-full"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>5</span>
              <span>20</span>
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Session 目标时长</p>
                <p className="text-xs text-muted-foreground">分钟</p>
              </div>
              <span className="text-sm font-semibold">{settings.session_length_minutes} 分钟</span>
            </div>
            <div className="flex gap-2">
              {[10, 15, 20, 30].map((min) => (
                <button
                  key={min}
                  onClick={() => setSettings({ ...settings, session_length_minutes: min })}
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

          <div>
            <div className="mb-2 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">分类权重</p>
                <p className="text-xs text-muted-foreground">旅游 vs 软件工程</p>
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
                setSettings({ ...settings, travel_weight: Number(e.target.value) / 100 })
              }
              className="w-full"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>全部旅游</span>
              <span>均衡</span>
              <span>全部软工</span>
            </div>
          </div>

          <Button onClick={handleSave} disabled={saving} className="w-full">
            {saving ? "保存中..." : "保存设置"}
          </Button>
          {message && (
            <p className="text-center text-sm text-muted-foreground">{message}</p>
          )}
        </CardContent>
      </Card>

      {/* 消息通知 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">消息通知</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* 通知时间 */}
          <div>
            <p className="text-sm font-medium mb-1">提醒时间</p>
            <div className="flex items-center gap-2">
              <select
                value={settings.notification_hour}
                onChange={(e) =>
                  setSettings({ ...settings, notification_hour: Number(e.target.value) })
                }
                className="flex-1 rounded-lg border bg-background px-3 py-2 text-sm"
              >
                {Array.from({ length: 24 }, (_, i) => (
                  <option key={i} value={i}>
                    {String(i).padStart(2, "0")}:00
                  </option>
                ))}
              </select>
              <span className="text-xs text-muted-foreground">({settings.timezone})</span>
            </div>
          </div>

          {/* Telegram */}
          <div className="rounded-lg border p-3 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Telegram Bot</p>
                <p className="text-xs text-muted-foreground">通过 Telegram 机器人推送</p>
              </div>
              <Switch
                checked={settings.telegram_enabled}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, telegram_enabled: checked })
                }
              />
            </div>
            {settings.telegram_enabled && (
              <>
                <Input
                  placeholder="Chat ID（如 123456789）"
                  value={settings.telegram_chat_id ?? ""}
                  onChange={(e) =>
                    setSettings({ ...settings, telegram_chat_id: e.target.value || null })
                  }
                />
                <p className="text-[11px] text-muted-foreground">
                  1. 在 Telegram 搜索 Bot 并发送 /start{"\n"}
                  2. 访问 @userinfobot 获取你的 Chat ID
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleTestNotification("telegram")}
                  disabled={testingTg || !settings.telegram_chat_id}
                >
                  {testingTg ? "发送中..." : "发送测试通知"}
                </Button>
              </>
            )}
          </div>

          {/* Server酱 */}
          <div className="rounded-lg border p-3 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Server酱（微信）</p>
                <p className="text-xs text-muted-foreground">通过 Server酱 推送到微信</p>
              </div>
              <Switch
                checked={settings.serverchan_enabled}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, serverchan_enabled: checked })
                }
              />
            </div>
            {settings.serverchan_enabled && (
              <>
                <Input
                  type="password"
                  placeholder="SendKey"
                  value={settings.serverchan_sendkey ?? ""}
                  onChange={(e) =>
                    setSettings({ ...settings, serverchan_sendkey: e.target.value || null })
                  }
                />
                <p className="text-[11px] text-muted-foreground">
                  前往 sct.ftqq.com 登录后获取 SendKey
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleTestNotification("serverchan")}
                  disabled={testingSc || !settings.serverchan_sendkey}
                >
                  {testingSc ? "发送中..." : "发送测试通知"}
                </Button>
              </>
            )}
          </div>

          {notifyMessage && (
            <p className="text-center text-sm text-muted-foreground">{notifyMessage}</p>
          )}

          <Button onClick={handleSave} disabled={saving} variant="outline" className="w-full">
            {saving ? "保存中..." : "保存通知设置"}
          </Button>
        </CardContent>
      </Card>

      {/* GitHub 学习报告 */}
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
            <p className="text-center text-sm text-muted-foreground">{reportMessage}</p>
          )}
        </CardContent>
      </Card>

      {/* 账户 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">账户</CardTitle>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" onClick={handleSignOut} className="w-full">
            退出登录
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
