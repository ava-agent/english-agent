import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "English Learning Assistant",
    template: "%s | English Learning Assistant",
  },
  description: "AI 驱动的英语学习助手 - 旅游英语 & 软件工程英语",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/icon-192x192.png",
    apple: "/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "EnglishAI",
  },
  openGraph: {
    type: "website",
    title: "English Learning Assistant",
    description: "AI 驱动的英语学习助手 - 旅游英语 & 软件工程英语",
    siteName: "EnglishAI",
    locale: "zh_CN",
  },
  twitter: {
    card: "summary",
    title: "English Learning Assistant",
    description: "AI 驱动的英语学习助手 - 旅游英语 & 软件工程英语",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#09090b",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
