import { promises as fs } from "fs";
import path from "path";

// デモモードのローカルデータ（.data/）をリセットするスクリプト。
// 実行後、次回アクセス時にデモ用シードアカウントが再作成される。
async function main() {
  const dataDir = path.join(process.cwd(), ".data");
  await fs.rm(dataDir, { recursive: true, force: true });
  console.log("デモデータをリセットしました:", dataDir);
}

main();
