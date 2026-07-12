import { NextResponse } from "next/server";
import { requireUser, AuthError } from "@/lib/auth";
import { getStore } from "@/lib/db";
import { getPlan } from "@/lib/config/plans";
import { getAIProvider, AIProviderError } from "@/lib/ai";
import { memoToMarkdown } from "@/lib/export/markdown";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id: projectId } = await params;
    const store = getStore();
    const project = await store.getProject(projectId);
    if (!project || project.userId !== user.id) {
      return NextResponse.json({ error: "案件が見つかりません。" }, { status: 404 });
    }

    const plan = getPlan(user.plan);
    const documents = await store.listDocumentsByProject(projectId);
    const totalChars =
      project.inputText.length + documents.reduce((sum, d) => sum + d.extractedText.length, 0);
    if (totalChars === 0) {
      return NextResponse.json(
        { error: "分析対象のテキストがありません。テキストを入力するか資料をアップロードしてください。" },
        { status: 400 },
      );
    }
    if (totalChars > plan.maxCharsPerProject) {
      return NextResponse.json(
        {
          error: `1案件あたりの文字数上限（${plan.maxCharsPerProject.toLocaleString()}文字）を超えています。`,
        },
        { status: 403 },
      );
    }

    await store.updateProject(projectId, { status: "analyzing" });

    const provider = getAIProvider();
    const docInputs = [
      ...(project.inputText.trim() ? [{ label: "テキスト直接入力", text: project.inputText }] : []),
      ...documents
        .filter((d) => d.extractionStatus === "success" && d.extractedText.trim())
        .map((d) => ({ label: d.originalFilename, text: d.extractedText })),
    ];

    try {
      const result = await provider.analyze({
        projectTitle: project.title,
        analysisTypeId: project.analysisType,
        background: project.background,
        priorityPoints: project.priorityPoints,
        deadline: project.deadline,
        documents: docInputs,
      });

      const markdown = memoToMarkdown(result.memo);
      const analysis = await store.createAnalysis({
        projectId,
        userId: user.id,
        provider: result.provider,
        model: result.model,
        promptVersion: result.promptVersion,
        inputTokens: result.inputTokens,
        outputTokens: result.outputTokens,
        estimatedCost: result.estimatedCostUsd,
        status: "succeeded",
        resultJson: result.memo,
        resultMarkdown: markdown,
        errorMessage: null,
      });

      await store.recordUsage({
        userId: user.id,
        analysisId: analysis.id,
        inputTokens: result.inputTokens,
        outputTokens: result.outputTokens,
        estimatedCost: result.estimatedCostUsd,
      });

      await store.updateProject(projectId, { status: "completed" });

      return NextResponse.json({ analysis });
    } catch (err) {
      const message =
        err instanceof AIProviderError ? err.message : "AI分析中にエラーが発生しました。";
      await store.createAnalysis({
        projectId,
        userId: user.id,
        provider: provider.name,
        model: "unknown",
        promptVersion: "unknown",
        inputTokens: 0,
        outputTokens: 0,
        estimatedCost: 0,
        status: "failed",
        resultJson: null,
        resultMarkdown: null,
        errorMessage: message,
      });
      await store.updateProject(projectId, { status: "failed" });
      return NextResponse.json({ error: message }, { status: 502 });
    }
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: 401 });
    return NextResponse.json({ error: "分析処理に失敗しました。" }, { status: 500 });
  }
}
