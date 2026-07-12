import { z } from "zod";

// 意思決定メモの構造化スキーマ（要件書 5章の11セクションに対応）。
// AIの出力はこのスキーマに厳格に従う必要がある。

export const ConfidenceLevel = z.enum(["高", "中", "低"]);

export const FactItemSchema = z.object({
  text: z.string().min(1),
  source: z.string().optional(),
});

export const AssumptionItemSchema = z.object({
  text: z.string().min(1),
});

export const KeyIssueItemSchema = z.object({
  text: z.string().min(1),
});

export const OptionComparisonSchema = z.object({
  name: z.string().min(1),
  pros: z.string().min(1),
  cons: z.string().min(1),
  cost: z.string().min(1),
  speed: z.string().min(1),
  difficulty: z.string().min(1),
  mainRisk: z.string().min(1),
  overallScore: z.string().min(1),
});

export const OpenQuestionSchema = z.object({
  whoToAsk: z.string().min(1),
  what: z.string().min(1),
  why: z.string().min(1),
});

export const ConsistencyIssueSchema = z.object({
  text: z.string().min(1),
});

export const NextActionSchema = z.object({
  priority: z.enum(["高", "中", "低"]),
  action: z.string().min(1),
  owner: z.string().min(1),
  deadline: z.string().min(1),
  doneCondition: z.string().min(1),
});

export const RiskItemSchema = z.object({
  text: z.string().min(1),
  requiresExpert: z.boolean(),
});

export const DecisionMemoSchema = z.object({
  projectTitle: z.string().min(1),
  conclusion: z.string().min(1),
  confidence: z.object({
    level: ConfidenceLevel,
    reason: z.string().min(1),
  }),
  facts: z.array(FactItemSchema).min(1),
  assumptions: z.array(AssumptionItemSchema),
  keyIssues: z.array(KeyIssueItemSchema).max(7),
  optionsComparison: z.array(OptionComparisonSchema).min(2).max(4),
  recommendation: z.object({
    chosenOption: z.string().min(1),
    reason: z.string().min(1),
    objections: z.string().min(1),
  }),
  openQuestions: z.array(OpenQuestionSchema),
  consistencyCheck: z.object({
    issues: z.array(ConsistencyIssueSchema),
    summary: z.string().min(1),
  }),
  nextActions: z.array(NextActionSchema).min(1),
  risks: z.array(RiskItemSchema).min(1),
});

export type DecisionMemo = z.infer<typeof DecisionMemoSchema>;
export type FactItem = z.infer<typeof FactItemSchema>;
export type OptionComparison = z.infer<typeof OptionComparisonSchema>;
export type NextAction = z.infer<typeof NextActionSchema>;
export type RiskItem = z.infer<typeof RiskItemSchema>;
