import type { Technique } from "../types/session";

export const techniques: Technique[] = [
  {
    id: "sixSecondRule",
    title: "6秒ルール",
    description:
      "怒りの感情のピークは長くても6秒ほどで過ぎるといわれています。反射的に言葉を返す前に、心の中でゆっくり6つ数えて呼吸を整えましょう。",
    example: "（一呼吸置いてから）……なるほど、少し考えさせてください。",
  },
  {
    id: "iMessage",
    title: "Iメッセージ",
    description:
      "「あなたは〜」と相手を主語にすると非難に聞こえやすくなります。「私は〜と感じた」のように自分を主語にすると、対立せずに気持ちを伝えられます。",
    example: "私はそう言われて少し戸惑いました。",
  },
  {
    id: "desc",
    title: "DESC法",
    description:
      "Describe（事実を描写する）→ Express（気持ちを伝える）→ Specify（要望を具体的に伝える）→ Consequences（結果を伝える）の順で話すと、感情的にならずに主張できます。",
    example:
      "先ほどの件ですが（事実）、少し驚きました（気持ち）。次からは事前に共有してもらえますか（要望）。そうすれば私も準備できます（結果）。",
  },
  {
    id: "factVsInterpretation",
    title: "事実と解釈を分ける",
    description:
      "相手の発言のうち「起きたこと（事実）」と「自分がそう受け取った意味（解釈）」を分けて考えると、感情的な決めつけに巻き込まれにくくなります。",
    example: "（事実）〜と言われた。（解釈である可能性）本当に責めるつもりだったのだろうか？",
  },
  {
    id: "cushionWords",
    title: "クッション言葉",
    description:
      "反論や依頼の前に柔らかい前置きを置くと、相手も身構えずに話を聞きやすくなります。",
    example: "恐れ入りますが／お手数ですが／もし可能であれば",
  },
  {
    id: "askQuestion",
    title: "質問で返す",
    description:
      "反論や言い訳の代わりに質問で返すと、相手の意図を確認しつつ、自分が冷静になる時間も作れます。",
    example: "具体的にはどの部分が気になりましたか？",
  },
  {
    id: "timeoutRequest",
    title: "タイムアウト宣言",
    description:
      "その場で答えを出さず、「少し考える時間をください」と伝えて一旦離れることも立派な対応です。無理にその場で切り返す必要はありません。",
    example: "重要な話なので、一度持ち帰って考えてからお返事してもいいですか。",
  },
];

export function getTechnique(id: string) {
  return techniques.find((t) => t.id === id);
}
