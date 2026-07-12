import * as React from "react";
import { cn } from "@/lib/utils";

type Tone = "fact" | "assumption" | "question" | "risk" | "neutral" | "success" | "warning";

const toneClasses: Record<Tone, string> = {
  fact: "bg-blue-50 text-blue-700 border-blue-200",
  assumption: "bg-amber-50 text-amber-700 border-amber-200",
  question: "bg-purple-50 text-purple-700 border-purple-200",
  risk: "bg-red-50 text-red-700 border-red-200",
  neutral: "bg-slate-100 text-slate-700 border-slate-200",
  success: "bg-emerald-50 text-emerald-700 border-emerald-200",
  warning: "bg-orange-50 text-orange-700 border-orange-200",
};

export function Badge({
  tone = "neutral",
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        toneClasses[tone],
        className,
      )}
      {...props}
    />
  );
}
