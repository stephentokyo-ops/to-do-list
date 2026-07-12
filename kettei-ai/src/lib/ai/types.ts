import type { DecisionMemo } from "./schema";
import type { PromptInput } from "./prompt";

export interface AnalyzeResult {
  memo: DecisionMemo;
  provider: string;
  model: string;
  promptVersion: string;
  inputTokens: number;
  outputTokens: number;
  estimatedCostUsd: number;
}

export interface AIProvider {
  readonly name: string;
  analyze(input: PromptInput): Promise<AnalyzeResult>;
}

export class AIProviderError extends Error {
  constructor(
    message: string,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = "AIProviderError";
  }
}
