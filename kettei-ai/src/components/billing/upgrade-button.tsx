"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { PlanId } from "@/lib/config/plans";

export function UpgradeButton({ plan, label }: { plan: PlanId; label: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div>
      <Button
        size="sm"
        disabled={loading}
        onClick={async () => {
          setLoading(true);
          setError(null);
          try {
            const res = await fetch("/api/billing/checkout", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ plan }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
              setError(data.error ?? "決済ページの表示に失敗しました。");
              return;
            }
            window.location.href = data.url;
          } finally {
            setLoading(false);
          }
        }}
      >
        {loading ? "処理中..." : label}
      </Button>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
