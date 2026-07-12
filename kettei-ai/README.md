# KETTEI AI（MVP）

> 散らばった資料を、社長が判断できる1枚に。

社内のメール・議事録・PDF・Word・Excel・メモを投入すると、経営者が判断できる「1枚の意思決定メモ」（結論・確信度・事実・推測・論点・選択肢比較・推奨案・未確認事項・数値整合性チェック・次のアクション・リスク）に変換するWebサービスのMVP実装です。

## 目次

- [クイックスタート（デモモード）](#クイックスタートデモモード)
- [技術スタック](#技術スタック)
- [ディレクトリ構成](#ディレクトリ構成)
- [環境変数](#環境変数)
- [デモモードと本番モード](#デモモードと本番モード)
- [Supabaseセットアップ（本番運用）](#supabaseセットアップ本番運用)
- [Anthropic APIセットアップ（本番運用）](#anthropic-apiセットアップ本番運用)
- [テスト](#テスト)
- [Vercelへのデプロイ](#vercelへのデプロイ)
- [運用手順](#運用手順)
- [Assumptions（仮定事項）](#assumptions仮定事項)
- [未実装・既知の制約](#未実装既知の制約)
- [ロードマップ](#ロードマップ)

## クイックスタート（デモモード）

APIキーやSupabaseプロジェクトが無くても、デモモードで全画面を確認できます。

```bash
cd kettei-ai
npm install
npm run dev
```

`http://localhost:3000` を開き、「無料で意思決定メモを作る」から新規登録してください（デモモードでは入力したメールアドレス・パスワードでそのままアカウントが作成されます）。

初回起動時、以下のデモアカウントが自動的に作成されます（`.env.example` 参照、`.env.local` で変更可能）。

| 役割 | メールアドレス | パスワード |
| --- | --- | --- |
| 管理者 | `admin@kettei-ai.example.com` | `admin12345` |
| 一般ユーザー | `demo@kettei-ai.example.com` | `demo12345` |

ダッシュボードの「サンプル案件を試す」ボタンから、要件書記載のサンプル案件（海外仕入先からの支払サイト短縮要請）を1クリックで投入し、分析・結果表示・編集・Markdown/PDF/DOCX出力まで一通り確認できます。

デモモードのデータは `kettei-ai/.data/` 以下にJSONファイルとして保存されます（Git管理対象外）。リセットしたい場合:

```bash
npm run seed:demo
```

## 技術スタック

- **フロントエンド**: Next.js 16 (App Router) / TypeScript / Tailwind CSS v4 / React Hook Form / Zod
- **バックエンド**: Next.js Route Handlers
- **データベース**: Supabase (PostgreSQL) ※本番運用時。未接続時はローカルJSONストアで代替
- **認証**: デモモードは自前JWT Cookie。本番向けSupabase Auth連携は未実装（下記参照）
- **AI**: Anthropic API（`@anthropic-ai/sdk`）。未設定時はデモプロバイダー（固定サンプル出力）
- **ファイル解析**: pdf-parse / mammoth / xlsx
- **出力生成**: Markdown（自前テンプレート）/ DOCX（`docx`）/ PDF（Playwright + Chromium、システムの日本語フォントを使用）
- **テスト**: Vitest（単体テスト）/ Playwright（E2E）

## ディレクトリ構成

```
kettei-ai/
├── src/
│   ├── app/                  # App Router（画面・API Route Handler）
│   │   ├── api/               # 認証・案件・分析・出力・管理者API
│   │   ├── dashboard/ projects/ history/ usage/ account/ admin/ ...
│   │   ├── login/ signup/ terms/ privacy/
│   │   └── page.tsx           # ランディングページ
│   ├── components/
│   │   ├── ui/                 # 手作りのUIプリミティブ（shadcn/ui相当）
│   │   ├── layout/             # ナビゲーション
│   │   ├── projects/           # 案件作成・アップロード・分析トリガー
│   │   ├── analysis/           # 意思決定メモ表示・編集
│   │   └── account/
│   └── lib/
│       ├── ai/                 # AIプロバイダー抽象化・Zod Schema・プロンプト
│       ├── auth/                # 認証（デモ用セッション管理）
│       ├── db/                  # データストア抽象化（Demo/Supabase）
│       ├── files/                # アップロード検証・テキスト抽出・ローカルストレージ
│       ├── export/               # Markdown/DOCX/PDF生成
│       ├── config/                # 料金プラン・分析目的の定義
│       ├── data/                   # サンプル案件データ
│       └── validation/              # フォーム用Zod Schema
├── supabase/migrations/         # SQLマイグレーション（schema + RLS）
├── e2e/                          # Playwright E2Eテスト
├── scripts/reset-demo-data.ts    # デモデータリセットスクリプト
└── .env.example
```

## 環境変数

`.env.example` を `.env.local` にコピーして使用してください。すべて未設定でもデモモードで動作します。

| 変数 | 説明 |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` | 両方設定するとSupabaseストアを使用（詳細は下記） |
| `AI_PROVIDER` | `demo`（既定）または `anthropic` |
| `ANTHROPIC_API_KEY` / `ANTHROPIC_MODEL` | `AI_PROVIDER=anthropic` の場合に使用。モデル既定値は `claude-sonnet-5` |
| `AUTH_SECRET` | デモモードのセッションCookie署名鍵。本番では必ず変更 |
| `DEMO_ADMIN_EMAIL` / `DEMO_ADMIN_PASSWORD` / `DEMO_USER_EMAIL` / `DEMO_USER_PASSWORD` | デモシードアカウント |
| `MAX_UPLOAD_SIZE_MB` | アップロード1ファイルあたりの上限（既定20MB） |
| `PLAYWRIGHT_CHROMIUM_PATH` | PDF生成に使うChromiumの実行ファイルパス（既定は開発コンテナのプリインストール済みパス） |

## デモモードと本番モード

「本番APIキーがなくてもデモモードで全画面を確認可能にする」という要件を満たすため、以下の3箇所を環境変数の有無で自動切り替えする抽象化を行っています。

1. **データストア** (`src/lib/db`): `NEXT_PUBLIC_SUPABASE_URL` と `SUPABASE_SERVICE_ROLE_KEY` が両方揃っていなければ、ローカルJSONファイルストア（`DemoStore`）を使用します。
2. **AIプロバイダー** (`src/lib/ai`): `AI_PROVIDER=anthropic` かつ `ANTHROPIC_API_KEY` が設定されていなければ、固定サンプルを返す `DemoAIProvider` を使用します。
3. **認証** (`src/lib/auth`): 現状デモモード（自前JWT Cookie + bcryptハッシュ）のみ実装済みです。Supabase Auth連携は未実装です（詳細は「未実装・既知の制約」参照）。

## Supabaseセットアップ（本番運用）

> **重要**: この開発環境には実際のSupabaseプロジェクトへの接続がなく、以下の手順・`SupabaseStore`実装（`src/lib/db/supabase-store.ts`）・マイグレーションSQLは実機での動作検証を行っていません。本番投入前に必ずステージング環境で検証してください。

1. [Supabase](https://supabase.com)で新規プロジェクトを作成
2. `supabase/migrations/0001_init.sql` をSupabase SQL Editorで実行（テーブル・インデックス・RLSポリシーを作成）
3. プロジェクト設定から `Project URL` と `service_role` キーを取得し、`.env.local` に設定
4. Supabase Auth（メール/パスワード認証）を有効化
5. `src/lib/auth/index.ts` のSupabase Auth連携部分（現状 `AuthError` を投げるスタブ）を、`@supabase/ssr` を用いた実装に置き換える（`@supabase/supabase-js` は依存関係に含まれています）

## Anthropic APIセットアップ（本番運用）

1. [Anthropic Console](https://console.anthropic.com)でAPIキーを発行
2. `.env.local` に以下を設定:
   ```
   AI_PROVIDER=anthropic
   ANTHROPIC_API_KEY=sk-ant-...
   ANTHROPIC_MODEL=claude-sonnet-5
   ```
3. Route Handler (`/api/projects/[id]/analyze`) が `AIProvider` 抽象化経由でAnthropic APIを呼び出します。構造化出力はTool Use（`tool_choice`固定）で強制し、Zodスキーマ検証に失敗した場合は最大2回まで自動リトライします。

## テスト

```bash
npm run typecheck   # TypeScript型チェック
npm run lint         # ESLint
npm run test         # Vitest（単体テスト）
npm run test:e2e     # Playwright（E2E、デモモードで実行）
npm run build        # 本番ビルド
```

E2Eテストは `next dev` に対して実行します（本番ビルド `next start` はセッションCookieが `Secure` 属性付きになりHTTP環境では維持されないため）。詳細は `playwright.config.ts` を参照してください。

## Vercelへのデプロイ

1. GitHubリポジトリをVercelに接続
2. Root Directoryを `kettei-ai` に設定
3. 環境変数（上記「環境変数」表）をVercelのProject Settingsに設定
4. **PDF出力について**: 現在の実装はPlaywright(Chromium)でPDFを生成しており、`PLAYWRIGHT_CHROMIUM_PATH`が指すChromium実行ファイルの存在を前提としています。Vercelのサーバーレス環境ではこの前提が成り立たないため、本番デプロイ時は `@sparticuz/chromium` 等サーバーレス対応のChromiumバイナリへの切り替えが必要です（`src/lib/export/pdf.ts` 参照、未実装）。
5. デプロイ後、Supabase・Anthropic API連携を上記手順で有効化してください。

## 運用手順

- **利用状況の確認**: `/admin`（管理者ロールのユーザーのみ）でユーザー別の分析回数・推定コストを確認できます。
- **料金プランの変更**: `src/lib/config/plans.ts` を編集するだけでFree/Standard/Professionalの上限・価格を変更できます。
- **分析目的（評価軸）の追加**: `src/lib/config/analysis-types.ts` に項目を追加します。
- **プロンプトの変更**: `src/lib/ai/prompt.ts` を編集します。`PROMPT_VERSION` を更新すると、以後の分析結果に新バージョンが記録されます。
- **デモデータのリセット**: `npm run seed:demo`（`.data/`ディレクトリを削除し、次回アクセス時に再シードされます）。

## Assumptions（仮定事項）

要件書に対し、以下の合理的な仮定を置いて実装しました。

1. **認証方式**: MVPではSupabase Authの実機接続・検証ができないため、デモモード用の自前JWT Cookie認証を完全実装し、Supabase Auth連携は抽象化層とスキーマのみ用意して未実装のまま明記しました。本番投入前に実装・検証が必要です。
2. **ファイルストレージ**: Supabase Storageの代わりに、デモモードではローカルファイルシステム（`.data/uploads/`, `.data/exports/`）を使用します。本番相当のSupabase Storage実装も同様の理由で未検証です。
3. **PDF生成方式**: `pdfkit`等の直接描画ではなく、Playwright(Chromium)でHTMLをレンダリングしてPDF化する方式を採用しました。日本語フォント崩れを避けるため、システムにインストール済みのIPAGothicフォントを明示指定しています。サーバーレス環境向けの代替実装は未実施です。
4. **料金決済**: 要件書の指示どおり、Stripe等の決済実装は行わず、プラン別の利用制限ロジックと料金表示のみを実装しました。
5. **案件作成〜ファイルアップロードの画面分割**: 要件書のユーザーフロー（案件名→分析目的→入力→前提/期限→分析実行）を、実装上「案件作成フォーム（テキスト入力含む）」→「案件詳細画面（ファイルアップロード＋分析実行）」の2画面に分割しました。同一画面に詰め込むより保守しやすいと判断したためです。
6. **意思決定メモの編集**: セクションごとに構造化された編集フォーム（事実・選択肢・次のアクション等をそれぞれ追加/削除可能な専用UI）を実装しました。Markdown直接編集ではなく構造化編集を選んだのは、事実・推測・要確認の区別を編集後も維持するためです。
7. **管理者ロール**: `profiles.role`に`admin`を持つユーザーのみ`/admin`にアクセス可能。管理者への昇格UIは実装しておらず、デモシードアカウント（`DEMO_ADMIN_EMAIL`）またはデータストアの直接編集が必要です。
8. **AIコスト見積り**: Anthropicの公表単価（2026年7月時点、Claude Sonnet 5: 入力$3/出力$15 per 1Mトークン）を`src/lib/ai/anthropic-provider.ts`にハードコードしています。実際の請求額と乖離する可能性があるため、正確な金額は運営者側でAnthropicの請求情報を確認する必要があります。

## 未実装・既知の制約

- **Supabase Auth連携が未実装**（デモモードのみ動作、上記参照）
- **Supabase Storage連携が未実装**（ローカルファイルシステムで代替）
- **決済機能は未実装**（プラン制限ロジックと料金表示のみ）
- **PDF生成はサーバーレス環境未対応**（開発コンテナのプリインストール済みChromiumに依存）
- **管理者への昇格UIなし**（データストアを直接編集する必要あり）
- **多言語UI・スマートフォン専用アプリは対象外**（要件書の方針どおり）
- **AIコスト見積りは概算**（正確な請求額はAnthropicコンソールを参照）

## ロードマップ

- Supabase Auth / Storage連携の実装・検証
- サーバーレス対応PDF生成（`@sparticuz/chromium`等への切り替え）
- Stripe等による決済機能の追加
- 管理者昇格・招待フローのUI化
- テンプレート保存機能（Professionalプラン向け）
- AI出力の保存有無を利用者が選択できる設定
- 監査ログの強化
