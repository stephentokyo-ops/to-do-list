import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // pdf-parse(内部でpdfjs-distのworkerスクリプトを相対パスで動的読み込みする)を
  // サーバーバンドルの対象から除外し、node_modulesから素のまま実行させる。
  // バンドルに含めるとworkerファイルの相対配置が崩れ、PDF抽出が失敗する。
  // @sparticuz/chromiumも同様に、同梱バイナリ(bin/*.br)をfsで動的に読むため除外する。
  serverExternalPackages: ["pdf-parse", "pdfjs-dist", "@sparticuz/chromium"],
  // Vercel等サーバーレス環境向けのPDF出力(src/lib/export/pdf.ts)で使用するChromiumバイナリと
  // 日本語フォントは静的import解析では検出されないため、明示的にトレース対象へ含める。
  outputFileTracingIncludes: {
    "/api/analyses/[id]/export": [
      "./node_modules/@sparticuz/chromium/bin/**/*",
      "./assets/fonts/**/*",
    ],
  },
};

export default nextConfig;
