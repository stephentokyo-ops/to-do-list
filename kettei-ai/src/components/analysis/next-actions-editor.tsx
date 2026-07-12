"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { NextAction } from "@/lib/ai/schema";

export function NextActionsEditor({
  items,
  onChange,
}: {
  items: NextAction[];
  onChange: (items: NextAction[]) => void;
}) {
  const update = (i: number, patch: Partial<NextAction>) => {
    const next = [...items];
    next[i] = { ...next[i], ...patch };
    onChange(next);
  };

  return (
    <div className="space-y-3">
      {items.map((action, i) => (
        <div key={i} className="grid grid-cols-1 gap-2 rounded-md border border-slate-200 p-3 sm:grid-cols-5">
          <Select value={action.priority} onChange={(e) => update(i, { priority: e.target.value as NextAction["priority"] })}>
            <option value="高">優先度: 高</option>
            <option value="中">優先度: 中</option>
            <option value="低">優先度: 低</option>
          </Select>
          <Input placeholder="アクション" value={action.action} onChange={(e) => update(i, { action: e.target.value })} />
          <Input placeholder="担当候補" value={action.owner} onChange={(e) => update(i, { owner: e.target.value })} />
          <Input placeholder="期限" value={action.deadline} onChange={(e) => update(i, { deadline: e.target.value })} />
          <div className="flex gap-2">
            <Input
              placeholder="完了条件"
              value={action.doneCondition}
              onChange={(e) => update(i, { doneCondition: e.target.value })}
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
        onClick={() =>
          onChange([...items, { priority: "中", action: "", owner: "", deadline: "", doneCondition: "" }])
        }
      >
        + アクションを追加
      </Button>
    </div>
  );
}
