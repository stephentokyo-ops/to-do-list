"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { z } from "zod";
import type { OpenQuestionSchema } from "@/lib/ai/schema";

type OpenQuestion = z.infer<typeof OpenQuestionSchema>;

export function OpenQuestionsEditor({
  items,
  onChange,
}: {
  items: OpenQuestion[];
  onChange: (items: OpenQuestion[]) => void;
}) {
  const update = (i: number, patch: Partial<OpenQuestion>) => {
    const next = [...items];
    next[i] = { ...next[i], ...patch };
    onChange(next);
  };

  return (
    <div className="space-y-3">
      {items.map((q, i) => (
        <div key={i} className="grid grid-cols-1 gap-2 rounded-md border border-slate-200 p-3 sm:grid-cols-3">
          <Input placeholder="誰に" value={q.whoToAsk} onChange={(e) => update(i, { whoToAsk: e.target.value })} />
          <Input placeholder="何を" value={q.what} onChange={(e) => update(i, { what: e.target.value })} />
          <div className="flex gap-2">
            <Input placeholder="なぜ" value={q.why} onChange={(e) => update(i, { why: e.target.value })} />
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
        onClick={() => onChange([...items, { whoToAsk: "", what: "", why: "" }])}
      >
        + 未確認事項を追加
      </Button>
    </div>
  );
}
