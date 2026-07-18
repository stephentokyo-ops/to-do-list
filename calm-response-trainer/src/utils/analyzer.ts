import type { AnalysisResult, Hit, Level } from "../types/session";

interface Pattern {
  pattern: RegExp;
  note: string;
}

const NEGATIVE_PATTERNS: Pattern[] = [
  { pattern: /お前|てめえ|テメー/, note: "相手を見下す呼び方は対立を強めます。" },
  { pattern: /バカ|馬鹿|アホ|クズ|カス/, note: "人格を否定する言葉は関係を悪化させます。" },
  { pattern: /うざい|きもい|消えろ|死ね/, note: "攻撃的・敵意のある言葉が含まれています。" },
  {
    pattern: /(お前|あなた)(が|の)(悪い|せい)/,
    note: "相手を一方的に責める言い回しになっています。",
  },
  {
    pattern: /(いつも|絶対|どうせ|所詮)/,
    note: "「いつも」「絶対」などの決めつけ表現は反発を招きやすいです。",
  },
  { pattern: /！{2,}|!{2,}/, note: "感嘆符の連続は感情の高ぶりを伝えてしまいます。" },
  { pattern: /（笑）|\(笑\)|www+|草$/, note: "皮肉や嘲笑と受け取られる可能性があります。" },
  { pattern: /は[?？]{1,}/, note: "「は？」は攻撃的に響きやすい相槌です。" },
];

const POSITIVE_PATTERNS: Pattern[] = [
  {
    pattern: /(私|自分)(は|として)[^。]{0,15}(思|感じ)/,
    note: "自分を主語にした「Iメッセージ」が使えています。",
  },
  {
    pattern: /(確認|教えて)(させて|いただ|ください|もらえ)/,
    note: "事実確認・質問で返せており、冷静さを保てています。",
  },
  {
    pattern: /(気持ちは分かります|そう感じたんですね|大変でしたね|申し訳ない)/,
    note: "相手の気持ちを受け止める言葉が含まれています。",
  },
  {
    pattern: /(するのはいかがでしょう|してみません|一緒に|次から)/,
    note: "対立ではなく提案・改善につなげられています。",
  },
  {
    pattern: /(申し訳ございません|恐れ入りますが|お手数ですが|失礼ですが)/,
    note: "クッション言葉で柔らかく伝えられています。",
  },
  {
    pattern: /(少し(考える|時間)|一旦|落ち着いて|持ち帰っ)/,
    note: "即答せず間を置く姿勢が見られます。",
  },
  { pattern: /[？?]\s*$/, note: "質問で締めくくり、対話につなげられています。" },
];

const BASE_SCORE = 60;
const NEGATIVE_PENALTY = 14;
const POSITIVE_BONUS = 9;

function classify(score: number): Level {
  if (score >= 75) return "calm";
  if (score >= 45) return "okay";
  return "reactive";
}

export function analyzeResponse(rawText: string): AnalysisResult {
  const text = rawText.trim();

  const negativeHits: Hit[] = NEGATIVE_PATTERNS.filter(({ pattern }) =>
    pattern.test(text)
  ).map(({ pattern, note }) => ({ phrase: pattern.source, note }));

  const positiveHits: Hit[] = POSITIVE_PATTERNS.filter(({ pattern }) =>
    pattern.test(text)
  ).map(({ pattern, note }) => ({ phrase: pattern.source, note }));

  let score =
    BASE_SCORE -
    negativeHits.length * NEGATIVE_PENALTY +
    positiveHits.length * POSITIVE_BONUS;
  score = Math.max(0, Math.min(100, score));

  const advice: string[] = [];

  if (text.length === 0) {
    advice.push("まずは返答を入力してみましょう。");
  } else if (text.length < 8) {
    advice.push(
      "反応がとても短いです。即答せず、一呼吸置いてから言葉を選んでみましょう。"
    );
  }

  if (negativeHits.length > 0) {
    advice.push(
      "攻撃的・決めつけの表現が含まれています。事実だけを伝える言い方に置き換えられないか見直してみましょう。"
    );
  }

  if (positiveHits.length === 0 && text.length >= 8) {
    advice.push(
      "Iメッセージや質問形式など、対話を続けやすい言い回しを一つ加えてみましょう。"
    );
  }

  if (negativeHits.length === 0 && positiveHits.length > 0) {
    advice.push("落ち着いた対応ができています。この調子です。");
  }

  return { score, level: classify(score), negativeHits, positiveHits, advice };
}
