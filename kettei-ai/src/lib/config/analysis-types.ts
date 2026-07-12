// 分析目的の定義。目的に応じてAIプロンプト内の評価軸を切り替える。
export type AnalysisTypeId = "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "I" | "J";

export interface AnalysisTypeConfig {
  id: AnalysisTypeId;
  label: string;
  description: string;
  // AIへの評価軸の指示（システムプロンプトに差し込む）
  evaluationFocus: string;
}

export const ANALYSIS_TYPES: AnalysisTypeConfig[] = [
  {
    id: "A",
    label: "経営判断",
    description: "全社的な方針・戦略に関わる意思決定",
    evaluationFocus:
      "経営戦略、事業継続性、財務影響、ステークホルダーへの影響を重視して評価する。",
  },
  {
    id: "B",
    label: "投資・支出判断",
    description: "設備投資、システム投資、大口支出の可否判断",
    evaluationFocus:
      "投資回収期間、資金繰りへの影響、代替手段、費用対効果を重視して評価する。",
  },
  {
    id: "C",
    label: "契約・法務論点整理",
    description: "契約書・取引条件・法務リスクの整理",
    evaluationFocus:
      "契約条項の不利益、法的リスク、交渉余地、専門家確認が必要な論点を重視して評価する。",
  },
  {
    id: "D",
    label: "労務・人事判断",
    description: "人事異動、雇用契約、労務トラブル対応",
    evaluationFocus:
      "労働法上のリスク、従業員への影響、社内公平性、労務専門家確認の要否を重視して評価する。",
  },
  {
    id: "E",
    label: "海外取引・貿易判断",
    description: "海外仕入・輸出入・与信に関する判断",
    evaluationFocus:
      "為替リスク、信用リスク、供給継続性、貿易条件（インコタームズ等）、資金繰り影響を重視して評価する。",
  },
  {
    id: "F",
    label: "取引先信用判断",
    description: "新規・既存取引先の信用力評価",
    evaluationFocus:
      "支払能力、取引継続性、代替取引先の有無、与信限度の妥当性を重視して評価する。",
  },
  {
    id: "G",
    label: "業務改善",
    description: "業務プロセス・オペレーションの改善検討",
    evaluationFocus: "工数削減効果、実行難易度、現場への影響、投資対効果を重視して評価する。",
  },
  {
    id: "H",
    label: "会議整理",
    description: "会議の内容を意思決定可能な形に整理",
    evaluationFocus: "決定事項、未決事項、責任者、次回までの宿題を重視して評価する。",
  },
  {
    id: "I",
    label: "稟議・役員説明",
    description: "稟議書・役員会向け説明資料の整理",
    evaluationFocus:
      "承認者が知りたい要点、リスクと対策、代替案の有無、説明のしやすさを重視して評価する。",
  },
  {
    id: "J",
    label: "自由設定",
    description: "上記に当てはまらない自由な論点整理",
    evaluationFocus: "利用者が入力した背景・重視項目に沿って柔軟に評価軸を設定する。",
  },
];

export function getAnalysisType(id: string): AnalysisTypeConfig {
  return ANALYSIS_TYPES.find((t) => t.id === id) ?? ANALYSIS_TYPES[ANALYSIS_TYPES.length - 1];
}
