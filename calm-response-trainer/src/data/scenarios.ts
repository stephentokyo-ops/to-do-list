import type { Scenario } from "../types/session";

export const scenarios: Scenario[] = [
  {
    id: "work-1",
    category: "workplace",
    difficulty: 2,
    context: "上司からの指摘",
    line: "これ、前にも言いましたよね？何回言えばわかるんですか？",
    hint: "desc",
    sampleResponse:
      "ご指摘ありがとうございます。前回の説明のどの部分を見落としていたか確認したいので、もう一度ポイントを教えていただけますか。次から同じミスをしないよう記録します。",
  },
  {
    id: "work-2",
    category: "workplace",
    difficulty: 2,
    context: "同僚からの嫌味",
    line: "そんなことも知らないんですか。大学出てますよね？",
    hint: "askQuestion",
    sampleResponse:
      "そこは知らなかったので教えてもらえると助かります。具体的にどの資料を見ればいいですか。",
  },
  {
    id: "work-3",
    category: "workplace",
    difficulty: 3,
    context: "チーム会議での名指し",
    line: "あなたが遅いから、みんな迷惑してるんですよ。",
    hint: "iMessage",
    sampleResponse:
      "ご迷惑をおかけしていたのは知りませんでした。私としては丁寧さを優先していましたが、スピードとのバランスを見直します。具体的にどの工程が遅く感じましたか。",
  },
  {
    id: "work-4",
    category: "workplace",
    difficulty: 2,
    context: "上司からの叱責",
    line: "なんでいつも言い訳ばっかりなんですか？",
    hint: "factVsInterpretation",
    sampleResponse:
      "言い訳に聞こえてしまったなら申し訳ありません。状況を正確にお伝えしたかっただけなので、結論だけ先にお伝えします。",
  },
  {
    id: "work-5",
    category: "workplace",
    difficulty: 3,
    context: "評価面談での比較",
    line: "他の人はできてるのに、あなただけできてないですよね。",
    hint: "cushionWords",
    sampleResponse:
      "恐れ入りますが、他の方がどのように進めているか参考にしたいので、具体例を教えていただけますか。",
  },
  {
    id: "family-1",
    category: "family",
    difficulty: 2,
    context: "パートナーとの口論",
    line: "あなたはいつも自分のことしか考えてないよね。",
    hint: "iMessage",
    sampleResponse:
      "そう感じさせてしまったなら申し訳ない。私としては家族のことも考えているつもりだけど、どの場面でそう感じた？",
  },
  {
    id: "family-2",
    category: "family",
    difficulty: 1,
    context: "家族からの繰り返しの指摘",
    line: "またそれ？何回同じこと言わせるの。",
    hint: "sixSecondRule",
    sampleResponse:
      "（一呼吸置いて）ごめん、伝わっていなかったんだね。今度は忘れないようにメモしておく。",
  },
  {
    id: "family-3",
    category: "family",
    difficulty: 3,
    context: "家事分担をめぐる衝突",
    line: "お前が家事をちゃんとしないから、こうなるんだろ。",
    hint: "desc",
    sampleResponse:
      "最近手が回っていなかったのは事実だね（事実）。責められると辛い（気持ち）。分担を一度話し合いたい（要望）。そうすればお互い無理なく回せると思う（結果）。",
  },
  {
    id: "family-4",
    category: "family",
    difficulty: 2,
    context: "信頼関係を疑う発言",
    line: "そんなんだから信用されないんだよ。",
    hint: "timeoutRequest",
    sampleResponse:
      "その言い方は少し傷つくな。今は感情的になりそうだから、落ち着いてからもう一度話さない？",
  },
  {
    id: "friends-1",
    category: "friends",
    difficulty: 1,
    context: "友人からの軽い皮肉",
    line: "そんなことも気づかないなんて、鈍いんじゃない？",
    hint: "askQuestion",
    sampleResponse:
      "気づかなかったのは事実だね。どのあたりで気づけばよかったか教えてもらえる？",
  },
  {
    id: "friends-2",
    category: "friends",
    difficulty: 2,
    context: "遅刻をめぐる非難",
    line: "お前がいつも遅刻するから、みんな迷惑してるんだけど。",
    hint: "desc",
    sampleResponse:
      "遅刻してしまったのは私の責任だね（事実）。迷惑をかけて申し訳ない（気持ち）。次からは余裕を持って出るようにする（要望・結果）。",
  },
  {
    id: "friends-3",
    category: "friends",
    difficulty: 2,
    context: "性格を決めつけられる",
    line: "本当に自分勝手だよね、いつも。",
    hint: "factVsInterpretation",
    sampleResponse:
      "「いつも」と言われると少し驚くな。具体的にどの出来事のことを言ってる？",
  },
  {
    id: "online-1",
    category: "online",
    difficulty: 3,
    context: "SNSでの誹謗中傷",
    line: "こんな考え方してる時点で終わってる。消えたほうがいいよ。",
    hint: "timeoutRequest",
    sampleResponse:
      "きつい言葉なので、ここでは反応せずに一旦離れます。意見の違いはあってもいいと思っています。",
  },
  {
    id: "online-2",
    category: "online",
    difficulty: 2,
    context: "コメント欄での見下し",
    line: "これだから素人は。的外れなこと言うのやめてもらえます？",
    hint: "askQuestion",
    sampleResponse:
      "的外れだった点があれば教えてください。どこが違うと感じましたか。",
  },
  {
    id: "online-3",
    category: "online",
    difficulty: 2,
    context: "煽りコメント",
    line: "都合が悪くなると逃げるの草",
    hint: "sixSecondRule",
    sampleResponse:
      "（一呼吸置いて）逃げたわけではなく、考える時間が欲しかっただけです。",
  },
  {
    id: "stranger-1",
    category: "stranger",
    difficulty: 2,
    context: "問い合わせ対応でのクレーム",
    line: "は？ちゃんと説明できないんですか？時間の無駄なんですけど。",
    hint: "cushionWords",
    sampleResponse:
      "分かりにくい説明で申し訳ございません。改めて要点を整理してお伝えしますね。",
  },
  {
    id: "stranger-2",
    category: "stranger",
    difficulty: 3,
    context: "店頭での強い要求",
    line: "こんな対応されるとは思わなかった。責任者出してください。",
    hint: "desc",
    sampleResponse:
      "ご不快な思いをさせてしまいましたこと、お詫び申し上げます（事実・気持ち）。詳しい状況を確認しますので、少々お待ちいただけますか（要望）。",
  },
  {
    id: "stranger-3",
    category: "stranger",
    difficulty: 2,
    context: "電話口での威圧的な発言",
    line: "金返してくれるならそれでいいので、早くしてもらえます？",
    hint: "cushionWords",
    sampleResponse:
      "お待たせして申し訳ございません。確認の上、対応可能な範囲を早急にご案内いたします。",
  },
];
