import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // pdf-parse(内部でpdfjs-distのworkerスクリプトを相対パスで動的読み込みする)を
  // サーバーバンドルの対象から除外し、node_modulesから素のまま実行させる。
  // バンドルに含めるとworkerファイルの相対配置が崩れ、PDF抽出が失敗する。
  serverExternalPackages: ["pdf-parse", "pdfjs-dist"],
};

export default nextConfig;
