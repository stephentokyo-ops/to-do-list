-- Supabase Storage バケット作成（アップロード資料・出力ファイル用）
-- 注意: 実際のSupabaseプロジェクトでの動作確認は行っていない。
-- どちらのバケットも非公開（public=false）。アプリはservice_role_keyでのみアクセスする。

insert into storage.buckets (id, name, public)
values ('uploads', 'uploads', false)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('exports', 'exports', false)
on conflict (id) do nothing;

-- service_role以外（anon/authenticated）からの直接アクセスは許可しない。
-- ファイルの読み書きは常にRoute Handler（service_role_key使用）経由で行う設計のため、
-- ここでは追加のストレージRLSポリシーは作成しない。
