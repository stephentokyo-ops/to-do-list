import { getAnalysisType } from "@/lib/config/analysis-types";

export const PROMPT_VERSION = "v1.0.0";

export interface PromptInput {
  projectTitle: string;
  analysisTypeId: string;
  background?: string;
  priorityPoints?: string;
  deadline?: string;
  documents: Array<{ label: string; text: string }>;
}

// 要件書 6章のルールを反映したシステムプロンプト。
export function buildSystemPrompt(analysisTypeId: string): string {
  const type = getAnalysisType(analysisTypeId);
  return `あなたは日本企業の経営企画部門を支援する意思決定支援AIです。
入力された社内資料（メール・議事録・PDF・Word・Excel・メモ等）を分析し、経営者が判断できる「1枚の意思決定メモ」をJSON構造で出力してください。

# 分析目的
${type.label}（${type.description}）
評価軸: ${type.evaluationFocus}

# 絶対厳守のルール
- 資料にない事実を作らない。不明な場合は「不明」と明記する。
- 事実・推測・提案を明確に分離する。事実は入力資料から確認できる内容のみとし、推測を事実のように書かない。
- 結論を最初に示す。30〜120文字程度。判断できない場合は「現時点では判断保留」と明記する。
- 重要度の低い情報を過剰に列挙せず、経営判断に影響する内容を優先する。
- 入力資料同士の矛盾（金額・日付・数量・比率・契約期間・支払条件など）を重点的に確認する。矛盾がなければ「重大な不整合は検出されませんでした」とし、完全性を保証する表現は使わない。
- 法的・税務的・労務的な最終判断を断定しない。専門家確認が必要な場合は明示する。
- 事実には可能な限り出典（ファイル名や資料番号）を付ける。
- 根拠が弱い推奨は確信度を「低」とする。
- 反対意見・代替案・見落としの可能性を示す。
- 冗長な一般論を避け、日本企業の社内説明資料として自然な日本語にする。
- 出力は指定されたJSON Schemaに厳格に従うこと。それ以外のテキストは出力しないこと。`;
}

export function buildUserPrompt(input: PromptInput): string {
  const docsText = input.documents
    .map((d, i) => `--- 資料${i + 1}: ${d.label} ---\n${d.text}`)
    .join("\n\n");

  return `# 案件名
${input.projectTitle}

# 前提・背景
${input.background?.trim() || "（入力なし）"}

# 重視項目
${input.priorityPoints?.trim() || "（入力なし）"}

# 期限
${input.deadline?.trim() || "（入力なし）"}

# 入力資料
${docsText || "（資料なし。テキスト入力のみで分析してください）"}

上記をもとに、意思決定メモをJSON Schemaに厳密に従って生成してください。`;
}
