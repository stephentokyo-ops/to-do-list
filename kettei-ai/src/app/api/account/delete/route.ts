import { NextResponse } from "next/server";
import { requireUser, signOut, AuthError } from "@/lib/auth";
import { getStore } from "@/lib/db";

export async function POST() {
  try {
    const user = await requireUser();
    await getStore().deleteProfile(user.id);
    await signOut();
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: 401 });
    return NextResponse.json({ error: "退会処理に失敗しました。" }, { status: 500 });
  }
}
