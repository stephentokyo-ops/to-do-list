const ALLOWED_EXTENSIONS = new Set(["pdf", "docx", "xlsx", "xls", "txt", "csv"]);

const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
  "text/plain",
  "text/csv",
  "application/csv",
  "application/octet-stream", // 一部ブラウザ/OSでCSV等がこのMIMEになることがある
]);

export class FileValidationError extends Error {}

export function getExtension(filename: string): string {
  const idx = filename.lastIndexOf(".");
  return idx === -1 ? "" : filename.slice(idx + 1).toLowerCase();
}

// 危険なファイル名を正規化（パストラバーサル対策・制御文字除去）
export function sanitizeFilename(filename: string): string {
  const base = filename.replace(/^.*[\\/]/, "");
  const withoutControlChars = Array.from(base)
    .filter((ch) => {
      const code = ch.codePointAt(0) ?? 0;
      return code >= 32 && code !== 127;
    })
    .join("");
  const cleaned = withoutControlChars.replace(/\.\./g, "");
  return cleaned.slice(0, 255) || "unnamed";
}

export function validateUploadedFile(file: { name: string; type: string; size: number }): void {
  const maxSizeMb = Number(process.env.MAX_UPLOAD_SIZE_MB || "20");
  const maxBytes = maxSizeMb * 1024 * 1024;

  const ext = getExtension(file.name);
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    throw new FileValidationError(
      `対応していないファイル形式です（.${ext || "不明"}）。PDF, DOCX, XLSX, TXT, CSVのみアップロードできます。`,
    );
  }
  if (file.type && !ALLOWED_MIME_TYPES.has(file.type)) {
    throw new FileValidationError(
      `ファイルの種類を確認できませんでした（${file.type}）。別のファイルをお試しください。`,
    );
  }
  if (file.size <= 0) {
    throw new FileValidationError("ファイルが空です。");
  }
  if (file.size > maxBytes) {
    throw new FileValidationError(
      `ファイルサイズが上限（${maxSizeMb}MB）を超えています。`,
    );
  }
}
