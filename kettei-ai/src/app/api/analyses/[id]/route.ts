import { NextResponse } from "next/server";
import { requireUser, AuthError } from "@/lib/auth";
import { getStore } from "@/lib/db";
import { DecisionMemoSchema } from "@/lib/ai/schema";
import { memoToMarkdown } from "@/lib/export/markdown";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const analysis = await getStore().getAnalysis(id);
    if (!analysis || analysis.userId !== user.id) {
      return NextResponse.json({ error: "分析結果が見つかりません。" }, { status: 404 });
    }
    return NextResponse.json({ analysis });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: 401 });
    return NextResponse.json({ error: "分析結果の取得に失敗しました。" }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const store = getStore();
    const analysis = await store.getAnalysis(id);
    if (!analysis || analysis.userId !== user.id) {
      return NextResponse.json({ error: "分析結果が見つかりません。" }, { status: 404 });
    }

    const body = await request.json().catch(() => null);
    const parsed = DecisionMemoSchema.safeParse(body?.memo);
    if (!parsed.success) {
      return NextResponse.json({ error: "編集内容の形式が正しくありません。" }, { status: 400 });
    }

    const updated = await store.updateAnalysis(id, {
      resultJson: parsed.data,
      resultMarkdown: memoToMarkdown(parsed.data),
    });
    return NextResponse.json({ analysis: updated });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: 401 });
    return NextResponse.json({ error: "分析結果の更新に失敗しました。" }, { status: 500 });
  }
}
