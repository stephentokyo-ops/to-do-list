import { NextResponse } from "next/server";
import { requireUser, AuthError } from "@/lib/auth";
import { getStore } from "@/lib/db";
import { getPlan } from "@/lib/config/plans";
import { CreateProjectSchema } from "@/lib/validation/project";

export async function GET() {
  try {
    const user = await requireUser();
    const store = getStore();
    const projects = await store.listProjectsByUser(user.id);
    return NextResponse.json({ projects });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: 401 });
    return NextResponse.json({ error: "案件一覧の取得に失敗しました。" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const body = await request.json().catch(() => null);
    const parsed = CreateProjectSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "入力内容を確認してください。" },
        { status: 400 },
      );
    }

    const store = getStore();
    const plan = getPlan(user.plan);
    const yearMonth = new Date().toISOString().slice(0, 7);
    const usage = await store.getMonthlyUsage(user.id, yearMonth);
    const monthlyLimit = user.monthlyLimit ?? plan.monthlyProjectLimit;
    if (usage.projectCount >= monthlyLimit) {
      return NextResponse.json(
        {
          error: `今月の案件作成上限（${monthlyLimit}件）に達しています。プランをアップグレードするか、来月お試しください。`,
        },
        { status: 403 },
      );
    }

    const project = await store.createProject({
      userId: user.id,
      title: parsed.data.title,
      analysisType: parsed.data.analysisType,
      background: parsed.data.background,
      priorityPoints: parsed.data.priorityPoints,
      deadline: parsed.data.deadline,
      inputText: parsed.data.inputText,
      status: "draft",
    });

    return NextResponse.json({ project });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: 401 });
    return NextResponse.json({ error: "案件の作成に失敗しました。" }, { status: 500 });
  }
}
