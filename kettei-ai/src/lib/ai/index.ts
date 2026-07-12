import { AnthropicAIProvider } from "./anthropic-provider";
import { demoAIProvider } from "./demo-provider";
import type { AIProvider } from "./types";

export * from "./types";
export * from "./schema";
export * from "./prompt";

let cached: AIProvider | null = null;

export function getAIProvider(): AIProvider {
  if (cached) return cached;

  const apiKey = process.env.ANTHROPIC_API_KEY;
  const providerSetting = process.env.AI_PROVIDER ?? "demo";

  if (providerSetting === "anthropic" && apiKey) {
    const model = process.env.ANTHROPIC_MODEL || "claude-sonnet-5";
    cached = new AnthropicAIProvider(apiKey, model);
  } else {
    cached = demoAIProvider;
  }
  return cached;
}

export function isDemoMode(): boolean {
  return getAIProvider().name === "demo";
}
