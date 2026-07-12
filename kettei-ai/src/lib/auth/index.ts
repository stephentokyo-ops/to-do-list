import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";
import { getStore, isDemoDb } from "@/lib/db";
import type { Profile } from "@/lib/db/types";
import { clearDemoSession, createDemoSession, getDemoSession } from "./session";

export class AuthError extends Error {}

// 認証は現状デモモード（自前JWT Cookie + bcryptハッシュ）のみ実装済み。
// Supabase Auth連携（本番向け）は supabase/migrations のスキーマに合わせて
// @supabase/ssr を用いた実装への差し替えを想定しているが、
// このプロジェクトでは実際のSupabaseプロジェクトに接続できないため未実装・未検証。
// isDemoDb() が false の環境（本番）でこの関数群を使う前に、Supabase Auth連携を実装すること。

export async function signUp(
  email: string,
  password: string,
  displayName: string,
): Promise<Profile> {
  if (!isDemoDb()) {
    throw new AuthError(
      "Supabase Auth連携は未実装です。デモモード（環境変数未設定）でご利用ください。",
    );
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
  });
  await createDemoSession({ userId: profile.id, email: profile.email, role: profile.role });
  return profile;
}

export async function signIn(email: string, password: string): Promise<Profile> {
  if (!isDemoDb()) {
    throw new AuthError(
      "Supabase Auth連携は未実装です。デモモード（環境変数未設定）でご利用ください。",
    );
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
  await clearDemoSession();
}

export async function getCurrentUser(): Promise<Profile | null> {
  const session = await getDemoSession();
  if (!session) return null;
  const store = getStore();
  return store.getProfileById(session.userId);
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
