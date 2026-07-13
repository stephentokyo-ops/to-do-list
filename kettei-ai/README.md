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
- [Stripe決済セットアップ（本番運用・任意）](#stripe決済セットアップ本番運用任意)
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
- **認証**: Supabase Auth（本番）/ 自前JWT Cookie（デモモード）
- **ファイルストレージ**: Supabase Storage（本番）/ ローカルファイルシステム（デモモード）
- **AI**: Anthropic API（`@anthropic-ai/sdk`）。未設定時はデモプロバイダー（固定サンプル出力）
- **決済**: Stripe（任意。未設定時は料金プラン画面は表示専用）
- **ファイル解析**: pdf-parse / mammoth / xlsx
- **出力生成**: Markdown（自前テンプレート）/ DOCX（`docx`）/ PDF（Playwright + Chromium、ローカルはシステムフォント、サーバーレス環境は`@sparticuz/chromium`+同梱の日本語フォントを使用）
- **テスト**: Vitest（単体テスト）/ Playwright（E2E）

## ディレクトリ構成

```
kettei-ai/
├── src/
│   ├── app/                  # App Router（画面・API Route Handler）
│   │   ├── api/               # 認証・案件・分析・出力・決済・管理者API
│   │   ├── dashboard/ projects/ history/ usage/ account/ admin/ ...
│   │   ├── login/ signup/ terms/ privacy/
│   │   └── page.tsx           # ランディングページ
│   ├── components/
│   │   ├── ui/                 # 手作りのUIプリミティブ（shadcn/ui相当）
│   │   ├── layout/             # ナビゲーション
│   │   ├── projects/           # 案件作成・アップロード・分析トリガー
│   │   ├── analysis/           # 意思決定メモ表示・編集
│   │   ├── billing/             # プランアップグレードボタン
│   │   └── account/
│   └── lib/
│       ├── ai/                 # AIプロバイダー抽象化・Zod Schema・プロンプト
│       ├── auth/                # 認証（デモJWT / Supabase Auth）
│       ├── db/                  # データストア抽象化（Demo/Supabase）
│       ├── files/                # アップロード検証・テキスト抽出・ストレージ
│       ├── export/               # Markdown/DOCX/PDF生成
│       ├── billing/               # Stripeクライアント
│       ├── config/                # 料金プラン・分析目的の定義
│       ├── data/                   # サンプル案件データ
│       └── validation/              # フォーム用Zod Schema
├── assets/fonts/                 # サーバーレスPDF生成用の同梱日本語フォント(IPAゴシック)
├── supabase/migrations/         # SQLマイグレーション（schema + RLS + Storageバケット）
├── e2e/                          # Playwright E2Eテスト
├── scripts/reset-demo-data.ts    # デモデータリセットスクリプト
└── .env.example
```

## 環境変数

`.env.example` を `.env.local` にコピーして使用してください。すべて未設定でもデモモードで動作します。

| 変数 | 説明 |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY` | 3つすべて設定するとSupabaseストア・Supabase Authを使用（詳細は下記） |
| `AI_PROVIDER` | `demo`（既定）または `anthropic` |
| `ANTHROPIC_API_KEY` / `ANTHROPIC_MODEL` | `AI_PROVIDER=anthropic` の場合に使用。モデル既定値は `claude-sonnet-5` |
| `AUTH_SECRET` | デモモードのセッションCookie署名鍵。本番では必ず変更 |
| `DEMO_ADMIN_EMAIL` / `DEMO_ADMIN_PASSWORD` / `DEMO_USER_EMAIL` / `DEMO_USER_PASSWORD` | デモシードアカウント |
| `MAX_UPLOAD_SIZE_MB` | アップロード1ファイルあたりの上限（既定20MB） |
| `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` | Stripe決済（任意。未設定時はプラン画面が表示専用になる） |
| `PLAYWRIGHT_CHROMIUM_PATH` | ローカル開発用Chromiumの実行ファイルパス（任意。未設定時はサーバーレス対応バイナリに自動フォールバック） |

## デモモードと本番モード

「本番APIキーがなくてもデモモードで全画面を確認可能にする」という要件を満たすため、以下の箇所を環境変数の有無で自動切り替えする抽象化を行っています。

1. **データストア・認証・ファイルストレージ** (`src/lib/db`, `src/lib/auth`, `src/lib/files/storage.ts`): `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY` の3つが揃っていなければ、ローカルJSONファイルストア・自前JWT認証・ローカルファイルシステムを使用します。
2. **AIプロバイダー** (`src/lib/ai`): `AI_PROVIDER=anthropic` かつ `ANTHROPIC_API_KEY` が設定されていなければ、固定サンプルを返す `DemoAIProvider` を使用します。
3. **決済** (`src/lib/billing`): `STRIPE_SECRET_KEY` が未設定の場合、料金プラン画面の「アップグレード」ボタンは表示されません（プラン変更は管理者がデータストアを直接編集）。

## Supabaseセットアップ（本番運用）

> **重要**: この開発環境には実際のSupabaseプロジェクトへの接続がなく、`SupabaseStore`実装（`src/lib/db/supabase-store.ts`）・Supabase Auth連携（`src/lib/auth/index.ts`, `src/lib/auth/supabase-server.ts`）・Supabase Storage連携（`src/lib/files/storage.ts`）・マイグレーションSQLは、Supabase公式ドキュメントの記法に沿って実装したのみで、実機での動作検証は行っていません。本番投入前に必ずステージング環境で一連の流れ（新規登録→ログイン→ファイルアップロード→退会）を検証してください。

1. [Supabase](https://supabase.com)で新規プロジェクトを作成
2. `supabase/migrations/0001_init.sql`、続けて`0002_storage_buckets.sql`をSupabase SQL Editorで実行（テーブル・インデックス・RLSポリシー・Storageバケットを作成）
3. プロジェクト設定から `Project URL`・`anon` `public` キー・`service_role` キーを取得し、それぞれ `.env.local` の `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY` に設定
4. Supabase Auth → Providers でメール/パスワード認証を有効化（「Confirm email」を有効にしている場合、新規登録後はメール内リンクでの確認が必要になります）
5. これらを設定して再起動すると、自動的にデモモードからSupabaseモードへ切り替わります

## Anthropic APIセットアップ（本番運用）

1. [Anthropic Console](https://console.anthropic.com)でAPIキーを発行
2. `.env.local` に以下を設定:
   ```
   AI_PROVIDER=anthropic
   ANTHROPIC_API_KEY=sk-ant-...
   ANTHROPIC_MODEL=claude-sonnet-5
   ```
3. Route Handler (`/api/projects/[id]/analyze`) が `AIProvider` 抽象化経由でAnthropic APIを呼び出します。構造化出力はTool Use（`tool_choice`固定）で強制し、Zodスキーマ検証に失敗した場合は最大2回まで自動リトライします。

## Stripe決済セットアップ（本番運用・任意）

> **重要**: 実際のStripeアカウントへの接続・決済動作の確認は行っていません。本番投入前に必ずStripeのテストモードで一連の流れ（チェックアウト→Webhook受信→プラン反映→解約）を検証してください。

1. [Stripe Dashboard](https://dashboard.stripe.com)でアカウントを作成し、シークレットキー（テストモードは`sk_test_...`）を取得
2. `.env.local` に `STRIPE_SECRET_KEY` を設定
3. Webhookエンドポイントを登録: Stripe Dashboard → Developers → Webhooks で `https://<デプロイ先ドメイン>/api/billing/webhook` を登録し、`checkout.session.completed` / `customer.subscription.updated` / `customer.subscription.deleted` を購読。発行された署名シークレットを `STRIPE_WEBHOOK_SECRET` に設定
   - ローカル開発では [Stripe CLI](https://docs.stripe.com/stripe-cli) の `stripe listen --forward-to localhost:3000/api/billing/webhook` が使えます
4. 料金（`src/lib/config/plans.ts`の`monthlyPriceJpy`）はチェックアウト時に動的に生成するため、Stripeダッシュボードで事前に商品・価格を作る必要はありません
5. 設定後、`/usage` 画面にStandard/Professionalへの「アップグレード」ボタンが表示されます

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
4. **PDF出力について**: `PLAYWRIGHT_CHROMIUM_PATH`が指すローカル用Chromiumが見つからない場合、自動的に`@sparticuz/chromium`（サーバーレス対応バイナリ）＋同梱の日本語フォント（`assets/fonts/ipag.ttf`）にフォールバックします。Vercel等のサーバーレス環境ではこの経路が使われます（`src/lib/export/pdf.ts`参照）。この経路はサンドボックス内で実際にサーバーレスバイナリを起動し日本語が正しく描画されることを確認済みですが、Vercel実機での確認は行っていません。
5. デプロイ後、Supabase・Anthropic API・Stripe連携を上記手順で有効化してください。

## 運用手順

- **利用状況の確認**: `/admin`（管理者ロールのユーザーのみ）でユーザー別の分析回数・推定コストを確認できます。
- **料金プランの変更**: `src/lib/config/plans.ts` を編集するだけでFree/Standard/Professionalの上限・価格を変更できます（Stripeチェックアウトの金額もここから自動的に反映されます）。
- **分析目的（評価軸）の追加**: `src/lib/config/analysis-types.ts` に項目を追加します。
- **プロンプトの変更**: `src/lib/ai/prompt.ts` を編集します。`PROMPT_VERSION` を更新すると、以後の分析結果に新バージョンが記録されます。
- **デモデータのリセット**: `npm run seed:demo`（`.data/`ディレクトリを削除し、次回アクセス時に再シードされます）。

## Assumptions（仮定事項）

要件書に対し、以下の合理的な仮定を置いて実装しました。

1. **認証・ストレージ・決済の実機未検証**: Supabase Auth/Storage、Stripeはいずれも実際の外部アカウントに接続できない開発環境で実装したため、公式ドキュメントのAPI仕様に基づいて記述したコードであり、実機動作検証は行っていません。本番投入前にステージング環境での検証が必須です。
2. **PDF生成方式**: `pdfkit`等の直接描画ではなく、Playwright(Chromium)でHTMLをレンダリングしてPDF化する方式を採用しました。ローカルはシステムの日本語フォント、サーバーレス環境は同梱のIPAゴシックフォント（IPAフォントライセンスv1.0、再配布可）を使用します。
3. **Stripeの価格管理**: Stripeダッシュボードで事前に商品・価格（Price）を作成する運用ではなく、チェックアウトのたびに`plans.ts`の設定値から動的に価格を生成する方式にしました。価格変更時にStripe側の設定変更が不要になる一方、Stripeダッシュボードの「商品」一覧には表示されません。
4. **案件作成〜ファイルアップロードの画面分割**: 要件書のユーザーフロー（案件名→分析目的→入力→前提/期限→分析実行）を、実装上「案件作成フォーム（テキスト入力含む）」→「案件詳細画面（ファイルアップロード＋分析実行）」の2画面に分割しました。同一画面に詰め込むより保守しやすいと判断したためです。
5. **意思決定メモの編集**: セクションごとに構造化された編集フォーム（事実・選択肢・次のアクション等をそれぞれ追加/削除可能な専用UI）を実装しました。Markdown直接編集ではなく構造化編集を選んだのは、事実・推測・要確認の区別を編集後も維持するためです。
6. **管理者ロール**: `profiles.role`に`admin`を持つユーザーのみ`/admin`にアクセス可能。管理者への昇格UIは実装しておらず、デモシードアカウント（`DEMO_ADMIN_EMAIL`）またはデータストアの直接編集が必要です。
7. **AIコスト見積り**: Anthropicの公表単価（2026年7月時点、Claude Sonnet 5: 入力$3/出力$15 per 1Mトークン）を`src/lib/ai/anthropic-provider.ts`にハードコードしています。実際の請求額と乖離する可能性があるため、正確な金額は運営者側でAnthropicの請求情報を確認する必要があります。

## 未実装・既知の制約

- **Supabase Auth/Storage・Stripeは実機未検証**（コードは実装済み、上記参照）
- **サブスクリプションのプラン変更（アップグレード/ダウングレード）や日割り計算UIはなし**（都度Stripe Checkoutで新規契約する簡易フロー）
- **管理者への昇格UIなし**（データストアを直接編集する必要あり）
- **多言語UI・スマートフォン専用アプリは対象外**（要件書の方針どおり）
- **AIコスト見積りは概算**（正確な請求額はAnthropicコンソールを参照）
- **レート制限・ブルートフォース対策は未実装**（SECURITY.md参照）

## ロードマップ

- Supabase Auth / Storage / Stripeの実機検証（ステージング環境）
- サブスクリプションのプラン変更・請求ポータル（Stripe Customer Portal）連携
- 管理者昇格・招待フローのUI化
- テンプレート保存機能（Professionalプラン向け）
- AI出力の保存有無を利用者が選択できる設定
- 監査ログの強化
