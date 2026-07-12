import { describe, it, expect } from "vitest";
import { memoToMarkdown } from "./markdown";
import type { DecisionMemo } from "@/lib/ai/schema";

const memo: DecisionMemo = {
  projectTitle: "テスト案件",
  conclusion: "現時点では判断保留",
  confidence: { level: "低", reason: "情報不足" },
  facts: [{ text: "事実A", source: "資料1" }],
  assumptions: [{ text: "仮定A" }],
  keyIssues: [{ text: "論点A" }],
  optionsComparison: [
    { name: "案A", pros: "p", cons: "c", cost: "低", speed: "速い", difficulty: "低", mainRisk: "なし", overallScore: "A" },
    { name: "案B", pros: "p", cons: "c", cost: "高", speed: "遅い", difficulty: "高", mainRisk: "あり", overallScore: "B" },
  ],
  recommendation: { chosenOption: "案A", reason: "理由", objections: "反対意見" },
  openQuestions: [{ whoToAsk: "誰か", what: "何か", why: "なぜか" }],
  consistencyCheck: { issues: [], summary: "重大な不整合は検出されませんでした" },
  nextActions: [{ priority: "高", action: "確認する", owner: "担当者", deadline: "1週間", doneCondition: "完了" }],
  risks: [{ text: "リスクA", requiresExpert: true }],
};

describe("memoToMarkdown", () => {
  const markdown = memoToMarkdown(memo);

  it("11個すべてのセクション見出しを含む", () => {
    for (let i = 1; i <= 11; i++) {
      expect(markdown).toContain(`## ${i}.`);
    }
  });

  it("案件名をH1として出力する", () => {
    expect(markdown).toContain("# テスト案件");
  });

  it("選択肢比較を表形式で出力する", () => {
    expect(markdown).toContain("| 選択肢 | メリット |");
    expect(markdown).toContain("案A");
    expect(markdown).toContain("案B");
  });

  it("専門家確認が必要な旨の免責文言を含む", () => {
    expect(markdown).toContain("専門家判断を代替するものではありません");
  });
});
