import type { LessonData } from './types';

export const LESSONS: LessonData[] = [
  // ─────────────────────────────────────────────────────
  // Lesson 1: 囲碁って何？
  // ─────────────────────────────────────────────────────
  {
    id: 'intro',
    title: '囲碁って何？',
    emoji: '🌏',
    tagline: '4000年の歴史を持つ最古のボードゲームを知ろう',
    steps: [
      {
        id: 'intro-1',
        title: '囲碁へようこそ！',
        description: `囲碁は、黒と白の石を使って**陣地（空点）** を奪い合うボードゲームです。

約4000年前に中国で生まれ、日本・韓国・中国で数千万人に楽しまれています。シンプルなルールの中に、無限の奥深さが詰まっています。

🎯 **ゲームの目的**
ゲーム終了時に、自分の石で囲んだ**空点（陣地）** が多い方が勝ちです。

まずは9路盤（9×9）という小さな盤で学んでいきましょう！`,
        boardSetup: [],
        locked: true,
        taskType: 'none',
        successMessage: '',
      },
      {
        id: 'intro-2',
        title: '盤面を見てみよう',
        description: `これが**9路盤**です。縦横9本ずつの線が交差する**交叉点（こうさてん）** に石を置きます。

🔵 **黒い点（星/ほし）** は目印です。5か所あります。

📐 交叉点は全部で **81か所** あります。

⚠️ チェスや将棋とは違い、マスの中ではなく**線の交わる点**に石を置きます！

ハイライトされている点が「星（ほし）」です。`,
        boardSetup: [],
        locked: true,
        taskType: 'none',
        highlights: [
          { row: 2, col: 2 },
          { row: 2, col: 6 },
          { row: 4, col: 4 },
          { row: 6, col: 2 },
          { row: 6, col: 6 },
        ],
        successMessage: '',
      },
      {
        id: 'intro-3',
        title: '最初の一手を打とう！',
        description: `それでは実際に石を置いてみましょう！

囲碁では**黒が先手**です。まず黒から始まります。

盤上の**どこでも**クリックして、最初の一手を打ってみてください。

🖱️ 石を置きたい交叉点をクリックしましょう！`,
        boardSetup: [],
        locked: false,
        taskType: 'any',
        successMessage: '石を置けました！これが囲碁の一手です。このように交互に石を置いていきます。',
      },
    ],
  },

  // ─────────────────────────────────────────────────────
  // Lesson 2: 呼吸点（ダメ）を知ろう
  // ─────────────────────────────────────────────────────
  {
    id: 'liberties',
    title: '呼吸点（ダメ）を学ぼう',
    emoji: '💨',
    tagline: '石が「生きる」ために必要なものとは？',
    steps: [
      {
        id: 'lib-1',
        title: 'ダメ（呼吸点）とは？',
        description: `石が「生きる」ために必要な空点を**ダメ（呼吸点）** と言います。

石のダメは、その石に隣接する**上下左右の空点**のことです。

ハイライトされている点が、中央の黒石のダメ（4か所）です。

盤の中央にある石は**4つのダメ**を持っています。`,
        boardSetup: [{ row: 4, col: 4, color: 'black' }],
        locked: true,
        taskType: 'none',
        highlights: [
          { row: 3, col: 4 },
          { row: 5, col: 4 },
          { row: 4, col: 3 },
          { row: 4, col: 5 },
        ],
        successMessage: '',
      },
      {
        id: 'lib-2',
        title: '隅と辺のダメの数',
        description: `石の位置によってダメの数は変わります。

📍 **中央の石**：4つのダメ
📍 **辺の石**：3つのダメ
📍 **隅の石**：2つのダメ

盤の外は存在しないので、隅や辺ではダメが少なくなります。

ハイライトが左上の黒石（隅）のダメ（2か所）です。隅の石は守りやすい！`,
        boardSetup: [{ row: 0, col: 0, color: 'black' }],
        locked: true,
        taskType: 'none',
        highlights: [
          { row: 1, col: 0 },
          { row: 0, col: 1 },
        ],
        successMessage: '',
      },
      {
        id: 'lib-3',
        title: 'アタリ！ダメが1つに',
        description: `白石が黒石の周りを囲んでいます。黒石のダメが**1つだけ**残っています。

この状態を**「アタリ」** と言います。

次に白が残ったダメに打てば、黒石は取られてしまいます！

⚠️ アタリがかかったら、逃げるか別の場所で反撃しましょう。

ハイライトが最後のダメ（黒石が取られてしまう場所）です。`,
        boardSetup: [
          { row: 4, col: 4, color: 'black' },
          { row: 3, col: 4, color: 'white' },
          { row: 4, col: 3, color: 'white' },
          { row: 4, col: 5, color: 'white' },
        ],
        locked: true,
        taskType: 'none',
        highlights: [{ row: 5, col: 4 }],
        successMessage: '',
      },
    ],
  },

  // ─────────────────────────────────────────────────────
  // Lesson 3: 石を取ってみよう
  // ─────────────────────────────────────────────────────
  {
    id: 'capture',
    title: '石を取ってみよう',
    emoji: '⚔️',
    tagline: '相手の石を全部囲んで取り除こう！',
    steps: [
      {
        id: 'cap-1',
        title: '石の取り方',
        description: `石を取るには、相手の石（またはグループ）の**全てのダメを塞ぐ**ことが必要です。

取られた石は盤から除かれ、ゲーム終了時にスコアとして加算されます。

白石のダメが1つ（ハイライト）だけ残っています。
そこに黒石を打って、白石を**取ってみましょう！**

👉 ハイライトされた場所に打ってください！`,
        boardSetup: [
          { row: 4, col: 4, color: 'white' },
          { row: 3, col: 4, color: 'black' },
          { row: 4, col: 3, color: 'black' },
          { row: 4, col: 5, color: 'black' },
        ],
        locked: false,
        taskType: 'capture',
        highlights: [{ row: 5, col: 4 }],
        successMessage: '取れました！白石のダメを全て塞いで取り除きました。これが「石を取る」ということです！',
        currentPlayerOverride: 'black',
      },
      {
        id: 'cap-2',
        title: '複数の石を取ろう',
        description: `今度は複数の白石をまとめて取ってみましょう！

つながった石（連/れん）は**一つのグループ**として扱われます。グループ全体のダメが0になると、まとめて取られます。

白石3つのグループのダメが1つ残っています（ハイライト）。
そこに黒を打ってまとめて取りましょう！`,
        boardSetup: [
          { row: 4, col: 3, color: 'white' },
          { row: 4, col: 4, color: 'white' },
          { row: 4, col: 5, color: 'white' },
          { row: 3, col: 3, color: 'black' },
          { row: 3, col: 4, color: 'black' },
          { row: 3, col: 5, color: 'black' },
          { row: 5, col: 3, color: 'black' },
          { row: 5, col: 4, color: 'black' },
          { row: 5, col: 5, color: 'black' },
          { row: 4, col: 2, color: 'black' },
        ],
        locked: false,
        taskType: 'capture',
        highlights: [{ row: 4, col: 6 }],
        successMessage: '3個の白石をまとめて取りました！大きな捕獲ですね。連（グループ）全体のダメを塞ぐことがポイントです。',
        currentPlayerOverride: 'black',
      },
    ],
  },

  // ─────────────────────────────────────────────────────
  // Lesson 4: 陣地を作ろう
  // ─────────────────────────────────────────────────────
  {
    id: 'territory',
    title: '陣地（陣地）を作ろう',
    emoji: '🏯',
    tagline: '空点を囲んで自分の陣地にしよう',
    steps: [
      {
        id: 'ter-1',
        title: '陣地とは？',
        description: `囲碁の得点は**陣地（空点）** の数で決まります。

ゲーム終了時に、自分の石で囲まれた空点が自分の「陣地」になります。

黒石と白石が互いに陣地を作っています。
💚 黒の陣地：左側の空点
🔴 白の陣地：右側の空点

陣地の多い方が勝ちです！`,
        boardSetup: [
          { row: 0, col: 3, color: 'black' },
          { row: 1, col: 3, color: 'black' },
          { row: 2, col: 3, color: 'black' },
          { row: 3, col: 3, color: 'black' },
          { row: 4, col: 3, color: 'black' },
          { row: 5, col: 3, color: 'black' },
          { row: 6, col: 3, color: 'black' },
          { row: 7, col: 3, color: 'black' },
          { row: 8, col: 3, color: 'black' },
          { row: 0, col: 5, color: 'white' },
          { row: 1, col: 5, color: 'white' },
          { row: 2, col: 5, color: 'white' },
          { row: 3, col: 5, color: 'white' },
          { row: 4, col: 5, color: 'white' },
          { row: 5, col: 5, color: 'white' },
          { row: 6, col: 5, color: 'white' },
          { row: 7, col: 5, color: 'white' },
          { row: 8, col: 5, color: 'white' },
        ],
        locked: true,
        taskType: 'none',
        highlights: [
          { row: 0, col: 0 }, { row: 0, col: 1 }, { row: 0, col: 2 },
          { row: 1, col: 0 }, { row: 1, col: 1 }, { row: 1, col: 2 },
          { row: 2, col: 0 }, { row: 2, col: 1 }, { row: 2, col: 2 },
        ],
        successMessage: '',
      },
      {
        id: 'ter-2',
        title: '隅の陣地を完成させよう',
        description: `囲碁では**隅（すみ）** から陣地を作るのが基本です。

理由：隅は三方が盤の外なので、少ない石で広い陣地を囲めます！

左上の隅に黒石が2つあります。
ハイライトされた場所に打って、隅の陣地を**広げてみましょう！**

好きなハイライト位置に打ってください。`,
        boardSetup: [
          { row: 2, col: 2, color: 'black' },
          { row: 0, col: 2, color: 'black' },
          { row: 2, col: 0, color: 'black' },
          { row: 4, col: 2, color: 'white' },
          { row: 2, col: 4, color: 'white' },
        ],
        locked: false,
        taskType: 'target',
        targetPositions: [
          { row: 0, col: 0 }, { row: 0, col: 1 }, { row: 1, col: 0 },
          { row: 1, col: 1 }, { row: 1, col: 2 }, { row: 2, col: 1 },
        ],
        highlights: [
          { row: 0, col: 0 }, { row: 0, col: 1 }, { row: 1, col: 0 },
          { row: 1, col: 1 }, { row: 1, col: 2 }, { row: 2, col: 1 },
        ],
        successMessage: '隅に打ちました！隅から陣地を広げるのが囲碁の基本戦略です。次は辺、そして中央へと広げていきましょう。',
        currentPlayerOverride: 'black',
      },
    ],
  },

  // ─────────────────────────────────────────────────────
  // Lesson 5: コウの規則
  // ─────────────────────────────────────────────────────
  {
    id: 'ko',
    title: 'コウの規則',
    emoji: '🔄',
    tagline: '同じ局面が繰り返される「コウ」を理解しよう',
    steps: [
      {
        id: 'ko-1',
        title: 'コウって何？',
        description: `**コウ（劫）** とは、同じ局面が無限に繰り返される状態のことです。

例えば…
① 黒が白を1個取る
② 白が黒を1個取り返す
③ 黒が取り返す…（無限ループ！）

これを防ぐため、**コウの規則**があります：
> 取り返して同じ局面に戻す手は、すぐには打てない

次の手でコウ解消の「コウ立て」をしてから取り返せます。

以下の図がコウの局面です。`,
        boardSetup: [
          { row: 4, col: 3, color: 'black' },
          { row: 4, col: 5, color: 'black' },
          { row: 3, col: 4, color: 'black' },
          { row: 5, col: 4, color: 'black' },
          { row: 3, col: 3, color: 'white' },
          { row: 3, col: 5, color: 'white' },
          { row: 4, col: 4, color: 'white' },
          { row: 5, col: 3, color: 'white' },
          { row: 5, col: 5, color: 'white' },
        ],
        locked: true,
        taskType: 'none',
        highlights: [{ row: 4, col: 4 }],
        successMessage: '',
      },
      {
        id: 'ko-2',
        title: 'コウを体験しよう',
        description: `コウの状況を体験してみましょう。

現在、黒が (4,4) の白石を取れます。
でも白も (4,4) にすぐ打ち返すと**コウの規則で禁止**されます。

まず黒が白石を取ってみましょう。取れたら白の番になります。
ハイライトの場所をクリックしてください。`,
        boardSetup: [
          { row: 4, col: 3, color: 'black' },
          { row: 4, col: 5, color: 'black' },
          { row: 3, col: 4, color: 'black' },
          { row: 5, col: 4, color: 'black' },
          { row: 3, col: 3, color: 'white' },
          { row: 3, col: 5, color: 'white' },
          { row: 4, col: 4, color: 'white' },
          { row: 5, col: 3, color: 'white' },
          { row: 5, col: 5, color: 'white' },
        ],
        locked: false,
        taskType: 'capture',
        highlights: [{ row: 4, col: 4 }],
        successMessage: '白石を取りました！これがコウです。今度は白が取り返そうとしますが、同じ局面に戻すことはできません。コウは囲碁の重要な戦術要素です！',
        currentPlayerOverride: 'black',
      },
    ],
  },

  // ─────────────────────────────────────────────────────
  // Lesson 6: 基本の定石
  // ─────────────────────────────────────────────────────
  {
    id: 'joseki',
    title: '基本の定石（じょうせき）',
    emoji: '📚',
    tagline: 'プロが積み上げた最善の打ち方を学ぼう',
    steps: [
      {
        id: 'jos-1',
        title: '定石とは？',
        description: `**定石（じょうせき）** とは、長い歴史の中でプロ棋士が研究し、互いにとって最善とされる一連の打ち方のことです。

特に**隅（すみ）** での定石が重要です。

代表的な定石の始まり方：
- **星（ほし）** → 4-4の点（攻撃的）
- **小目（こもく）** → 3-4の点（バランス型）
- **三々（さんさん）** → 3-3の点（堅実）

ハイライトが「星」「小目」「三々」の点です。どれから始めるかで序盤の方針が変わります！`,
        boardSetup: [],
        locked: true,
        taskType: 'none',
        highlights: [
          { row: 2, col: 2 }, // 小目
          { row: 2, col: 3 }, // 小目
          { row: 2, col: 6 }, // 小目
          { row: 2, col: 5 }, // 小目
          { row: 6, col: 2 }, { row: 6, col: 6 }, // 星
          { row: 4, col: 4 }, // 天元
        ],
        successMessage: '',
      },
      {
        id: 'jos-2',
        title: '星打ちの序盤',
        description: `**星（4-4の点）** から始める打ち方を学びましょう。

黒の星打ち（左上の星）に対して、白が右下に打っています。

これが典型的な序盤です。
次は黒が**左下または右上の隅**に打つのが定石です。

ハイライトのどちらかに打ってみましょう！`,
        boardSetup: [
          { row: 2, col: 2, color: 'black' },
          { row: 6, col: 6, color: 'white' },
        ],
        locked: false,
        taskType: 'target',
        targetPositions: [
          { row: 6, col: 2 },
          { row: 2, col: 6 },
          { row: 2, col: 3 },
          { row: 3, col: 2 },
          { row: 6, col: 3 },
          { row: 3, col: 6 },
        ],
        highlights: [
          { row: 6, col: 2 },
          { row: 2, col: 6 },
        ],
        successMessage: '上手い！隅を先に確保するのが序盤の鉄則です。4つの隅を取り合いながら、互いに陣地の骨格を作っていきます。',
        currentPlayerOverride: 'black',
      },
      {
        id: 'jos-3',
        title: '序盤の流れを体験',
        description: `囲碁序盤の理想的な流れを見てみましょう。

黒が星（左上）、白が星（右下）、黒が星（右上）と打ちました。

次は白が**左下の隅**を確保するか、黒の陣地に**カカリ（接近）** するかですが、
今はまず黒が左下に打って4隅を確保してみましょう。

ハイライトの場所をクリックしてください！`,
        boardSetup: [
          { row: 2, col: 2, color: 'black' },
          { row: 6, col: 6, color: 'white' },
          { row: 2, col: 6, color: 'black' },
        ],
        locked: false,
        taskType: 'target',
        targetPositions: [
          { row: 6, col: 2 },
          { row: 6, col: 3 },
          { row: 7, col: 2 },
        ],
        highlights: [{ row: 6, col: 2 }],
        successMessage: '素晴らしい！4隅を取り合う序盤の展開を理解できましたね。これが囲碁の序盤定石の基本です。次はAIと実際に対戦してみましょう！',
        currentPlayerOverride: 'black',
      },
    ],
  },
];
