import type { DecisionMemo } from "./schema";
import { getAnalysisType } from "@/lib/config/analysis-types";
import { PROMPT_VERSION, type PromptInput } from "./prompt";
import type { AIProvider, AnalyzeResult } from "./types";

// APIキー未設定時に使うデモプロバイダー。固定ロジックでそれらしい構造化出力を返す。
// 実運用のAI分析ではなく、画面確認・営業デモ用のモック。
export class DemoAIProvider implements AIProvider {
  readonly name = "demo";

  async analyze(input: PromptInput): Promise<AnalyzeResult> {
    // ネットワーク越しのAI呼び出しを模した体感待ち時間
    await new Promise((resolve) => setTimeout(resolve, 1200));

    const type = getAnalysisType(input.analysisTypeId);
    const excerpts = input.documents
      .map((d) => ({ label: d.label, firstLine: d.text.trim().split(/\r?\n/)[0]?.slice(0, 80) }))
      .filter((d) => d.firstLine);

    const facts =
      excerpts.length > 0
        ? excerpts.map((e) => ({ text: `「${e.firstLine}」と記載されている。`, source: e.label }))
        : [
            {
              text: "テキスト入力のみが提供され、添付資料はありません。",
              source: "入力フォーム",
            },
          ];

    const memo: DecisionMemo = {
      projectTitle: input.projectTitle,
      conclusion: `【デモ出力】現時点の情報からは、${type.label}の観点で慎重な検討を推奨します。最終判断には追加確認が必要です。`,
      confidence: {
        level: "中",
        reason:
          "デモモードのため実際のAI分析は行われていません。本番運用ではANTHROPIC_API_KEYを設定してください。",
      },
      facts,
      assumptions: [
        { text: "入力された背景・前提情報は正確であるとみなしています（デモ仮定）。" },
        { text: "本番AI分析では、資料間の矛盾や数値不整合をより詳細に検出します。" },
      ],
      keyIssues: [
        { text: `${type.label}に関する評価軸: ${type.evaluationFocus}` },
        { text: "資料に基づく事実と推測の切り分けが必要です。" },
        { text: "意思決定の期限と関係者の合意形成方法。" },
      ],
      optionsComparison: [
        {
          name: "案A: 提案どおり進める",
          pros: "スピードが速く、関係先との関係を維持しやすい",
          cons: "十分な検証がないまま実行するリスクがある",
          cost: "中",
          speed: "速い",
          difficulty: "低",
          mainRisk: "後戻りコストが発生する可能性",
          overallScore: "B",
        },
        {
          name: "案B: 追加確認の上で判断",
          pros: "リスクを抑えた意思決定が可能",
          cons: "意思決定までに時間がかかる",
          cost: "低",
          speed: "遅い",
          difficulty: "中",
          mainRisk: "確認中に状況が変化する可能性",
          overallScore: "A",
        },
      ],
      recommendation: {
        chosenOption: "案B: 追加確認の上で判断",
        reason:
          "デモ出力のため一般論としての推奨です。本番運用では入力資料の内容に基づいた具体的な推奨理由が示されます。",
        objections: "スピードを優先する立場からは案Aを推す意見もあり得ます。",
      },
      openQuestions: [
        {
          whoToAsk: "担当部門責任者",
          what: "本案件の最終期限と決裁ルート",
          why: "意思決定のスケジュールを確定するため",
        },
        {
          whoToAsk: "経理・財務担当",
          what: "資金繰りへの影響額",
          why: "投資判断・支出判断の場合、キャッシュフローへの影響を確認する必要があるため",
        },
      ],
      consistencyCheck: {
        issues: [],
        summary:
          "デモモードでは詳細な整合性チェックを行っていません。重大な不整合は検出されませんでした。",
      },
      nextActions: [
        {
          priority: "高",
          action: "関係者へのヒアリングと不足情報の収集",
          owner: "案件担当者",
          deadline: "1週間以内",
          doneCondition: "未確認事項がすべて解消されること",
        },
        {
          priority: "中",
          action: "選択肢ごとの詳細な費用試算",
          owner: "経理・財務担当",
          deadline: "2週間以内",
          doneCondition: "各選択肢の費用が数値で比較できること",
        },
      ],
      risks: [
        {
          text: "本出力はデモモードによる固定サンプルであり、実際の資料内容を反映していません。",
          requiresExpert: false,
        },
        {
          text: "法務・税務・労務に関わる論点がある場合は、専門家への確認が必要です。",
          requiresExpert: true,
        },
      ],
    };

    return {
      memo,
      provider: this.name,
      model: "demo-fixture-v1",
      promptVersion: PROMPT_VERSION,
      inputTokens: 0,
      outputTokens: 0,
      estimatedCostUsd: 0,
    };
  }
}

export const demoAIProvider: AIProvider = new DemoAIProvider();
