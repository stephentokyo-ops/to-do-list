export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 prose-slate">
      <h1 className="text-2xl font-bold text-slate-900">利用規約（雛形）</h1>
      <p className="mt-2 text-sm text-slate-500">
        本ページはMVP開発時点の雛形であり、法的助言ではありません。正式なサービス提供前に弁護士等の専門家によるレビューを受けてください。
      </p>

      <div className="mt-8 space-y-6 text-sm leading-7 text-slate-700">
        <section>
          <h2 className="text-lg font-semibold text-slate-900">第1条（適用）</h2>
          <p>本規約は、KETTEI AI（以下「本サービス」）の利用条件を定めるものです。利用者は本規約に同意の上、本サービスを利用するものとします。</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-slate-900">第2条（AI出力の性質）</h2>
          <p>
            本サービスが生成する意思決定メモは、AIによる分析結果であり、法務・税務・労務その他の専門的な助言を代替するものではありません。利用者は、重要な意思決定を行う前に、必要に応じて弁護士・税理士・社会保険労務士等の専門家に確認するものとします。
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-slate-900">第3条（禁止事項）</h2>
          <p>利用者は、法令または公序良俗に違反する情報、第三者の権利を侵害する情報を本サービスにアップロードしてはならないものとします。</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-slate-900">第4条（秘密情報の取扱い）</h2>
          <p>
            本サービスは秘密情報を含む資料を取り扱うことを前提としています。運営者は合理的な範囲でセキュリティ対策を講じますが、利用者は自己の責任においてアップロードする情報を選定するものとします。
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-slate-900">第5条（免責事項）</h2>
          <p>運営者は、本サービスの利用により生じた損害について、法令上許容される範囲で責任を負わないものとします。</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-slate-900">第6条（規約の変更）</h2>
          <p>運営者は、必要と判断した場合、利用者への通知の上、本規約を変更できるものとします。</p>
        </section>
      </div>
    </div>
  );
}
