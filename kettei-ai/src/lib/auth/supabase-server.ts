import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

// Next.jsのServer Component/Route HandlerからSupabase Authセッションを
// 読み書きするためのサーバー用クライアント。anonキーで生成し、RLSはSupabase側で適用される。
// 注意: 実際のSupabaseプロジェクトへの接続・動作確認は行っていない。
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // Server Component内など、Cookie書き込みができない文脈からの呼び出しは無視する。
            // セッションの実書き込みはRoute Handler経由の呼び出し時に行われる。
          }
        },
      },
    },
  );
}
