import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

const COOKIE_NAME = "kettei_session";
const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 7; // 7日間

function getSecretKey(): Uint8Array {
  const secret = process.env.AUTH_SECRET || "dev-only-change-me-in-production-please";
  return new TextEncoder().encode(secret);
}

export interface SessionPayload {
  userId: string;
  email: string;
  role: "user" | "admin";
}

// デモモード用の自前セッション管理（JWT + httpOnly Cookie）。
// Supabase接続時は Supabase Auth のセッションCookieを利用するため使用しない。
export async function createDemoSession(payload: SessionPayload): Promise<void> {
  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
    .sign(getSecretKey());

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION_SECONDS,
  });
}

export async function getDemoSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    return {
      userId: payload.userId as string,
      email: payload.email as string,
      role: payload.role as "user" | "admin",
    };
  } catch {
    return null;
  }
}

export async function clearDemoSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
