import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getStore } from "@/lib/db";
import { getPlan } from "@/lib/config/plans";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "admin") redirect("/dashboard");

  const store = getStore();
  const [profiles, usage] = await Promise.all([store.listProfiles(), store.listAllUsage()]);

  const usageByUser = new Map<string, { count: number; inputTokens: number; outputTokens: number; cost: number }>();
  for (const u of usage) {
    const entry = usageByUser.get(u.userId) ?? { count: 0, inputTokens: 0, outputTokens: 0, cost: 0 };
    entry.count += 1;
    entry.inputTokens += u.inputTokens;
    entry.outputTokens += u.outputTokens;
    entry.cost += u.estimatedCost;
    usageByUser.set(u.userId, entry);
  }

  const totalCost = usage.reduce((sum, u) => sum + u.estimatedCost, 0);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">管理者ダッシュボード</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent>
            <p className="text-sm text-slate-500">登録ユーザー数</p>
            <p className="text-2xl font-bold text-slate-900">{profiles.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-sm text-slate-500">累計分析回数</p>
            <p className="text-2xl font-bold text-slate-900">{usage.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-sm text-slate-500">累計推定コスト</p>
            <p className="text-2xl font-bold text-slate-900">${totalCost.toFixed(4)}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>ユーザー別使用量</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="text-slate-500">
                  <th className="py-2">メールアドレス</th>
                  <th className="py-2">プラン</th>
                  <th className="py-2">権限</th>
                  <th className="py-2">分析回数</th>
                  <th className="py-2">推定コスト</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {profiles.map((p) => {
                  const u = usageByUser.get(p.id) ?? { count: 0, inputTokens: 0, outputTokens: 0, cost: 0 };
                  return (
                    <tr key={p.id}>
                      <td className="py-2">{p.email}</td>
                      <td className="py-2">{getPlan(p.plan).name}</td>
                      <td className="py-2">{p.role === "admin" ? "管理者" : "一般"}</td>
                      <td className="py-2">{u.count}</td>
                      <td className="py-2">${u.cost.toFixed(4)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
