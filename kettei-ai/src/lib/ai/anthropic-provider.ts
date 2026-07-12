import Anthropic from "@anthropic-ai/sdk";
import { DecisionMemoSchema } from "./schema";
import { DECISION_MEMO_JSON_SCHEMA } from "./json-schema";
import { buildSystemPrompt, buildUserPrompt, PROMPT_VERSION, type PromptInput } from "./prompt";
import { AIProviderError, type AIProvider, type AnalyzeResult } from "./types";

// 2026-07時点の目安単価（$/1Mトークン）。実際の請求額は Anthropic の請求情報を参照すること。
const PRICING_PER_MILLION_USD: Record<string, { input: number; output: number }> = {
  "claude-sonnet-5": { input: 3, output: 15 },
  "claude-opus-4-8": { input: 5, output: 25 },
  "claude-haiku-4-5": { input: 1, output: 5 },
};
const DEFAULT_PRICING = { input: 3, output: 15 };

const TOOL_NAME = "emit_decision_memo";
const MAX_RETRIES = 2;

export class AnthropicAIProvider implements AIProvider {
  readonly name = "anthropic";
  private client: Anthropic;
  private model: string;

  constructor(apiKey: string, model: string) {
    this.client = new Anthropic({ apiKey });
    this.model = model;
  }

  async analyze(input: PromptInput): Promise<AnalyzeResult> {
    const system = buildSystemPrompt(input.analysisTypeId);
    const user = buildUserPrompt(input);

    let lastError: unknown;
    let totalInputTokens = 0;
    let totalOutputTokens = 0;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        const response = await this.client.messages.create({
          model: this.model,
          max_tokens: 8000,
          system,
          messages: [{ role: "user", content: attempt === 0 ? user : `${user}\n\n前回の出力はJSON Schemaに適合しませんでした。スキーマに厳密に従ってやり直してください。` }],
          tools: [
            {
              name: TOOL_NAME,
              description: "意思決定メモを構造化データとして出力する",
              input_schema: DECISION_MEMO_JSON_SCHEMA as unknown as Anthropic.Tool.InputSchema,
            },
          ],
          tool_choice: { type: "tool", name: TOOL_NAME },
        });

        totalInputTokens += response.usage.input_tokens;
        totalOutputTokens += response.usage.output_tokens;

        const toolUse = response.content.find(
          (block): block is Anthropic.ToolUseBlock => block.type === "tool_use",
        );
        if (!toolUse) {
          throw new AIProviderError("AIがツール呼び出しを返しませんでした");
        }

        const parsed = DecisionMemoSchema.safeParse(toolUse.input);
        if (!parsed.success) {
          lastError = parsed.error;
          continue;
        }

        const pricing = PRICING_PER_MILLION_USD[this.model] ?? DEFAULT_PRICING;
        const estimatedCostUsd =
          (totalInputTokens / 1_000_000) * pricing.input +
          (totalOutputTokens / 1_000_000) * pricing.output;

        return {
          memo: parsed.data,
          provider: this.name,
          model: this.model,
          promptVersion: PROMPT_VERSION,
          inputTokens: totalInputTokens,
          outputTokens: totalOutputTokens,
          estimatedCostUsd,
        };
      } catch (err) {
        lastError = err;
      }
    }

    throw new AIProviderError(
      `AI分析に失敗しました（${MAX_RETRIES + 1}回試行）。しばらくしてから再度お試しください。`,
      lastError,
    );
  }
}
