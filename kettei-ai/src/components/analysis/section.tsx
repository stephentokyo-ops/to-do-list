import type { ReactNode } from "react";

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border-t border-slate-100 py-5 first:border-t-0 first:pt-0">
      <h3 className="mb-2 text-sm font-semibold text-slate-500">{title}</h3>
      {children}
    </section>
  );
}
