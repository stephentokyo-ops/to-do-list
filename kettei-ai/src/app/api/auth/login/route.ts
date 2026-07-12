import { NextResponse } from "next/server";
import { z } from "zod";
import { signIn, AuthError } from "@/lib/auth";

const LoginSchema = z.object({
  email: z.string().email("メールアドレスの形式が正しくありません。"),
  password: z.string().min(1, "パスワードを入力してください。"),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = LoginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "入力内容を確認してください。" },
      { status: 400 },
    );
  }

  try {
    const profile = await signIn(parsed.data.email, parsed.data.password);
    return NextResponse.json({ id: profile.id, email: profile.email });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    return NextResponse.json({ error: "ログイン処理に失敗しました。" }, { status: 500 });
  }
}
