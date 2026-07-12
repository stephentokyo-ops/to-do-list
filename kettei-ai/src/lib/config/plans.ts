// 料金・利用制限の設定。ここを変更するだけでプラン内容を調整できる。
export type PlanId = "free" | "standard" | "professional";

export interface PlanConfig {
  id: PlanId;
  name: string;
  monthlyPriceJpy: number | null; // null = お問い合わせ
  monthlyProjectLimit: number;
  maxCharsPerProject: number;
  pdfWatermark: boolean;
  allowedExportFormats: Array<"markdown" | "pdf" | "docx">;
  priorityProcessing: boolean;
  templateSaving: boolean;
  description: string;
}

export const PLANS: Record<PlanId, PlanConfig> = {
  free: {
    id: "free",
    name: "Free",
    monthlyPriceJpy: 0,
    monthlyProjectLimit: 1,
    maxCharsPerProject: 20_000,
    pdfWatermark: true,
    allowedExportFormats: ["markdown", "pdf"],
    priorityProcessing: false,
    templateSaving: false,
    description: "まずはお試しで意思決定メモを作成したい方向け。",
  },
  standard: {
    id: "standard",
    name: "Standard",
    monthlyPriceJpy: 9_800,
    monthlyProjectLimit: 10,
    maxCharsPerProject: 100_000,
    pdfWatermark: false,
    allowedExportFormats: ["markdown", "pdf", "docx"],
    priorityProcessing: false,
    templateSaving: false,
    description: "月次の経営会議・稟議資料作成を継続的に行う方向け。",
  },
  professional: {
    id: "professional",
    name: "Professional",
    monthlyPriceJpy: 29_800,
    monthlyProjectLimit: 30,
    maxCharsPerProject: 300_000,
    pdfWatermark: false,
    allowedExportFormats: ["markdown", "pdf", "docx"],
    priorityProcessing: true,
    templateSaving: true,
    description: "複数事業・複数案件を並行して扱う経営企画/CFO部門向け。",
  },
};

export const ONBOARDING_SUPPORT = {
  name: "初期導入支援",
  startingPriceJpy: 110_000,
  description: "個別ヒアリング、社内テンプレート調整、初回運用伴走を含む導入支援プラン。",
};

export function getPlan(planId: string | null | undefined): PlanConfig {
  if (planId && planId in PLANS) return PLANS[planId as PlanId];
  return PLANS.free;
}
