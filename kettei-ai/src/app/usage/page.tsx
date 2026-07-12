import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getStore } from "@/lib/db";
import { getPlan, PLANS } from "@/lib/config/plans";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateTimeJst, formatJpy } from "@/lib/utils";

export default async function UsagePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const store = getStore();
  const plan = getPlan(user.plan);
  const yearMonth = new Date().toISOString().slice(0, 7);
  const usage = await store.getMonthlyUsage(user.id, yearMonth);
  const analyses = await store.listAnalysesByUser(user.id);
  const monthlyLimit = user.monthlyLimit ?? plan.monthlyProjectLimit;

  const totalCost = analyses.reduce((sum, a) => sum + a.estimatedCost, 0);
  const totalInputTokens = analyses.reduce((sum, a) => sum + a.inputTokens, 0);
  const totalOutputTokens = analyses.reduce((sum, a) => sum + a.outputTokens, 0);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">使用量・プラン</h1>

      <Card>
        <CardHeader>
          <CardTitle>現在のプラン: {plan.name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-slate-600">
          <p>今月の案件作成数: {usage.projectCount} / {monthlyLimit} 件</p>
          <p>1案件あたりの上限文字数: {plan.maxCharsPerProject.toLocaleString()}文字</p>
          <p>出力形式: {plan.allowedExportFormats.join(" / ")}{plan.pdfWatermark && "（PDFに透かし）"}</p>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full bg-slate-900"
              style={{ width: `${Math.min(100, (usage.projectCount / monthlyLimit) * 100)}%` }}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>累計AI利用状況（目安）</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 text-sm text-slate-600">
          <p>分析回数: {analyses.length}回</p>
          <p>
            入力トークン: {totalInputTokens.toLocaleString()} / 出力トークン: {totalOutputTokens.toLocaleString()}
          </p>
          <p>推定コスト: ${totalCost.toFixed(4)}（米ドル、目安）</p>
          <p className="text-xs text-slate-400">
            推定コストはAnthropic APIの公表単価をもとにした概算です。実際の請求額はAnthropicの請求情報をご確認ください。
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>料金プラン一覧</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-slate-500">
                <th className="py-1">プラン</th>
                <th className="py-1">月額</th>
                <th className="py-1">月間件数</th>
                <th className="py-1">文字数上限</th>
              </tr>
            </thead>
            <tbody>
              {Object.values(PLANS).map((p) => (
                <tr key={p.id} className={p.id === plan.id ? "font-semibold text-slate-900" : "text-slate-600"}>
                  <td className="py-1">{p.name}</td>
                  <td className="py-1">{p.monthlyPriceJpy === 0 ? "無料" : formatJpy(p.monthlyPriceJpy ?? 0)}</td>
                  <td className="py-1">{p.monthlyProjectLimit}件</td>
                  <td className="py-1">{p.maxCharsPerProject.toLocaleString()}文字</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {analyses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>分析履歴</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="divide-y divide-slate-100 text-sm">
              {analyses.slice(0, 20).map((a) => (
                <li key={a.id} className="flex items-center justify-between py-2">
                  <span>{formatDateTimeJst(a.createdAt)}</span>
                  <span className="text-slate-500">
                    {a.inputTokens + a.outputTokens} tokens / ${a.estimatedCost.toFixed(4)}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
