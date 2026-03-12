"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Suspense } from "react";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const confirmationFailed = searchParams.get("error") === "confirmation_failed";
  const [error, setError] = useState<string | null>(
    confirmationFailed ? "邮箱确认链接无效或已过期，请重新注册。" : null
  );
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const supabase = createClient();

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/confirm`,
        },
      });
      if (error) {
        setError(error.message);
      } else {
        setMessage("注册成功！请检查邮箱确认链接。");
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setError(error.message);
      } else {
        router.push("/chat");
        router.refresh();
      }
    }

    setLoading(false);
  };

  return (
    <div className="flex min-h-svh items-center justify-center bg-[#faf8f5] px-6">
      {/* Subtle grain */}
      <div className="pointer-events-none fixed inset-0 z-0 opacity-[0.03]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")" }} />

      <div className="landing-fade-in relative z-10 w-full max-w-sm">
        <div className="rounded-2xl border border-[#e8ddd0]/60 bg-white/80 p-8 shadow-xl shadow-[#1a1a2e]/5 backdrop-blur-md">
          {/* Header */}
          <div className="mb-6 text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-[#2d8c8c]/10 to-[#3ba5a5]/10 text-3xl">
              🌏
            </div>
            <h1 className="text-xl font-bold text-[#1a1a2e]">
              {isSignUp ? "创建账户" : "欢迎回来"}
            </h1>
            <p className="mt-1 text-xs text-[#999]">
              {isSignUp ? "注册开始你的英语学习之旅" : "登录继续学习"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <Input
              type="email"
              placeholder="邮箱地址"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-11 rounded-xl border-[#e8ddd0] bg-[#faf8f5]/50 text-sm placeholder:text-[#bbb] focus-visible:border-[#2d8c8c] focus-visible:ring-[#2d8c8c]/20"
            />
            <Input
              type="password"
              placeholder="密码"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="h-11 rounded-xl border-[#e8ddd0] bg-[#faf8f5]/50 text-sm placeholder:text-[#bbb] focus-visible:border-[#2d8c8c] focus-visible:ring-[#2d8c8c]/20"
            />
            {error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p>
            )}
            {message && (
              <p className="rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-600">{message}</p>
            )}
            <Button
              type="submit"
              disabled={loading}
              className="mt-1 h-11 w-full rounded-xl bg-[#1a1a2e] font-semibold shadow-lg shadow-[#1a1a2e]/15 transition-all hover:bg-[#2a2a3e] hover:shadow-xl"
            >
              {loading ? "请稍候..." : isSignUp ? "注册" : "登录"}
            </Button>
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError(null);
                setMessage(null);
              }}
              className="text-center text-xs text-[#999] transition-colors hover:text-[#2d8c8c]"
            >
              {isSignUp ? "已有账户？去登录" : "没有账户？去注册"}
            </button>

            <div className="relative my-3">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-[#e8ddd0]/60" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white/80 px-3 text-[#bbb]">或者</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="h-11 w-full rounded-xl border-[#d4c5b0] bg-transparent text-sm font-medium text-[#6b6b80] transition-all hover:bg-[#faf8f5] hover:text-[#1a1a2e]"
              onClick={() => {
                document.cookie = "guestMode=true; path=/; max-age=604800";
                router.push("/chat");
              }}
            >
              免费试用，无需注册
            </Button>
          </form>
        </div>

        <p className="mt-4 text-center text-[10px] text-[#bbb]">
          登录即表示同意服务条款和隐私政策
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
