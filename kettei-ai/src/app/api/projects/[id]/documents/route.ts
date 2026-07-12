import { NextResponse } from "next/server";
import { requireUser, AuthError } from "@/lib/auth";
import { getStore } from "@/lib/db";
import { getPlan } from "@/lib/config/plans";
import { validateUploadedFile, getExtension, FileValidationError } from "@/lib/files/validate";
import { extractTextFromFile } from "@/lib/files/extract";
import { saveUploadedFile } from "@/lib/files/storage";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id: projectId } = await params;
    const store = getStore();
    const project = await store.getProject(projectId);
    if (!project || project.userId !== user.id) {
      return NextResponse.json({ error: "案件が見つかりません。" }, { status: 404 });
    }

    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "ファイルが指定されていません。" }, { status: 400 });
    }

    validateUploadedFile({ name: file.name, type: file.type, size: file.size });

    const buffer = Buffer.from(await file.arrayBuffer());
    const extension = getExtension(file.name);
    const extraction = await extractTextFromFile(buffer, extension);
    const storagePath = await saveUploadedFile(buffer, file.name);

    // 文字数上限チェック（既存資料 + 案件テキスト + 今回の資料）
    const plan = getPlan(user.plan);
    const existingDocs = await store.listDocumentsByProject(projectId);
    const currentChars =
      project.inputText.length + existingDocs.reduce((sum, d) => sum + d.extractedText.length, 0);
    if (currentChars + extraction.text.length > plan.maxCharsPerProject) {
      return NextResponse.json(
        {
          error: `1案件あたりの文字数上限（${plan.maxCharsPerProject.toLocaleString()}文字）を超えるため、このファイルは追加できません。`,
        },
        { status: 403 },
      );
    }

    const document = await store.createDocument({
      projectId,
      userId: user.id,
      originalFilename: file.name,
      storagePath,
      mimeType: file.type || "application/octet-stream",
      sizeBytes: file.size,
      extractedText: extraction.text,
      extractionStatus: extraction.status,
      errorMessage: extraction.errorMessage,
    });

    return NextResponse.json({ document });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: 401 });
    if (err instanceof FileValidationError) return NextResponse.json({ error: err.message }, { status: 400 });
    return NextResponse.json({ error: "ファイルのアップロードに失敗しました。" }, { status: 500 });
  }
}
