import { PDFParse } from "pdf-parse";
import mammoth from "mammoth";
import * as XLSX from "xlsx";

export interface ExtractionResult {
  text: string;
  status: "success" | "failed";
  errorMessage?: string;
}

// 注意: pdf-parse/pdfjs-distはnext.config.tsのserverExternalPackagesで
// バンドル対象から除外している。バンドルするとworkerスクリプトの相対配置が崩れ、
// 「Setting up fake worker failed」エラーでPDF抽出が失敗する。
async function extractPdf(buffer: Buffer): Promise<ExtractionResult> {
  const parser = new PDFParse({ data: buffer });
  try {
    const result = await parser.getText();
    return { text: result.text, status: "success" };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (message.toLowerCase().includes("password")) {
      return {
        text: "",
        status: "failed",
        errorMessage: "パスワードで保護されたPDFは処理できません。パスワードを解除してから再度アップロードしてください。",
      };
    }
    return {
      text: "",
      status: "failed",
      errorMessage: "PDFの読み込みに失敗しました。ファイルが破損している可能性があります。",
    };
  } finally {
    await parser.destroy();
  }
}

async function extractDocx(buffer: Buffer): Promise<ExtractionResult> {
  try {
    const result = await mammoth.extractRawText({ buffer });
    return { text: result.value, status: "success" };
  } catch {
    return {
      text: "",
      status: "failed",
      errorMessage: "Wordファイルの読み込みに失敗しました。ファイルが破損している可能性があります。",
    };
  }
}

function extractXlsx(buffer: Buffer): ExtractionResult {
  try {
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const chunks: string[] = [];
    for (const sheetName of workbook.SheetNames) {
      const sheet = workbook.Sheets[sheetName];
      const csv = XLSX.utils.sheet_to_csv(sheet);
      chunks.push(`# シート: ${sheetName}\n${csv}`);
    }
    return { text: chunks.join("\n\n"), status: "success" };
  } catch {
    return {
      text: "",
      status: "failed",
      errorMessage: "Excelファイルの読み込みに失敗しました。ファイルが破損している可能性があります。",
    };
  }
}

function extractPlainText(buffer: Buffer): ExtractionResult {
  try {
    return { text: buffer.toString("utf-8"), status: "success" };
  } catch {
    return { text: "", status: "failed", errorMessage: "テキストの読み込みに失敗しました。" };
  }
}

export async function extractTextFromFile(
  buffer: Buffer,
  extension: string,
): Promise<ExtractionResult> {
  switch (extension) {
    case "pdf":
      return extractPdf(buffer);
    case "docx":
      return extractDocx(buffer);
    case "xlsx":
    case "xls":
      return extractXlsx(buffer);
    case "txt":
    case "csv":
      return extractPlainText(buffer);
    default:
      return { text: "", status: "failed", errorMessage: "未対応のファイル形式です。" };
  }
}
