"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { RiskItem } from "@/lib/ai/schema";

export function RisksEditor({
  items,
  onChange,
}: {
  items: RiskItem[];
  onChange: (items: RiskItem[]) => void;
}) {
  return (
    <div className="space-y-3">
      {items.map((risk, i) => (
        <div key={i} className="rounded-md border border-slate-200 p-3">
          <Textarea
            rows={2}
            value={risk.text}
            onChange={(e) => {
              const next = [...items];
              next[i] = { ...risk, text: e.target.value };
              onChange(next);
            }}
          />
          <div className="mt-2 flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={risk.requiresExpert}
                onChange={(e) => {
                  const next = [...items];
                  next[i] = { ...risk, requiresExpert: e.target.checked };
                  onChange(next);
                }}
              />
              専門家確認が必要
            </label>
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
        onClick={() => onChange([...items, { text: "", requiresExpert: false }])}
      >
        + リスクを追加
      </Button>
    </div>
  );
}
