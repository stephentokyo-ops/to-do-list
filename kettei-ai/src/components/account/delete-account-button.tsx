"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function DeleteAccountButton() {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!confirming) {
    return (
      <Button variant="danger" size="sm" onClick={() => setConfirming(true)}>
        アカウントを削除する
      </Button>
    );
  }

  return (
    <div className="space-y-2 rounded-md border border-red-200 bg-red-50 p-3">
      <p className="text-sm text-red-700">
        本当に削除しますか？案件・分析結果・アップロードした資料はすべて完全に削除され、元に戻せません。
      </p>
      <div className="flex gap-2">
        <Button variant="ghost" size="sm" onClick={() => setConfirming(false)}>
          キャンセル
        </Button>
        <Button
          variant="danger"
          size="sm"
          disabled={loading}
          onClick={async () => {
            setLoading(true);
            const res = await fetch("/api/account/delete", { method: "POST" });
            if (res.ok) {
              router.push("/");
              router.refresh();
            } else {
              setLoading(false);
            }
          }}
        >
          {loading ? "削除中..." : "完全に削除する"}
        </Button>
      </div>
    </div>
  );
}
