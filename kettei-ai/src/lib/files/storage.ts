import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { createClient } from "@supabase/supabase-js";
import { isDemoDb } from "@/lib/db";
import { sanitizeFilename } from "./validate";

const UPLOAD_DIR = path.join(process.cwd(), ".data", "uploads");
const EXPORT_DIR = path.join(process.cwd(), ".data", "exports");

const UPLOADS_BUCKET = "uploads";
const EXPORTS_BUCKET = "exports";

// ファイルストレージの抽象化。
// デモモード: ローカルファイルシステム（.data/uploads, .data/exports）
// 本番モード: Supabase Storage（バケットは supabase/migrations/0002_storage_buckets.sql で作成）
// 注意: Supabase Storage経路は実際のプロジェクトへの接続・動作確認を行っていない。

function supabaseAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );
}

export async function saveUploadedFile(buffer: Buffer, originalFilename: string): Promise<string> {
  const safeName = sanitizeFilename(originalFilename);
  const storedName = `${randomUUID()}-${safeName}`;

  if (isDemoDb()) {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
    await fs.writeFile(path.join(UPLOAD_DIR, storedName), buffer);
    return `uploads/${storedName}`;
  }

  const { error } = await supabaseAdminClient()
    .storage.from(UPLOADS_BUCKET)
    .upload(storedName, buffer, { contentType: "application/octet-stream" });
  if (error) throw error;
  return `${UPLOADS_BUCKET}/${storedName}`;
}

export async function saveExportFile(
  buffer: Buffer,
  analysisId: string,
  format: string,
): Promise<string> {
  const storedName = `${analysisId}.${format}`;

  if (isDemoDb()) {
    await fs.mkdir(EXPORT_DIR, { recursive: true });
    await fs.writeFile(path.join(EXPORT_DIR, storedName), buffer);
    return `exports/${storedName}`;
  }

  const { error } = await supabaseAdminClient()
    .storage.from(EXPORTS_BUCKET)
    .upload(storedName, buffer, { upsert: true });
  if (error) throw error;
  return `${EXPORTS_BUCKET}/${storedName}`;
}
