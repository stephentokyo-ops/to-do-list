import {
  Document,
  Packer,
  Paragraph,
  HeadingLevel,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
} from "docx";
import type { DecisionMemo } from "@/lib/ai/schema";

const FONT = "Yu Gothic";

function heading(text: string, level: (typeof HeadingLevel)[keyof typeof HeadingLevel]) {
  return new Paragraph({ text, heading: level });
}

function body(text: string) {
  return new Paragraph({ children: [new TextRun({ text, font: FONT })] });
}

function bulletList(items: string[]) {
  return items.map(
    (text) =>
      new Paragraph({ bullet: { level: 0 }, children: [new TextRun({ text, font: FONT })] }),
  );
}

function makeTable(header: string[], rows: string[][]) {
  const headerRow = new TableRow({
    children: header.map(
      (h) =>
        new TableCell({
          width: { size: 100 / header.length, type: WidthType.PERCENTAGE },
          children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, font: FONT })] })],
        }),
    ),
  });
  const bodyRows = rows.map(
    (row) =>
      new TableRow({
        children: row.map(
          (cell) =>
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: cell, font: FONT })] })],
            }),
        ),
      }),
  );
  return new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: [headerRow, ...bodyRows] });
}

export async function memoToDocxBuffer(memo: DecisionMemo): Promise<Buffer> {
  const children: (Paragraph | Table)[] = [];

  children.push(heading(memo.projectTitle, HeadingLevel.TITLE));

  children.push(heading("1. 結論", HeadingLevel.HEADING_1));
  children.push(body(memo.conclusion));

  children.push(heading("2. 判断の確信度", HeadingLevel.HEADING_1));
  children.push(body(`${memo.confidence.level} — ${memo.confidence.reason}`));

  children.push(heading("3. 事実", HeadingLevel.HEADING_1));
  children.push(...bulletList(memo.facts.map((f) => `${f.text}${f.source ? `（出典: ${f.source}）` : ""}`)));

  children.push(heading("4. 推測・仮定", HeadingLevel.HEADING_1));
  children.push(
    ...(memo.assumptions.length > 0 ? bulletList(memo.assumptions.map((a) => a.text)) : [body("特になし")]),
  );

  children.push(heading("5. 主要論点", HeadingLevel.HEADING_1));
  children.push(...bulletList(memo.keyIssues.map((k) => k.text)));

  children.push(heading("6. 選択肢比較", HeadingLevel.HEADING_1));
  children.push(
    makeTable(
      ["選択肢", "メリット", "デメリット", "費用", "スピード", "実行難易度", "主要リスク", "総合評価"],
      memo.optionsComparison.map((o) => [
        o.name,
        o.pros,
        o.cons,
        o.cost,
        o.speed,
        o.difficulty,
        o.mainRisk,
        o.overallScore,
      ]),
    ),
  );

  children.push(heading("7. 推奨案", HeadingLevel.HEADING_1));
  children.push(body(`推奨: ${memo.recommendation.chosenOption}`));
  children.push(body(memo.recommendation.reason));
  children.push(body(`反対意見・不採用理由: ${memo.recommendation.objections}`));

  children.push(heading("8. 未確認事項", HeadingLevel.HEADING_1));
  children.push(
    ...(memo.openQuestions.length > 0
      ? bulletList(memo.openQuestions.map((q) => `誰に: ${q.whoToAsk} / 何を: ${q.what} / なぜ: ${q.why}`))
      : [body("特になし")]),
  );

  children.push(heading("9. 数値・整合性チェック", HeadingLevel.HEADING_1));
  if (memo.consistencyCheck.issues.length > 0) {
    children.push(...bulletList(memo.consistencyCheck.issues.map((i) => i.text)));
  }
  children.push(body(memo.consistencyCheck.summary));

  children.push(heading("10. 次のアクション", HeadingLevel.HEADING_1));
  children.push(
    makeTable(
      ["優先度", "アクション", "担当候補", "期限", "完了条件"],
      memo.nextActions.map((a) => [a.priority, a.action, a.owner, a.deadline, a.doneCondition]),
    ),
  );

  children.push(heading("11. リスク・注意点", HeadingLevel.HEADING_1));
  children.push(
    ...bulletList(memo.risks.map((r) => `${r.text}${r.requiresExpert ? "（専門家確認推奨）" : ""}`)),
  );

  children.push(
    body("本メモはAIによる分析結果であり、法務・税務・労務等の専門家判断を代替するものではありません。"),
  );

  const doc = new Document({
    sections: [{ children }],
    styles: {
      default: {
        document: { run: { font: FONT } },
      },
    },
  });

  return Packer.toBuffer(doc);
}
