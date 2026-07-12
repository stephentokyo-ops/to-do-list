import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { NavLogoutButton } from "./nav-logout-button";

export async function Navbar() {
  const user = await getCurrentUser();

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="text-lg font-bold tracking-tight text-slate-900">
          KETTEI AI
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          {user ? (
            <>
              <Link href="/dashboard" className="rounded-md px-3 py-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900">
                ダッシュボード
              </Link>
              <Link href="/history" className="rounded-md px-3 py-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900">
                案件履歴
              </Link>
              <Link href="/usage" className="rounded-md px-3 py-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900">
                使用量・プラン
              </Link>
              <Link href="/account" className="rounded-md px-3 py-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900">
                アカウント
              </Link>
              {user.role === "admin" && (
                <Link href="/admin" className="rounded-md px-3 py-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900">
                  管理者
                </Link>
              )}
              <span className="ml-2 hidden text-slate-400 sm:inline">{user.displayName || user.email}</span>
              <NavLogoutButton />
            </>
          ) : (
            <>
              <Link href="/login" className="rounded-md px-3 py-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900">
                ログイン
              </Link>
              <Link
                href="/signup"
                className="rounded-md bg-slate-900 px-3 py-2 text-white hover:bg-slate-700"
              >
                無料で始める
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
