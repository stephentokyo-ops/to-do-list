import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PLANS, ONBOARDING_SUPPORT } from "@/lib/config/plans";
import { formatJpy } from "@/lib/utils";

const FEATURES = [
  { title: "事実と推測を分離", desc: "資料から確認できる事実と、確定できない推測・仮定を明確に切り分けます。" },
  { title: "矛盾・不整合を検出", desc: "金額・日付・数量・支払条件などの資料間の矛盾を重点的にチェックします。" },
  { title: "選択肢を比較", desc: "最大4案までを費用・スピード・リスクなどの観点で表形式に整理します。" },
  { title: "次のアクションを明確化", desc: "優先度・担当候補・期限・完了条件を1枚にまとめます。" },
];

export default function LandingPage() {
  return (
    <div>
      <section className="mx-auto max-w-5xl px-4 py-20 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          散らばった資料を、
          <br className="sm:hidden" />
          社長が判断できる1枚に。
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-base text-slate-600 sm:text-lg">
          メール、議事録、PDF、Excelを投入するだけ。
          <br />
          事実・論点・選択肢・リスク・次の行動を整理します。
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link href="/signup">
            <Button size="lg">無料で意思決定メモを作る</Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="outline">
              ログイン
            </Button>
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 pb-16">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <Card key={f.title}>
              <CardContent>
                <h3 className="font-semibold text-slate-900">{f.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{f.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="border-t border-slate-200 bg-white py-16">
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="text-center text-2xl font-bold text-slate-900">料金プラン</h2>
          <p className="mt-2 text-center text-sm text-slate-500">
            まずは無料プランでお試しいただけます。決済は現在準備中です。
          </p>
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {Object.values(PLANS).map((plan) => (
              <Card key={plan.id} className="flex flex-col">
                <CardContent className="flex flex-1 flex-col">
                  <h3 className="text-lg font-bold text-slate-900">{plan.name}</h3>
                  <p className="mt-1 text-2xl font-bold text-slate-900">
                    {plan.monthlyPriceJpy === 0 ? "無料" : `${formatJpy(plan.monthlyPriceJpy ?? 0)}/月`}
                  </p>
                  <p className="mt-2 text-sm text-slate-500">{plan.description}</p>
                  <ul className="mt-4 flex-1 space-y-1 text-sm text-slate-600">
                    <li>月{plan.monthlyProjectLimit}件まで</li>
                    <li>1案件あたり{plan.maxCharsPerProject.toLocaleString()}文字まで</li>
                    <li>出力形式: {plan.allowedExportFormats.join(" / ")}</li>
                    {plan.pdfWatermark && <li>PDF出力に透かしが入ります</li>}
                    {plan.priorityProcessing && <li>優先処理</li>}
                    {plan.templateSaving && <li>テンプレート保存</li>}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
          <p className="mt-8 text-center text-sm text-slate-500">
            {ONBOARDING_SUPPORT.name}: {formatJpy(ONBOARDING_SUPPORT.startingPriceJpy)}から
            <br />
            {ONBOARDING_SUPPORT.description}
          </p>
        </div>
      </section>
    </div>
  );
}
