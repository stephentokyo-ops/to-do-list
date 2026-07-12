"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { OptionComparison } from "@/lib/ai/schema";

const FIELDS: Array<{ key: keyof OptionComparison; label: string }> = [
  { key: "name", label: "選択肢" },
  { key: "pros", label: "メリット" },
  { key: "cons", label: "デメリット" },
  { key: "cost", label: "費用" },
  { key: "speed", label: "スピード" },
  { key: "difficulty", label: "実行難易度" },
  { key: "mainRisk", label: "主要リスク" },
  { key: "overallScore", label: "総合評価" },
];

export function OptionsEditor({
  items,
  onChange,
}: {
  items: OptionComparison[];
  onChange: (items: OptionComparison[]) => void;
}) {
  const update = (i: number, key: keyof OptionComparison, value: string) => {
    const next = [...items];
    next[i] = { ...next[i], [key]: value };
    onChange(next);
  };

  const empty: OptionComparison = {
    name: "",
    pros: "",
    cons: "",
    cost: "",
    speed: "",
    difficulty: "",
    mainRisk: "",
    overallScore: "",
  };

  return (
    <div className="space-y-4">
      {items.map((option, i) => (
        <div key={i} className="rounded-md border border-slate-200 p-3">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {FIELDS.map((f) => (
              <div key={f.key}>
                <label className="mb-0.5 block text-xs text-slate-500">{f.label}</label>
                <Input value={option[f.key]} onChange={(e) => update(i, f.key, e.target.value)} />
              </div>
            ))}
          </div>
          <div className="mt-2 text-right">
            <Button type="button" variant="ghost" size="sm" onClick={() => onChange(items.filter((_, idx) => idx !== i))}>
              この選択肢を削除
            </Button>
          </div>
        </div>
      ))}
      {items.length < 4 && (
        <Button type="button" variant="outline" size="sm" onClick={() => onChange([...items, { ...empty }])}>
          + 選択肢を追加
        </Button>
      )}
    </div>
  );
}
