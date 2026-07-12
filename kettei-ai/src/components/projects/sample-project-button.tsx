"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function SampleProjectButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  return (
    <Button
      variant="outline"
      disabled={loading}
      onClick={async () => {
        setLoading(true);
        try {
          const res = await fetch("/api/demo/sample", { method: "POST" });
          const data = await res.json();
          if (res.ok) {
            router.push(`/projects/${data.project.id}`);
          }
        } finally {
          setLoading(false);
        }
      }}
    >
      {loading ? "読み込み中..." : "サンプル案件を試す"}
    </Button>
  );
}
