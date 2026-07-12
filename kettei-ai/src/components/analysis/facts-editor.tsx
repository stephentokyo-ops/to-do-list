"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { FactItem } from "@/lib/ai/schema";

export function FactsEditor({
  items,
  onChange,
}: {
  items: FactItem[];
  onChange: (items: FactItem[]) => void;
}) {
  return (
    <div className="space-y-3">
      {items.map((fact, i) => (
        <div key={i} className="rounded-md border border-slate-200 p-3">
          <Textarea
            rows={2}
            value={fact.text}
            onChange={(e) => {
              const next = [...items];
              next[i] = { ...fact, text: e.target.value };
              onChange(next);
            }}
          />
          <div className="mt-2 flex items-center gap-2">
            <Input
              placeholder="出典（ファイル名・資料番号）"
              value={fact.source ?? ""}
              onChange={(e) => {
                const next = [...items];
                next[i] = { ...fact, source: e.target.value };
                onChange(next);
              }}
            />
            <Button type="button" variant="ghost" size="sm" onClick={() => onChange(items.filter((_, idx) => idx !== i))}>
              削除
            </Button>
          </div>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => onChange([...items, { text: "", source: "" }])}
      >
        + 事実を追加
      </Button>
    </div>
  );
}
