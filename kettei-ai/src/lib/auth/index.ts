import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";
import { getStore, isDemoDb } from "@/lib/db";
import type { Profile } from "@/lib/db/types";
import { clearDemoSession, createDemoSession, getDemoSession } from "./session";
import { createSupabaseServerClient } from "./supabase-server";

export class AuthError extends Error {}

// 認証はデモモード（自前JWT Cookie + bcryptハッシュ）とSupabase Authの2系統を持つ。
// isDemoDb()がfalse（Supabase接続情報が設定されている）場合はSupabase Auth経路を使用する。
// 注意: Supabase Auth経路は実際のSupabaseプロジェクトへの接続・動作確認を行っていない。
// 本番投入前に必ずステージング環境で検証すること。

function translateSupabaseAuthError(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes("already registered") || lower.includes("already exists")) {
    return "このメールアドレスは既に登録されています。";
  }
  if (lower.includes("invalid login credentials")) {
    return "メールアドレスまたはパスワードが正しくありません。";
  }
  if (lower.includes("password should be at least") || lower.includes("password is too short")) {
    return "パスワードは8文字以上で入力してください。";
  }
  if (lower.includes("unable to validate email") || lower.includes("invalid email")) {
    return "メールアドレスの形式が正しくありません。";
  }
  return "認証処理でエラーが発生しました。しばらくしてから再度お試しください。";
}

export async function signUp(
  email: string,
  password: string,
  displayName: string,
): Promise<Profile> {
  if (!isDemoDb()) {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName } },
    });
    if (error) throw new AuthError(translateSupabaseAuthError(error.message));
    if (!data.user) throw new AuthError("登録に失敗しました。");
    if (!data.session) {
      // メール確認が有効な場合、signUp直後はセッションが発行されない。
      throw new AuthError(
        "確認メールを送信しました。メール内のリンクから登録を完了してからログインしてください。",
      );
    }
    // supabase/migrations/0001_init.sqlのhandle_new_user()トリガーがprofiles行を自動作成する。
    const profile = await getStore().getProfileById(data.user.id);
    if (!profile) {
      throw new AuthError(
        "アカウントは作成されましたが、プロフィール情報の取得に失敗しました。管理者にお問い合わせください。",
      );
    }
    return profile;
  }

  const store = getStore();
  const existing = await store.getProfileByEmail(email);
  if (existing) throw new AuthError("このメールアドレスは既に登録されています。");

  const passwordHash = await bcrypt.hash(password, 10);
  const profile = await store.createProfile({
    id: randomUUID(),
    email,
    passwordHash,
    displayName,
    role: "user",
    plan: "free",
    monthlyLimit: null,
    stripeCustomerId: null,
    stripeSubscriptionId: null,
  });
  await createDemoSession({ userId: profile.id, email: profile.email, role: profile.role });
  return profile;
}

export async function signIn(email: string, password: string): Promise<Profile> {
  if (!isDemoDb()) {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new AuthError(translateSupabaseAuthError(error.message));
    const profile = await getStore().getProfileById(data.user.id);
    if (!profile) {
      throw new AuthError("プロフィール情報が見つかりません。管理者にお問い合わせください。");
    }
    return profile;
  }

  const store = getStore();
  const profile = await store.getProfileByEmail(email);
  if (!profile) throw new AuthError("メールアドレスまたはパスワードが正しくありません。");

  const valid = await bcrypt.compare(password, profile.passwordHash);
  if (!valid) throw new AuthError("メールアドレスまたはパスワードが正しくありません。");

  await createDemoSession({ userId: profile.id, email: profile.email, role: profile.role });
  return profile;
}

export async function signOut(): Promise<void> {
  if (!isDemoDb()) {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
    return;
  }
  await clearDemoSession();
}

export async function getCurrentUser(): Promise<Profile | null> {
  if (!isDemoDb()) {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase.auth.getUser();
    if (!data.user) return null;
    return getStore().getProfileById(data.user.id);
  }

  const session = await getDemoSession();
  if (!session) return null;
  return getStore().getProfileById(session.userId);
}

export async function requireUser(): Promise<Profile> {
  const user = await getCurrentUser();
  if (!user) throw new AuthError("ログインが必要です。");
  return user;
}

export async function requireAdmin(): Promise<Profile> {
  const user = await requireUser();
  if (user.role !== "admin") throw new AuthError("管理者権限が必要です。");
  return user;
}
