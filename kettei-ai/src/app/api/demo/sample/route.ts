import { NextResponse } from "next/server";
import { requireUser, AuthError } from "@/lib/auth";
import { getStore } from "@/lib/db";
import { SAMPLE_PROJECT } from "@/lib/data/sample-project";

export async function POST() {
  try {
    const user = await requireUser();
    const store = getStore();
    const project = await store.createProject({
      userId: user.id,
      title: SAMPLE_PROJECT.title,
      analysisType: SAMPLE_PROJECT.analysisType,
      background: SAMPLE_PROJECT.background,
      priorityPoints: SAMPLE_PROJECT.priorityPoints,
      deadline: SAMPLE_PROJECT.deadline,
      inputText: SAMPLE_PROJECT.inputText,
      status: "draft",
    });
    return NextResponse.json({ project });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: 401 });
    return NextResponse.json({ error: "サンプル案件の作成に失敗しました。" }, { status: 500 });
  }
}
