import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getStore } from "@/lib/db";
import { getAnalysisType } from "@/lib/config/analysis-types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DocumentUploader } from "@/components/projects/document-uploader";
import { AnalyzePanel } from "@/components/projects/analyze-panel";
import { formatDateTimeJst } from "@/lib/utils";

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { id } = await params;
  const store = getStore();
  const project = await store.getProject(id);
  if (!project || project.userId !== user.id) notFound();

  const [documents, analyses] = await Promise.all([
    store.listDocumentsByProject(id),
    store.listAnalysesByProject(id),
  ]);
  const analysisType = getAnalysisType(project.analysisType);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 space-y-6">
      <div>
        <p className="text-sm text-slate-500">{analysisType.label}</p>
        <h1 className="text-2xl font-bold text-slate-900">{project.title}</h1>
        {project.deadline && <p className="mt-1 text-sm text-slate-500">期限: {project.deadline}</p>}
      </div>

      {(project.background || project.priorityPoints) && (
        <Card>
          <CardContent className="space-y-2 text-sm text-slate-600">
            {project.background && (
              <p>
                <span className="font-medium text-slate-700">前提・背景: </span>
                {project.background}
              </p>
            )}
            {project.priorityPoints && (
              <p>
                <span className="font-medium text-slate-700">重視項目: </span>
                {project.priorityPoints}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>資料アップロード</CardTitle>
        </CardHeader>
        <CardContent>
          <DocumentUploader projectId={id} documents={documents} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>分析を実行</CardTitle>
        </CardHeader>
        <CardContent>
          <AnalyzePanel projectId={id} />
        </CardContent>
      </Card>

      {analyses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>この案件の分析履歴</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="divide-y divide-slate-100">
              {analyses.map((a) => (
                <li key={a.id} className="flex items-center justify-between py-3">
                  <div>
                    <Link
                      href={`/projects/${id}/analyses/${a.id}`}
                      className="font-medium text-slate-900 hover:underline"
                    >
                      {formatDateTimeJst(a.createdAt)}の分析
                    </Link>
                    <p className="text-xs text-slate-500">
                      {a.provider} / {a.model}
                    </p>
                  </div>
                  <Badge tone={a.status === "succeeded" ? "success" : a.status === "failed" ? "risk" : "neutral"}>
                    {a.status === "succeeded" ? "完了" : a.status === "failed" ? "失敗" : "処理中"}
                  </Badge>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
