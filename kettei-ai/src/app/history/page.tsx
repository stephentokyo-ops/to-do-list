import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getStore } from "@/lib/db";
import { getAnalysisType } from "@/lib/config/analysis-types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDateTimeJst } from "@/lib/utils";

const STATUS_LABEL: Record<string, string> = {
  draft: "下書き",
  analyzing: "分析中",
  completed: "完了",
  failed: "失敗",
};

export default async function HistoryPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const projects = await getStore().listProjectsByUser(user.id);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-2xl font-bold text-slate-900">案件履歴</h1>
      <p className="mt-1 text-sm text-slate-500">これまでに作成した案件の一覧です。</p>

      <div className="mt-6 space-y-3">
        {projects.length === 0 && (
          <Card>
            <CardContent className="text-sm text-slate-500">まだ案件がありません。</CardContent>
          </Card>
        )}
        {projects.map((p) => {
          const type = getAnalysisType(p.analysisType);
          return (
            <Link key={p.id} href={`/projects/${p.id}`}>
              <Card className="transition-colors hover:border-slate-300">
                <CardContent className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-900">{p.title}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {type.label} ・ {formatDateTimeJst(p.createdAt)}
                    </p>
                  </div>
                  <Badge tone={p.status === "completed" ? "success" : p.status === "failed" ? "risk" : "neutral"}>
                    {STATUS_LABEL[p.status] ?? p.status}
                  </Badge>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
