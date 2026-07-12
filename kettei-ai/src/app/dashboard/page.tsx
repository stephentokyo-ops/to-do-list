import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getStore } from "@/lib/db";
import { getPlan } from "@/lib/config/plans";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDateTimeJst } from "@/lib/utils";
import { SampleProjectButton } from "@/components/projects/sample-project-button";

const STATUS_LABEL: Record<string, string> = {
  draft: "下書き",
  analyzing: "分析中",
  completed: "完了",
  failed: "失敗",
};

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const store = getStore();
  const projects = (await store.listProjectsByUser(user.id)).slice(0, 5);
  const plan = getPlan(user.plan);
  const yearMonth = new Date().toISOString().slice(0, 7);
  const usage = await store.getMonthlyUsage(user.id, yearMonth);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">ダッシュボード</h1>
          <p className="mt-1 text-sm text-slate-500">
            {user.displayName || user.email} さん — {plan.name}プラン（今月 {usage.projectCount}/
            {user.monthlyLimit ?? plan.monthlyProjectLimit} 件）
          </p>
        </div>
        <div className="flex gap-2">
          <SampleProjectButton />
          <Link href="/projects/new">
            <Button>新しい意思決定メモを作る</Button>
          </Link>
        </div>
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>最近の案件</CardTitle>
        </CardHeader>
        <CardContent>
          {projects.length === 0 ? (
            <p className="text-sm text-slate-500">
              まだ案件がありません。「新しい意思決定メモを作る」から始めましょう。
            </p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {projects.map((p) => (
                <li key={p.id} className="flex items-center justify-between py-3">
                  <div>
                    <Link href={`/projects/${p.id}`} className="font-medium text-slate-900 hover:underline">
                      {p.title}
                    </Link>
                    <p className="text-xs text-slate-500">{formatDateTimeJst(p.createdAt)}</p>
                  </div>
                  <Badge tone={p.status === "completed" ? "success" : p.status === "failed" ? "risk" : "neutral"}>
                    {STATUS_LABEL[p.status] ?? p.status}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-4 text-right">
            <Link href="/history" className="text-sm text-slate-500 underline hover:text-slate-700">
              すべての案件を見る →
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
