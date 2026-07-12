# KETTEI AI 開発進捗管理

このファイルで実装の進捗、仮定事項、未完了項目、ユーザー確認事項を記録する。
作業ディレクトリ: `kettei-ai/`（既存の `todo-app/` とは別プロジェクト）

最終更新: MVP一通り完了

## ステータス凡例
- [ ] 未着手
- [~] 進行中
- [x] 完了

## Phase 1: 要件整理・雛形
- [x] 要件の過不足整理（README Assumptionsに記録）
- [x] Next.js プロジェクト初期化 (Next.js 16 / TS/App Router/Tailwind v4)
- [x] ディレクトリ構成設計 (src/lib/{ai,db,auth,files,export,config})
- [x] .env.example
- [x] Supabase migration (schema + RLS) supabase/migrations/0001_init.sql
- [x] 料金設定ファイル src/lib/config/plans.ts

## Phase 2: 認証・案件・アップロード
- [x] 認証（デモモード: ローカルJSON+JWT Cookie。Supabase Authは未実装/未検証と明記）
- [x] ダッシュボード
- [x] 案件作成フォーム
- [x] ファイルアップロード + テキスト抽出 (pdf/docx/xlsx/csv/txt)

## Phase 3: AI分析
- [x] AIプロバイダー抽象化 (Anthropic / Demo)
- [x] Zod Schema（意思決定メモ構造）
- [x] 分析API + 再試行処理（safeParse失敗時に最大2回リトライ）
- [x] 使用量記録・プラン制限（月間件数・文字数上限）

## Phase 4: 結果表示・出力
- [x] 意思決定メモ表示・編集画面（事実/推測/要確認をバッジで視覚区別、全項目編集可能）
- [x] 履歴一覧
- [x] Markdown/PDF/DOCX出力

## Phase 5: 管理・周辺
- [x] 管理者ダッシュボード
- [x] デモモード（サンプル案件ワンクリック投入）
- [x] 利用規約・プライバシーポリシー雛形
- [x] ランディングページ
- [x] アカウント設定（退会・データ削除導線）

## Phase 6: 品質保証
- [x] lint（エラーなし）
- [x] typecheck（エラーなし）
- [x] build（本番ビルド成功）
- [x] unit test (vitest, 26件全て成功)
- [x] e2e test (playwright, 主要フロー3件全て成功)
- [x] 実機での手動動作確認（signup/login/サンプル案件/分析/編集/Markdown・PDF・DOCX出力/管理者/退会を全てcurl+実サーバーで確認）
- [x] README/SECURITY.md/CHANGELOG.md/ロードマップ

## 実装中に発見・修正した重大バグ（記録として残す）

1. **デモJSONストアのクロスモジュールキャッシュ不整合**: Next.jsのRoute HandlerとPage Server Componentが別モジュール実体としてバンドルされることがあり、案件作成直後に他ページから404扱いされる不具合をPlaywright E2Eテストで検出。ストアを常にディスクから読み直す設計に変更して解消（`src/lib/db/demo-store.ts`）。
2. **PDFアップロード時のテキスト抽出が常に失敗**: pdf-parse(pdfjs-dist)がNext.jsのサーバーバンドルに含まれるとworkerスクリプトの相対パス解決に失敗する既知の問題。`next.config.ts`の`serverExternalPackages`でバンドル対象から除外して解消。実PDFファイルのアップロードで抽出成功を確認済み。

いずれも「動くはず」で終わらせず、実サーバーに対する手動確認・自動テストで検出・修正済み。

## 仮定事項（README Assumptionsと同期・詳細はkettei-ai/README.md参照）

1. 認証はデモモード（自前JWT）のみ完全実装。Supabase Auth連携は抽象化層のみで未実装・未検証。
2. ファイルストレージはローカルファイルシステムで代替（Supabase Storage未検証）。
3. PDF生成はPlaywright+Chromium方式（サーバーレス環境向け代替実装は未実施）。
4. 決済機能は実装せず、プラン制限ロジックと料金表示のみ。
5. 案件作成〜ファイルアップロードを2画面に分割（要件書のUIフローを一部再構成）。
6. 意思決定メモの編集はセクションごとの構造化編集UI（Markdown直接編集ではない）。
7. 管理者ロールへの昇格UIはなし（シードアカウントまたはデータ直接編集）。
8. AIコスト見積りはAnthropic公表単価のハードコードによる概算。

## 未実装・既知の制約

- Supabase Auth連携（未実装、デモモードのみ動作）
- Supabase Storage連携（未実装、ローカルFSで代替）
- 決済機能（Stripe等、未実装）
- PDF生成のサーバーレス対応（Vercel等では要修正、README参照）
- 管理者昇格UI（なし）
- レート制限・ブルートフォース対策（未実装、SECURITY.md参照）
- 監査ログの強化（未実装）

## ユーザー確認が必要な項目（最後にまとめる）

このセッションでは質問せず合理的な仮定を置いて完成させたが、次の項目は人間の判断が必要なため、作業完了後にチャットで報告する:

1. 本番投入前にSupabase Auth/Storageへの接続・実装を行うか、デモ認証のまま小規模運用するか
2. Vercelへのデプロイを想定する場合、PDF生成をサーバーレス対応Chromium（`@sparticuz/chromium`等）へ切り替える対応をこのまま依頼するか
3. Anthropic APIキーを設定して実際のAI分析を試すか（現状はデモプロバイダーで全画面確認済み）
4. 料金プラン・価格の妥当性（`src/lib/config/plans.ts`の初期値は要件書の数値をそのまま反映）
