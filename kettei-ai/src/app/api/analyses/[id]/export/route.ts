import { NextResponse } from "next/server";
import { requireUser, AuthError } from "@/lib/auth";
import { getStore } from "@/lib/db";
import { getPlan } from "@/lib/config/plans";
import { memoToDocxBuffer } from "@/lib/export/docx";
import { memoToPdfBuffer } from "@/lib/export/pdf";
import { saveExportFile } from "@/lib/files/storage";
import type { ExportFormat } from "@/lib/db/types";

const CONTENT_TYPES: Record<ExportFormat, string> = {
  markdown: "text/markdown; charset=utf-8",
  pdf: "application/pdf",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const url = new URL(request.url);
    const format = (url.searchParams.get("format") || "markdown") as ExportFormat;

    if (!["markdown", "pdf", "docx"].includes(format)) {
      return NextResponse.json({ error: "出力形式が不正です。" }, { status: 400 });
    }

    const store = getStore();
    const analysis = await store.getAnalysis(id);
    if (!analysis || analysis.userId !== user.id || !analysis.resultJson) {
      return NextResponse.json({ error: "分析結果が見つかりません。" }, { status: 404 });
    }

    const plan = getPlan(user.plan);
    if (!plan.allowedExportFormats.includes(format)) {
      return NextResponse.json(
        { error: `現在のプランでは${format}形式の出力はご利用いただけません。` },
        { status: 403 },
      );
    }

    let buffer: Buffer;
    let filename: string;
    if (format === "markdown") {
      buffer = Buffer.from(analysis.resultMarkdown ?? "", "utf-8");
      filename = "decision-memo.md";
    } else if (format === "docx") {
      buffer = await memoToDocxBuffer(analysis.resultJson);
      filename = "decision-memo.docx";
    } else {
      buffer = await memoToPdfBuffer(analysis.resultJson, plan.pdfWatermark);
      filename = "decision-memo.pdf";
    }

    const storagePath = await saveExportFile(buffer, analysis.id, format);
    await store.createExport({ analysisId: analysis.id, userId: user.id, format, storagePath });

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": CONTENT_TYPES[format],
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: 401 });
    const message = err instanceof Error ? err.message : "出力の生成に失敗しました。";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
