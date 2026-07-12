import { NextResponse } from "next/server";
import { z } from "zod";
import { signUp, AuthError } from "@/lib/auth";

const SignupSchema = z.object({
  email: z.string().email("メールアドレスの形式が正しくありません。"),
  password: z.string().min(8, "パスワードは8文字以上で入力してください。"),
  displayName: z.string().min(1, "表示名を入力してください。").max(100),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = SignupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "入力内容を確認してください。" },
      { status: 400 },
    );
  }

  try {
    const profile = await signUp(parsed.data.email, parsed.data.password, parsed.data.displayName);
    return NextResponse.json({ id: profile.id, email: profile.email });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    return NextResponse.json({ error: "登録処理に失敗しました。" }, { status: 500 });
  }
}
