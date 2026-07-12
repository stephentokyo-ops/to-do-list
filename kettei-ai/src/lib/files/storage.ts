import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { sanitizeFilename } from "./validate";

const UPLOAD_DIR = path.join(process.cwd(), ".data", "uploads");
const EXPORT_DIR = path.join(process.cwd(), ".data", "exports");

// ローカルファイルストレージ（デモ/開発用）。
// 本番運用ではSupabase Storageへの差し替えを想定しているが、
// 現時点ではSupabaseプロジェクトへ接続していないため未実装・未検証。
export async function saveUploadedFile(buffer: Buffer, originalFilename: string): Promise<string> {
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  const safeName = sanitizeFilename(originalFilename);
  const storedName = `${randomUUID()}-${safeName}`;
  await fs.writeFile(path.join(UPLOAD_DIR, storedName), buffer);
  return `uploads/${storedName}`;
}

export async function saveExportFile(
  buffer: Buffer,
  analysisId: string,
  format: string,
): Promise<string> {
  await fs.mkdir(EXPORT_DIR, { recursive: true });
  const storedName = `${analysisId}.${format}`;
  await fs.writeFile(path.join(EXPORT_DIR, storedName), buffer);
  return `exports/${storedName}`;
}
