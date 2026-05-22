import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI 英歌漫剧内容生产工作台",
  description: "AI 英歌漫剧内容生产工作台前端静态原型",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
