import { NextResponse } from "next/server";
import { requireUser, AuthError } from "@/lib/auth";
import { getStore } from "@/lib/db";

async function loadOwnedProject(projectId: string, userId: string) {
  const store = getStore();
  const project = await store.getProject(projectId);
  if (!project || project.userId !== userId) return null;
  return project;
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const project = await loadOwnedProject(id, user.id);
    if (!project) return NextResponse.json({ error: "案件が見つかりません。" }, { status: 404 });

    const store = getStore();
    const [documents, analyses] = await Promise.all([
      store.listDocumentsByProject(id),
      store.listAnalysesByProject(id),
    ]);
    return NextResponse.json({ project, documents, analyses });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: 401 });
    return NextResponse.json({ error: "案件の取得に失敗しました。" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const project = await loadOwnedProject(id, user.id);
    if (!project) return NextResponse.json({ error: "案件が見つかりません。" }, { status: 404 });

    await getStore().deleteProject(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: 401 });
    return NextResponse.json({ error: "案件の削除に失敗しました。" }, { status: 500 });
  }
}
