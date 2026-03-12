"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function Home() {
  const router = useRouter();

  const handleGuestTrial = () => {
    document.cookie = "guestMode=true; path=/; max-age=604800";
    router.push("/chat");
  };

  return (
    <div className="relative flex min-h-svh flex-col overflow-hidden bg-[#faf8f5]">
      {/* Subtle grain overlay */}
      <div className="pointer-events-none fixed inset-0 z-10 opacity-[0.03]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")" }} />

      {/* Hero section */}
      <div className="relative flex flex-1 flex-col items-center justify-center px-6 py-12 lg:flex-row lg:justify-between lg:px-16">
        {/* Left: Text content */}
        <div className="z-20 flex max-w-md flex-col items-center text-center lg:items-start lg:text-left">
          {/* Badge */}
          <div className="landing-fade-in mb-6 flex items-center gap-2 rounded-full border border-[#e8ddd0] bg-white/80 px-4 py-1.5 text-xs font-medium tracking-wide text-[#8b7355] backdrop-blur-sm" style={{ animationDelay: "0ms" }}>
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
            AI-Powered English Learning
          </div>

          {/* Title */}
          <h1 className="landing-fade-in text-[2.5rem] font-bold leading-[1.1] tracking-tight text-[#1a1a2e] lg:text-5xl" style={{ animationDelay: "80ms" }}>
            Travel the World,
            <br />
            <span className="bg-gradient-to-r from-[#2d8c8c] to-[#3ba5a5] bg-clip-text text-transparent">
              Speak English
            </span>
          </h1>

          {/* Subtitle */}
          <p className="landing-fade-in mt-5 text-base leading-relaxed text-[#6b6b80] lg:text-lg" style={{ animationDelay: "160ms" }}>
            和 AI 伙伴模拟真实旅行场景对话，
            <br className="hidden sm:block" />
            在聊天中自然学习英语。
          </p>

          {/* Feature pills */}
          <div className="landing-fade-in mt-6 flex flex-wrap justify-center gap-2 lg:justify-start" style={{ animationDelay: "240ms" }}>
            {[
              { icon: "🌏", text: "8 个目的地" },
              { icon: "🎭", text: "6 种场景" },
              { icon: "🤖", text: "3 位 AI 角色" },
            ].map((item) => (
              <span
                key={item.text}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#e8ddd0]/60 bg-white/60 px-3 py-1.5 text-xs font-medium text-[#555] backdrop-blur-sm"
              >
                {item.icon} {item.text}
              </span>
            ))}
          </div>

          {/* CTA buttons */}
          <div className="landing-fade-in mt-8 flex w-full max-w-xs gap-3" style={{ animationDelay: "320ms" }}>
            <Link
              href="/login"
              className="flex-1 inline-flex h-12 items-center justify-center rounded-xl bg-[#1a1a2e] px-6 text-sm font-semibold text-white shadow-lg shadow-[#1a1a2e]/20 transition-all hover:bg-[#2a2a3e] hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
            >
              登录
            </Link>
            <Button
              variant="outline"
              className="flex-1 h-12 rounded-xl border-[#d4c5b0] bg-white/80 font-semibold text-[#1a1a2e] shadow-sm backdrop-blur-sm transition-all hover:bg-white hover:shadow-md hover:-translate-y-0.5 active:translate-y-0"
              onClick={handleGuestTrial}
            >
              免费试用
            </Button>
          </div>

          {/* Fine print */}
          <p className="landing-fade-in mt-4 text-xs text-[#999]" style={{ animationDelay: "400ms" }}>
            试用无需注册，对话数据仅保存在本地
          </p>
        </div>

        {/* Right: Hero illustration */}
        <div className="landing-fade-in relative mt-10 w-full max-w-lg lg:mt-0 lg:max-w-xl" style={{ animationDelay: "200ms" }}>
          <div className="relative aspect-[7/4]">
            <Image
              src="/hero-illustration.png"
              alt="Travel the world and learn English"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>
      </div>

      {/* Bottom features bar */}
      <div className="landing-fade-in relative z-20 border-t border-[#e8ddd0]/50 bg-white/40 backdrop-blur-md" style={{ animationDelay: "500ms" }}>
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-x-8 gap-y-3 px-6 py-4 text-xs text-[#888]">
          <span className="flex items-center gap-1.5">
            <svg className="h-3.5 w-3.5 text-[#2d8c8c]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
            实时流式对话
          </span>
          <span className="flex items-center gap-1.5">
            <svg className="h-3.5 w-3.5 text-[#c08552]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
            FSRS 智能复习
          </span>
          <span className="flex items-center gap-1.5">
            <svg className="h-3.5 w-3.5 text-[#e07a5f]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
            多渠道提醒
          </span>
          <span className="flex items-center gap-1.5">
            <svg className="h-3.5 w-3.5 text-[#81b29a]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
            学习数据分析
          </span>
        </div>
      </div>
    </div>
  );
}
