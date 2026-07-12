# KETTEI AI 開発進捗管理

このファイルで実装の進捗、仮定事項、未完了項目、ユーザー確認事項を記録する。
作業ディレクトリ: `kettei-ai/`（既存の `todo-app/` とは別プロジェクト）

最終更新: 進行中（自動更新）

## ステータス凡例
- [ ] 未着手
- [~] 進行中
- [x] 完了

## Phase 1: 要件整理・雛形
- [x] 要件の過不足整理（README Assumptionsに記録予定）
- [x] Next.js プロジェクト初期化 (Next.js 16 / TS/App Router/Tailwind v4)
- [x] ディレクトリ構成設計 (src/lib/{ai,db,auth,files,export,config})
- [x] .env.example
- [x] Supabase migration (schema + RLS) supabase/migrations/0001_init.sql
- [x] 料金設定ファイル src/lib/config/plans.ts
- [x] AIプロバイダー抽象化(Anthropic/Demo) + Zod Schema + JSON Schema + プロンプト
- [x] DBストア抽象化(DemoStore=JSONファイル / SupabaseStore=未検証)
- [x] 認証(デモモードJWT Cookie、Supabase Authは未実装と明記)
- [x] ファイル抽出(pdf-parse v2 API / mammoth / xlsx) + バリデーション + ローカルストレージ
- [x] 出力生成(Markdown / DOCX(docxパッケージ) / PDF(Playwright+システムIPAGothicフォント))

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
- [ ] unit test (vitest)
- [ ] e2e test (playwright, 最小限)
- [ ] 実機での手動動作確認（デモモード一気通貫）
- [ ] README/SECURITY.md/CHANGELOG.md/ロードマップ

## 進行中の作業メモ
- ここまででコア機能一式（認証〜分析〜編集〜出力〜管理者〜規約類）を実装しビルド通過を確認済み。
- 次は実サーバー起動での手動E2E確認 → 自動テスト → ドキュメント整備の順で進める。

## 仮定事項（README Assumptionsと同期）
（実装しながら追記）

## 未実装・既知の制約
（実装しながら追記）

## ユーザー確認が必要な項目（最後にまとめる）
（実装完了後にまとめる）
