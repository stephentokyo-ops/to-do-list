import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "KETTEI AI | 散らばった資料を、社長が判断できる1枚に。",
  description:
    "メール、議事録、PDF、Excelを投入するだけ。事実・論点・選択肢・リスク・次の行動を整理し、経営判断に使える意思決定メモをAIが作成します。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ja"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-slate-50 text-slate-900">
        <Navbar />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
          <p>
            <a href="/terms" className="underline hover:text-slate-700">
              利用規約
            </a>{" "}
            ・{" "}
            <a href="/privacy" className="underline hover:text-slate-700">
              プライバシーポリシー
            </a>
          </p>
          <p className="mt-2">
            AI出力は法務・税務・労務等の専門家判断を代替するものではありません。
          </p>
          <p className="mt-2">&copy; {new Date().getFullYear()} KETTEI AI</p>
        </footer>
      </body>
    </html>
  );
}
