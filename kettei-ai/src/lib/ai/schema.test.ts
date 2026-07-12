import { describe, it, expect } from "vitest";
import { DecisionMemoSchema } from "./schema";
import { demoAIProvider } from "./demo-provider";

const validMemo = {
  projectTitle: "テスト案件",
  conclusion: "現時点では判断保留",
  confidence: { level: "低", reason: "情報不足のため" },
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

describe("DecisionMemoSchema", () => {
  it("有効な意思決定メモを受理する", () => {
    const result = DecisionMemoSchema.safeParse(validMemo);
    expect(result.success).toBe(true);
  });

  it("選択肢が1件のみの場合は拒否する（最低2案）", () => {
    const invalid = { ...validMemo, optionsComparison: [validMemo.optionsComparison[0]] };
    const result = DecisionMemoSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it("主要論点が8件以上の場合は拒否する（最大7項目）", () => {
    const invalid = {
      ...validMemo,
      keyIssues: Array.from({ length: 8 }, (_, i) => ({ text: `論点${i}` })),
    };
    const result = DecisionMemoSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it("必須フィールドが欠けている場合は拒否する", () => {
    const invalid: Partial<typeof validMemo> = { ...validMemo };
    delete invalid.conclusion;
    const result = DecisionMemoSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });
});

describe("DemoAIProvider", () => {
  it("スキーマに適合する構造化データを返す", async () => {
    const result = await demoAIProvider.analyze({
      projectTitle: "デモ案件",
      analysisTypeId: "A",
      documents: [{ label: "サンプル", text: "サンプルテキスト" }],
    });
    const parsed = DecisionMemoSchema.safeParse(result.memo);
    expect(parsed.success).toBe(true);
    expect(result.provider).toBe("demo");
  });
});
