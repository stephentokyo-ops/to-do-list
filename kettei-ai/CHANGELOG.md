# Changelog

このプロジェクトの主要な変更を記録します。

## [0.1.0] - MVP初期リリース

### 追加

- Next.js 16 (App Router) / TypeScript / Tailwind CSS v4によるプロジェクト基盤
- デモモード（環境変数未設定でも全画面動作）と本番モード（Supabase/Anthropic）の自動切り替え
- 認証（デモモード: JWT Cookie + bcrypt）、新規登録・ログイン・ログアウト画面
- 案件作成フォーム（分析目的10種、前提・重視項目・期限・テキスト入力）
- ファイルアップロード・テキスト抽出（PDF / DOCX / XLSX / TXT / CSV）
- ファイルバリデーション（拡張子・MIME・サイズ・ファイル名正規化）
- AIプロバイダー抽象化（Anthropic API / デモプロバイダー）
- 意思決定メモの構造化Zodスキーマとプロンプト定義、Tool Useによる構造化出力強制、失敗時の自動リトライ
- 意思決定メモ表示・編集画面（事実/推測/要確認をバッジで視覚的に区別、全セクション編集可能）
- Markdown / DOCX / PDF出力（PDFはPlaywright+Chromiumで日本語フォント対応）
- 案件履歴、使用量・プラン画面、料金プラン設定ファイル
- 管理者ダッシュボード（ユーザー別使用量集計）
- サンプル案件のワンクリック投入
- アカウント設定（退会・全データ削除導線）
- 利用規約・プライバシーポリシー雛形
- Supabaseマイグレーション（スキーマ + RLSポリシー）
- Vitestによる単体テスト、Playwrightによる主要フローE2Eテスト

### 修正

- デモ用JSONストアがNext.jsのモジュールバンドル境界をまたいでキャッシュ不整合を起こし、案件作成直後に404となる不具合を修正（常にディスクから読み直す設計に変更）
- pdf-parse(pdfjs-dist)がNext.jsサーバーバンドルに含まれるとworkerスクリプトの解決に失敗しPDF抽出が常に失敗する不具合を修正（`serverExternalPackages`設定で対応）

## [0.2.0] - 本番連携の実装（Supabase / Stripe / サーバーレスPDF）

### 追加

- Supabase Auth連携（`@supabase/ssr`）: 新規登録・ログイン・ログアウト・現在ユーザー取得をSupabase Auth経由で実行するモードを追加（デモモードと自動切り替え）
- Supabase Storage連携: ファイルアップロード・出力ファイル保存をSupabase Storageバケットへ保存するモードを追加（`supabase/migrations/0002_storage_buckets.sql`）
- 退会処理をSupabase Auth Admin API（`auth.admin.deleteUser`）に対応し、関連データをカスケード削除
- サーバーレス対応PDF生成: ローカル開発用Chromiumが見つからない場合、`@sparticuz/chromium`と同梱の日本語フォント（IPAゴシック、`assets/fonts/`）に自動フォールバック。実際にサーバーレスバイナリでの日本語描画を確認済み
- Stripe決済連携: `/api/billing/checkout`（Checkout Session作成）、`/api/billing/webhook`（署名検証・プラン反映）、使用量・プラン画面へのアップグレードボタンを追加。`STRIPE_SECRET_KEY`未設定時は自動的に非表示になり既存のデモ体験に影響しない
- Profileに`stripeCustomerId`・`stripeSubscriptionId`を追加

### 注記

- Supabase Auth/Storage・Stripeはいずれも実際の外部アカウントに接続できない開発環境で実装したため、公式ドキュメントの仕様に基づくコードであり実機動作検証は未実施。本番投入前にステージング環境での検証が必須（README/SECURITY.md参照）。
