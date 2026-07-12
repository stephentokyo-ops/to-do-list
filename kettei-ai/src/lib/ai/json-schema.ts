// DecisionMemoSchema (schema.ts) と手動で同期させたJSON Schema。
// Anthropic Tool Use の input_schema として利用し、構造化出力を強制する。
export const DECISION_MEMO_JSON_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: [
    "projectTitle",
    "conclusion",
    "confidence",
    "facts",
    "assumptions",
    "keyIssues",
    "optionsComparison",
    "recommendation",
    "openQuestions",
    "consistencyCheck",
    "nextActions",
    "risks",
  ],
  properties: {
    projectTitle: { type: "string" },
    conclusion: {
      type: "string",
      description: "30〜120文字程度。現時点での推奨判断。判断できない場合は「現時点では判断保留」と明記。",
    },
    confidence: {
      type: "object",
      additionalProperties: false,
      required: ["level", "reason"],
      properties: {
        level: { type: "string", enum: ["高", "中", "低"] },
        reason: { type: "string" },
      },
    },
    facts: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["text"],
        properties: {
          text: { type: "string" },
          source: { type: "string", description: "出典ファイル名または資料番号" },
        },
      },
    },
    assumptions: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["text"],
        properties: { text: { type: "string" } },
      },
    },
    keyIssues: {
      type: "array",
      maxItems: 7,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["text"],
        properties: { text: { type: "string" } },
      },
    },
    optionsComparison: {
      type: "array",
      minItems: 2,
      maxItems: 4,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["name", "pros", "cons", "cost", "speed", "difficulty", "mainRisk", "overallScore"],
        properties: {
          name: { type: "string" },
          pros: { type: "string" },
          cons: { type: "string" },
          cost: { type: "string" },
          speed: { type: "string" },
          difficulty: { type: "string" },
          mainRisk: { type: "string" },
          overallScore: { type: "string" },
        },
      },
    },
    recommendation: {
      type: "object",
      additionalProperties: false,
      required: ["chosenOption", "reason", "objections"],
      properties: {
        chosenOption: { type: "string" },
        reason: { type: "string" },
        objections: { type: "string", description: "反対意見または採用しない理由" },
      },
    },
    openQuestions: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["whoToAsk", "what", "why"],
        properties: {
          whoToAsk: { type: "string" },
          what: { type: "string" },
          why: { type: "string" },
        },
      },
    },
    consistencyCheck: {
      type: "object",
      additionalProperties: false,
      required: ["issues", "summary"],
      properties: {
        issues: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            required: ["text"],
            properties: { text: { type: "string" } },
          },
        },
        summary: {
          type: "string",
          description: "矛盾がなければ「重大な不整合は検出されませんでした」。完全性を保証する表現は禁止。",
        },
      },
    },
    nextActions: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["priority", "action", "owner", "deadline", "doneCondition"],
        properties: {
          priority: { type: "string", enum: ["高", "中", "低"] },
          action: { type: "string" },
          owner: { type: "string" },
          deadline: { type: "string" },
          doneCondition: { type: "string" },
        },
      },
    },
    risks: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["text", "requiresExpert"],
        properties: {
          text: { type: "string" },
          requiresExpert: { type: "boolean" },
        },
      },
    },
  },
} as const;
