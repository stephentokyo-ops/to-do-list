import type { DecisionMemo } from "@/lib/ai/schema";

function factsTable(memo: DecisionMemo): string {
  return memo.facts.map((f) => `- ${f.text}${f.source ? `（出典: ${f.source}）` : ""}`).join("\n");
}

function optionsTable(memo: DecisionMemo): string {
  const header = "| 選択肢 | メリット | デメリット | 費用 | スピード | 実行難易度 | 主要リスク | 総合評価 |";
  const sep = "| --- | --- | --- | --- | --- | --- | --- | --- |";
  const rows = memo.optionsComparison.map(
    (o) =>
      `| ${o.name} | ${o.pros} | ${o.cons} | ${o.cost} | ${o.speed} | ${o.difficulty} | ${o.mainRisk} | ${o.overallScore} |`,
  );
  return [header, sep, ...rows].join("\n");
}

function nextActionsTable(memo: DecisionMemo): string {
  const header = "| 優先度 | アクション | 担当候補 | 期限 | 完了条件 |";
  const sep = "| --- | --- | --- | --- | --- |";
  const rows = memo.nextActions.map(
    (a) => `| ${a.priority} | ${a.action} | ${a.owner} | ${a.deadline} | ${a.doneCondition} |`,
  );
  return [header, sep, ...rows].join("\n");
}

export function memoToMarkdown(memo: DecisionMemo): string {
  const assumptions =
    memo.assumptions.length > 0
      ? memo.assumptions.map((a) => `- ${a.text}`).join("\n")
      : "- 特になし";

  const keyIssues = memo.keyIssues.map((k, i) => `${i + 1}. ${k.text}`).join("\n");

  const openQuestions =
    memo.openQuestions.length > 0
      ? memo.openQuestions
          .map((q) => `- **誰に**: ${q.whoToAsk} / **何を**: ${q.what} / **なぜ**: ${q.why}`)
          .join("\n")
      : "- 特になし";

  const consistencyIssues =
    memo.consistencyCheck.issues.length > 0
      ? memo.consistencyCheck.issues.map((i) => `- ${i.text}`).join("\n") + "\n\n"
      : "";

  const risks = memo.risks
    .map((r) => `- ${r.text}${r.requiresExpert ? "（専門家確認推奨）" : ""}`)
    .join("\n");

  return `# ${memo.projectTitle}

## 1. 結論
${memo.conclusion}

## 2. 判断の確信度
**${memo.confidence.level}** — ${memo.confidence.reason}

## 3. 事実
${factsTable(memo)}

## 4. 推測・仮定
${assumptions}

## 5. 主要論点
${keyIssues}

## 6. 選択肢比較
${optionsTable(memo)}

## 7. 推奨案
**推奨: ${memo.recommendation.chosenOption}**

${memo.recommendation.reason}

反対意見・不採用理由: ${memo.recommendation.objections}

## 8. 未確認事項
${openQuestions}

## 9. 数値・整合性チェック
${consistencyIssues}${memo.consistencyCheck.summary}

## 10. 次のアクション
${nextActionsTable(memo)}

## 11. リスク・注意点
${risks}

---
*本メモはAIによる分析結果であり、法務・税務・労務等の専門家判断を代替するものではありません。重要な意思決定の前に、必要に応じて専門家へご確認ください。*
`;
}
