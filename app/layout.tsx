import type { Metadata } from "next";
import Navigation from "@/components/Navigation";
import "./globals.css";

export const metadata: Metadata = {
  title: "PM123 - Polymarket 中文数据分析平台",
  description: "实时预测市场数据、分析工具和交易者排行榜",
  icons: {
    icon: "/favicon.svg",
    apple: "/logo.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body style={{ fontFamily: "var(--font-open-sauce)" }}>
        <Navigation />
        {children}
      </body>
    </html>
  );
}
