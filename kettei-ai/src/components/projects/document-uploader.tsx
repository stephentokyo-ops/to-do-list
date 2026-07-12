"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { DocumentRecord } from "@/lib/db/types";

const EXTRACTION_LABEL: Record<string, string> = {
  pending: "処理中",
  success: "抽出済み",
  failed: "抽出失敗",
};

export function DocumentUploader({
  projectId,
  documents,
}: {
  projectId: string;
  documents: DocumentRecord[];
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    setError(null);
    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch(`/api/projects/${projectId}/documents`, {
          method: "POST",
          body: formData,
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setError(data.error ?? `${file.name}のアップロードに失敗しました。`);
        }
      }
      router.refresh();
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div>
      <div className="flex items-center gap-3">
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".pdf,.docx,.xlsx,.xls,.txt,.csv"
          onChange={(e) => handleFiles(e.target.files)}
          className="text-sm text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-slate-900 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-slate-700"
          disabled={uploading}
        />
        {uploading && <span className="text-sm text-slate-500">アップロード中...</span>}
      </div>
      <p className="mt-1 text-xs text-slate-400">対応形式: PDF, DOCX, XLSX, TXT, CSV</p>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      {documents.length > 0 && (
        <ul className="mt-4 divide-y divide-slate-100 rounded-md border border-slate-200">
          {documents.map((d) => (
            <li key={d.id} className="flex items-center justify-between px-3 py-2 text-sm">
              <span className="truncate text-slate-700">{d.originalFilename}</span>
              <span
                className={
                  d.extractionStatus === "failed"
                    ? "text-red-600"
                    : d.extractionStatus === "success"
                      ? "text-emerald-600"
                      : "text-slate-400"
                }
              >
                {EXTRACTION_LABEL[d.extractionStatus] ?? d.extractionStatus}
              </span>
            </li>
          ))}
        </ul>
      )}
      {documents.some((d) => d.extractionStatus === "failed" && d.errorMessage) && (
        <div className="mt-2 space-y-1">
          {documents
            .filter((d) => d.extractionStatus === "failed" && d.errorMessage)
            .map((d) => (
              <p key={d.id} className="text-xs text-red-600">
                {d.originalFilename}: {d.errorMessage}
              </p>
            ))}
        </div>
      )}
    </div>
  );
}
