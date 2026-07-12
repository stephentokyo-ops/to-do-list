# KETTEI AI 開発進捗管理

このファイルで実装の進捗、仮定事項、未完了項目、ユーザー確認事項を記録する。
作業ディレクトリ: `kettei-ai/`（既存の `todo-app/` とは別プロジェクト）

最終更新: 進行中（自動更新）

## ステータス凡例
- [ ] 未着手
- [~] 進行中
- [x] 完了

## Phase 1: 要件整理・雛形
- [ ] 要件の過不足整理（README Assumptionsに記録）
- [ ] Next.js プロジェクト初期化 (TS/App Router/Tailwind)
- [ ] ディレクトリ構成設計
- [ ] .env.example
- [ ] Supabase migration (schema + RLS)
- [ ] 料金設定ファイル

## Phase 2: 認証・案件・アップロード
- [ ] 認証（デモモード: ローカルJSON, 本番: Supabase Auth 抽象化）
- [ ] ダッシュボード
- [ ] 案件作成フォーム
- [ ] ファイルアップロード + テキスト抽出 (pdf/docx/xlsx/csv/txt)

## Phase 3: AI分析
- [ ] AIプロバイダー抽象化 (Anthropic / Demo)
- [ ] Zod Schema（意思決定メモ構造）
- [ ] 分析API + 再試行処理
- [ ] 使用量記録・プラン制限

## Phase 4: 結果表示・出力
- [ ] 意思決定メモ表示・編集画面
- [ ] 履歴一覧
- [ ] Markdown/PDF/DOCX出力

## Phase 5: 管理・周辺
- [ ] 管理者ダッシュボード
- [ ] デモモード（サンプル案件ワンクリック投入）
- [ ] 利用規約・プライバシーポリシー雛形
- [ ] ランディングページ

## Phase 6: 品質保証
- [ ] lint
- [ ] typecheck
- [ ] unit test (vitest)
- [ ] e2e test (playwright, 最小限)
- [ ] build
- [ ] README/SECURITY.md/CHANGELOG.md/ロードマップ

## 仮定事項（README Assumptionsと同期）
（実装しながら追記）

## 未実装・既知の制約
（実装しながら追記）

## ユーザー確認が必要な項目（最後にまとめる）
（実装完了後にまとめる）
