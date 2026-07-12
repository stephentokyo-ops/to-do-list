import { NextResponse } from "next/server";
import { requireAdmin, AuthError } from "@/lib/auth";
import { getStore } from "@/lib/db";

export async function GET() {
  try {
    await requireAdmin();
    const store = getStore();
    const [profiles, usage] = await Promise.all([store.listProfiles(), store.listAllUsage()]);

    const usageByUser = new Map<string, { count: number; inputTokens: number; outputTokens: number; cost: number }>();
    for (const u of usage) {
      const entry = usageByUser.get(u.userId) ?? { count: 0, inputTokens: 0, outputTokens: 0, cost: 0 };
      entry.count += 1;
      entry.inputTokens += u.inputTokens;
      entry.outputTokens += u.outputTokens;
      entry.cost += u.estimatedCost;
      usageByUser.set(u.userId, entry);
    }

    const rows = profiles.map((p) => ({
      id: p.id,
      email: p.email,
      displayName: p.displayName,
      role: p.role,
      plan: p.plan,
      usage: usageByUser.get(p.id) ?? { count: 0, inputTokens: 0, outputTokens: 0, cost: 0 },
    }));

    return NextResponse.json({ users: rows });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: 403 });
    return NextResponse.json({ error: "使用量の取得に失敗しました。" }, { status: 500 });
  }
}
