export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-2xl font-bold text-slate-900">プライバシーポリシー（雛形）</h1>
      <p className="mt-2 text-sm text-slate-500">
        本ページはMVP開発時点の雛形であり、法的助言ではありません。正式なサービス提供前に弁護士等の専門家によるレビューを受けてください。
      </p>

      <div className="mt-8 space-y-6 text-sm leading-7 text-slate-700">
        <section>
          <h2 className="text-lg font-semibold text-slate-900">1. 取得する情報</h2>
          <p>
            氏名（表示名）、メールアドレス、アップロードされた資料およびそのテキスト、AIによる分析結果、利用状況（トークン数・利用日時等）を取得します。
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-slate-900">2. 利用目的</h2>
          <p>本サービスの提供、品質向上、利用状況に応じた課金・プラン管理のために利用します。</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-slate-900">3. AIプロバイダーへの送信</h2>
          <p>
            分析処理のため、入力されたテキスト（資料の抽出テキストを含む）はAnthropic社等のAIプロバイダーへ送信されます。送信内容の保存有無・保持期間はAIプロバイダーの規約に従います。
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-slate-900">4. 第三者提供</h2>
          <p>法令に基づく場合を除き、本人の同意なく第三者に個人情報を提供しません。</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-slate-900">5. データの削除</h2>
          <p>利用者はアカウント設定画面から退会し、関連データの削除を求めることができます。</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-slate-900">6. お問い合わせ</h2>
          <p>本ポリシーに関するお問い合わせは、運営者までご連絡ください。</p>
        </section>
      </div>
    </div>
  );
}
