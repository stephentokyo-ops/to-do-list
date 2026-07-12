import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { getStore } from "@/lib/db";
import { getPlan } from "@/lib/config/plans";
import { MemoView } from "@/components/analysis/memo-view";

export default async function AnalysisResultPage({
  params,
}: {
  params: Promise<{ id: string; analysisId: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { id, analysisId } = await params;
  const store = getStore();
  const analysis = await store.getAnalysis(analysisId);
  if (!analysis || analysis.userId !== user.id || analysis.projectId !== id) notFound();

  const plan = getPlan(user.plan);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <Link href={`/projects/${id}`} className="text-sm text-slate-500 hover:underline">
        ← 案件に戻る
      </Link>

      {analysis.status !== "succeeded" || !analysis.resultJson ? (
        <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {analysis.errorMessage ?? "分析に失敗しました。"}
        </div>
      ) : (
        <div className="mt-4">
          <MemoView
            analysisId={analysis.id}
            initialMemo={analysis.resultJson}
            allowedExportFormats={plan.allowedExportFormats}
          />
        </div>
      )}
    </div>
  );
}
