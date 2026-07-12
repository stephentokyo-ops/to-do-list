"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function AnalyzePanel({ projectId }: { projectId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startAnalysis = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/projects/${projectId}/analyze`, { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "分析に失敗しました。");
        return;
      }
      router.push(`/projects/${projectId}/analyses/${data.analysis.id}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Button onClick={startAnalysis} disabled={loading} size="lg">
        {loading ? "AIが資料を解析しています..." : "分析を開始"}
      </Button>
      {loading && (
        <p className="mt-2 text-sm text-slate-500">
          入力内容を確認し、事実・論点・選択肢・リスクを整理しています。しばらくお待ちください。
        </p>
      )}
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
