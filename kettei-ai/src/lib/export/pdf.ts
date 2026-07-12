import fs from "fs";
import type { DecisionMemo } from "@/lib/ai/schema";

// 日本語フォント崩れ対策: Chromiumのシステムフォント(IPAGothic)を明示指定してレンダリングする。
const FONT_STACK = "'IPAGothic', 'Noto Sans JP', 'Yu Gothic', sans-serif";

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderTable(header: string[], rows: string[][]): string {
  const th = header.map((h) => `<th>${escapeHtml(h)}</th>`).join("");
  const trs = rows
    .map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join("")}</tr>`)
    .join("");
  return `<table><thead><tr>${th}</tr></thead><tbody>${trs}</tbody></table>`;
}

function renderList(items: string[]): string {
  if (items.length === 0) return "<p>特になし</p>";
  return `<ul>${items.map((i) => `<li>${escapeHtml(i)}</li>`).join("")}</ul>`;
}

export function memoToHtml(memo: DecisionMemo, watermark: boolean): string {
  const consistencyIssues =
    memo.consistencyCheck.issues.length > 0
      ? renderList(memo.consistencyCheck.issues.map((i) => i.text))
      : "";

  return `<!doctype html>
<html lang="ja">
<head>
<meta charset="utf-8" />
<style>
  body { font-family: ${FONT_STACK}; color: #1a1a1a; padding: 32px; line-height: 1.7; font-size: 12px; }
  h1 { font-size: 20px; border-bottom: 2px solid #333; padding-bottom: 8px; }
  h2 { font-size: 15px; margin-top: 24px; background: #f2f2f2; padding: 4px 8px; }
  table { width: 100%; border-collapse: collapse; margin: 8px 0; }
  th, td { border: 1px solid #ccc; padding: 6px 8px; text-align: left; vertical-align: top; }
  th { background: #eee; }
  .watermark { position: fixed; top: 40%; left: 15%; font-size: 60px; color: rgba(200,0,0,0.15); transform: rotate(-30deg); z-index: 1000; }
  .footer-note { margin-top: 24px; font-size: 10px; color: #666; border-top: 1px solid #ccc; padding-top: 8px; }
</style>
</head>
<body>
${watermark ? '<div class="watermark">KETTEI AI (Free)</div>' : ""}
<h1>${escapeHtml(memo.projectTitle)}</h1>

<h2>1. 結論</h2>
<p>${escapeHtml(memo.conclusion)}</p>

<h2>2. 判断の確信度</h2>
<p><strong>${escapeHtml(memo.confidence.level)}</strong> — ${escapeHtml(memo.confidence.reason)}</p>

<h2>3. 事実</h2>
${renderList(memo.facts.map((f) => `${f.text}${f.source ? `（出典: ${f.source}）` : ""}`))}

<h2>4. 推測・仮定</h2>
${renderList(memo.assumptions.map((a) => a.text))}

<h2>5. 主要論点</h2>
${renderList(memo.keyIssues.map((k) => k.text))}

<h2>6. 選択肢比較</h2>
${renderTable(
  ["選択肢", "メリット", "デメリット", "費用", "スピード", "実行難易度", "主要リスク", "総合評価"],
  memo.optionsComparison.map((o) => [
    o.name,
    o.pros,
    o.cons,
    o.cost,
    o.speed,
    o.difficulty,
    o.mainRisk,
    o.overallScore,
  ]),
)}

<h2>7. 推奨案</h2>
<p><strong>推奨: ${escapeHtml(memo.recommendation.chosenOption)}</strong></p>
<p>${escapeHtml(memo.recommendation.reason)}</p>
<p>反対意見・不採用理由: ${escapeHtml(memo.recommendation.objections)}</p>

<h2>8. 未確認事項</h2>
${renderList(memo.openQuestions.map((q) => `誰に: ${q.whoToAsk} / 何を: ${q.what} / なぜ: ${q.why}`))}

<h2>9. 数値・整合性チェック</h2>
${consistencyIssues}
<p>${escapeHtml(memo.consistencyCheck.summary)}</p>

<h2>10. 次のアクション</h2>
${renderTable(
  ["優先度", "アクション", "担当候補", "期限", "完了条件"],
  memo.nextActions.map((a) => [a.priority, a.action, a.owner, a.deadline, a.doneCondition]),
)}

<h2>11. リスク・注意点</h2>
${renderList(memo.risks.map((r) => `${r.text}${r.requiresExpert ? "（専門家確認推奨）" : ""}`))}

<div class="footer-note">本メモはAIによる分析結果であり、法務・税務・労務等の専門家判断を代替するものではありません。重要な意思決定の前に、必要に応じて専門家へご確認ください。</div>
</body>
</html>`;
}

function resolveChromiumExecutablePath(): string | undefined {
  const candidates = [
    process.env.PLAYWRIGHT_CHROMIUM_PATH,
    "/opt/pw-browsers/chromium",
    "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
  ].filter((p): p is string => Boolean(p));
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return candidate;
  }
  return undefined;
}

export async function memoToPdfBuffer(memo: DecisionMemo, watermark: boolean): Promise<Buffer> {
  const { chromium } = await import("playwright-core");
  const executablePath = resolveChromiumExecutablePath();
  if (!executablePath) {
    throw new Error(
      "PDF生成用のChromiumが見つかりません。PLAYWRIGHT_CHROMIUM_PATH環境変数でパスを指定してください。",
    );
  }

  const browser = await chromium.launch({ executablePath });
  try {
    const page = await browser.newPage();
    await page.setContent(memoToHtml(memo, watermark), { waitUntil: "networkidle" });
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "16mm", bottom: "16mm", left: "14mm", right: "14mm" },
    });
    return pdf;
  } finally {
    await browser.close();
  }
}
