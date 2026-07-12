"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Section } from "./section";
import { TextListEditor } from "./text-list-editor";
import { FactsEditor } from "./facts-editor";
import { RisksEditor } from "./risks-editor";
import { OpenQuestionsEditor } from "./open-questions-editor";
import { OptionsEditor } from "./options-editor";
import { NextActionsEditor } from "./next-actions-editor";
import type { DecisionMemo } from "@/lib/ai/schema";
import type { ExportFormat } from "@/lib/db/types";

const CONFIDENCE_TONE = { 高: "success", 中: "warning", 低: "risk" } as const;

export function MemoView({
  analysisId,
  initialMemo,
  allowedExportFormats,
}: {
  analysisId: string;
  initialMemo: DecisionMemo;
  allowedExportFormats: ExportFormat[];
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [memo, setMemo] = useState<DecisionMemo>(initialMemo);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exportingFormat, setExportingFormat] = useState<ExportFormat | null>(null);

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/analyses/${analysisId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memo }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "保存に失敗しました。");
        return;
      }
      setMemo(data.analysis.resultJson);
      setEditing(false);
      router.refresh();
    } finally {
      setSaving(false);
    }
  };

  const download = async (format: ExportFormat) => {
    setExportingFormat(format);
    try {
      const res = await fetch(`/api/analyses/${analysisId}/export?format=${format}`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error ?? "出力に失敗しました。");
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `decision-memo.${format === "markdown" ? "md" : format}`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExportingFormat(null);
    }
  };

  const exportButtons: Array<{ format: ExportFormat; label: string }> = [
    { format: "markdown", label: "Markdown" },
    { format: "pdf", label: "PDF" },
    { format: "docx", label: "Word (DOCX)" },
  ];

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-md border border-slate-200 bg-white p-3">
        <div className="flex flex-wrap gap-2">
          {exportButtons.map((b) => {
            const allowed = allowedExportFormats.includes(b.format);
            return (
              <Button
                key={b.format}
                size="sm"
                variant="outline"
                disabled={!allowed || exportingFormat !== null}
                title={allowed ? undefined : "現在のプランではご利用いただけません"}
                onClick={() => download(b.format)}
              >
                {exportingFormat === b.format ? "出力中..." : `${b.label}で出力`}
              </Button>
            );
          })}
        </div>
        <div className="flex gap-2">
          {editing ? (
            <>
              <Button size="sm" variant="ghost" onClick={() => { setMemo(initialMemo); setEditing(false); }}>
                キャンセル
              </Button>
              <Button size="sm" onClick={save} disabled={saving}>
                {saving ? "保存中..." : "保存する"}
              </Button>
            </>
          ) : (
            <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
              編集する
            </Button>
          )}
        </div>
      </div>
      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

      <div className="rounded-lg border border-slate-200 bg-white p-6">
        {editing ? (
          <Input
            className="mb-4 text-xl font-bold"
            value={memo.projectTitle}
            onChange={(e) => setMemo({ ...memo, projectTitle: e.target.value })}
          />
        ) : (
          <h1 className="mb-2 text-xl font-bold text-slate-900">{memo.projectTitle}</h1>
        )}

        <Section title="1. 結論">
          {editing ? (
            <Textarea rows={2} value={memo.conclusion} onChange={(e) => setMemo({ ...memo, conclusion: e.target.value })} />
          ) : (
            <p className="text-lg font-medium text-slate-900">{memo.conclusion}</p>
          )}
        </Section>

        <Section title="2. 判断の確信度">
          {editing ? (
            <div className="space-y-2">
              <select
                className="h-10 rounded-md border border-slate-300 px-3 text-sm"
                value={memo.confidence.level}
                onChange={(e) =>
                  setMemo({ ...memo, confidence: { ...memo.confidence, level: e.target.value as "高" | "中" | "低" } })
                }
              >
                <option value="高">高</option>
                <option value="中">中</option>
                <option value="低">低</option>
              </select>
              <Textarea
                rows={2}
                value={memo.confidence.reason}
                onChange={(e) => setMemo({ ...memo, confidence: { ...memo.confidence, reason: e.target.value } })}
              />
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Badge tone={CONFIDENCE_TONE[memo.confidence.level]}>確信度: {memo.confidence.level}</Badge>
              <span className="text-sm text-slate-600">{memo.confidence.reason}</span>
            </div>
          )}
        </Section>

        <Section title="3. 事実">
          {editing ? (
            <FactsEditor items={memo.facts} onChange={(facts) => setMemo({ ...memo, facts })} />
          ) : (
            <ul className="space-y-1.5">
              {memo.facts.map((f, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <Badge tone="fact" className="mt-0.5 shrink-0">事実</Badge>
                  <span>
                    {f.text}
                    {f.source && <span className="text-slate-400">（出典: {f.source}）</span>}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Section>

        <Section title="4. 推測・仮定">
          {editing ? (
            <TextListEditor items={memo.assumptions.map((a) => a.text)} onChange={(texts) => setMemo({ ...memo, assumptions: texts.map((text) => ({ text })) })} />
          ) : (
            <ul className="space-y-1.5">
              {memo.assumptions.map((a, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <Badge tone="assumption" className="mt-0.5 shrink-0">推測</Badge>
                  <span>{a.text}</span>
                </li>
              ))}
            </ul>
          )}
        </Section>

        <Section title="5. 主要論点">
          {editing ? (
            <TextListEditor items={memo.keyIssues.map((k) => k.text)} onChange={(texts) => setMemo({ ...memo, keyIssues: texts.slice(0, 7).map((text) => ({ text })) })} />
          ) : (
            <ol className="list-decimal space-y-1 pl-5 text-sm">
              {memo.keyIssues.map((k, i) => (
                <li key={i}>{k.text}</li>
              ))}
            </ol>
          )}
        </Section>

        <Section title="6. 選択肢比較">
          {editing ? (
            <OptionsEditor items={memo.optionsComparison} onChange={(optionsComparison) => setMemo({ ...memo, optionsComparison })} />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50 text-left">
                    {["選択肢", "メリット", "デメリット", "費用", "スピード", "実行難易度", "主要リスク", "総合評価"].map(
                      (h) => (
                        <th key={h} className="border border-slate-200 px-3 py-2 font-medium">
                          {h}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody>
                  {memo.optionsComparison.map((o, i) => (
                    <tr key={i}>
                      {[o.name, o.pros, o.cons, o.cost, o.speed, o.difficulty, o.mainRisk, o.overallScore].map(
                        (v, j) => (
                          <td key={j} className="border border-slate-200 px-3 py-2 align-top">
                            {v}
                          </td>
                        ),
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Section>

        <Section title="7. 推奨案">
          {editing ? (
            <div className="space-y-2">
              <Input
                value={memo.recommendation.chosenOption}
                onChange={(e) => setMemo({ ...memo, recommendation: { ...memo.recommendation, chosenOption: e.target.value } })}
              />
              <Textarea
                rows={2}
                value={memo.recommendation.reason}
                onChange={(e) => setMemo({ ...memo, recommendation: { ...memo.recommendation, reason: e.target.value } })}
              />
              <Textarea
                rows={2}
                value={memo.recommendation.objections}
                onChange={(e) => setMemo({ ...memo, recommendation: { ...memo.recommendation, objections: e.target.value } })}
              />
            </div>
          ) : (
            <div className="rounded-md bg-emerald-50 p-3 text-sm">
              <p className="font-semibold text-emerald-800">推奨: {memo.recommendation.chosenOption}</p>
              <p className="mt-1 text-slate-700">{memo.recommendation.reason}</p>
              <p className="mt-2 text-slate-500">反対意見・不採用理由: {memo.recommendation.objections}</p>
            </div>
          )}
        </Section>

        <Section title="8. 未確認事項">
          {editing ? (
            <OpenQuestionsEditor items={memo.openQuestions} onChange={(openQuestions) => setMemo({ ...memo, openQuestions })} />
          ) : (
            <ul className="space-y-1.5">
              {memo.openQuestions.map((q, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <Badge tone="question" className="mt-0.5 shrink-0">要確認</Badge>
                  <span>
                    <strong>{q.whoToAsk}</strong>へ「{q.what}」を確認（理由: {q.why}）
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Section>

        <Section title="9. 数値・整合性チェック">
          {editing ? (
            <div className="space-y-2">
              <TextListEditor
                items={memo.consistencyCheck.issues.map((i) => i.text)}
                onChange={(texts) =>
                  setMemo({ ...memo, consistencyCheck: { ...memo.consistencyCheck, issues: texts.map((text) => ({ text })) } })
                }
              />
              <Textarea
                rows={2}
                value={memo.consistencyCheck.summary}
                onChange={(e) => setMemo({ ...memo, consistencyCheck: { ...memo.consistencyCheck, summary: e.target.value } })}
              />
            </div>
          ) : (
            <div>
              {memo.consistencyCheck.issues.length > 0 && (
                <ul className="mb-2 space-y-1">
                  {memo.consistencyCheck.issues.map((i, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <Badge tone="risk" className="mt-0.5 shrink-0">不整合</Badge>
                      <span>{i.text}</span>
                    </li>
                  ))}
                </ul>
              )}
              <p className="text-sm text-slate-600">{memo.consistencyCheck.summary}</p>
            </div>
          )}
        </Section>

        <Section title="10. 次のアクション">
          {editing ? (
            <NextActionsEditor items={memo.nextActions} onChange={(nextActions) => setMemo({ ...memo, nextActions })} />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50 text-left">
                    {["優先度", "アクション", "担当候補", "期限", "完了条件"].map((h) => (
                      <th key={h} className="border border-slate-200 px-3 py-2 font-medium">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {memo.nextActions.map((a, i) => (
                    <tr key={i}>
                      <td className="border border-slate-200 px-3 py-2">
                        <Badge tone={a.priority === "高" ? "risk" : a.priority === "中" ? "warning" : "neutral"}>
                          {a.priority}
                        </Badge>
                      </td>
                      <td className="border border-slate-200 px-3 py-2">{a.action}</td>
                      <td className="border border-slate-200 px-3 py-2">{a.owner}</td>
                      <td className="border border-slate-200 px-3 py-2">{a.deadline}</td>
                      <td className="border border-slate-200 px-3 py-2">{a.doneCondition}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Section>

        <Section title="11. リスク・注意点">
          {editing ? (
            <RisksEditor items={memo.risks} onChange={(risks) => setMemo({ ...memo, risks })} />
          ) : (
            <ul className="space-y-1.5">
              {memo.risks.map((r, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <Badge tone="risk" className="mt-0.5 shrink-0">
                    {r.requiresExpert ? "要専門家確認" : "リスク"}
                  </Badge>
                  <span>{r.text}</span>
                </li>
              ))}
            </ul>
          )}
        </Section>

        <p className="mt-6 border-t border-slate-100 pt-4 text-xs text-slate-400">
          本メモはAIによる分析結果であり、法務・税務・労務等の専門家判断を代替するものではありません。重要な意思決定の前に、必要に応じて専門家へご確認ください。
        </p>
      </div>
    </div>
  );
}
