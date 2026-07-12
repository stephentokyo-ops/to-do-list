import { describe, it, expect } from "vitest";
import * as XLSX from "xlsx";
import { Document, Packer, Paragraph } from "docx";
import { extractTextFromFile } from "./extract";

// PDF抽出はNext.js(Turbopack)特有のworkerバンドリング問題があり、
// next.config.tsのserverExternalPackages設定と実サーバー環境での
// アップロードによる手動/E2E確認で検証済み（実際にNext dev serverへ
// PDF/DOCX/XLSX/TXT/CSVをアップロードし抽出結果を確認した）。

describe("extractTextFromFile", () => {
  it("プレーンテキストをそのまま抽出する", async () => {
    const buffer = Buffer.from("これはテストです。\n改行を含みます。", "utf-8");
    const result = await extractTextFromFile(buffer, "txt");
    expect(result.status).toBe("success");
    expect(result.text).toContain("これはテストです。");
  });

  it("CSVをそのまま抽出する", async () => {
    const buffer = Buffer.from("項目,金額\n仕入額,1000\n", "utf-8");
    const result = await extractTextFromFile(buffer, "csv");
    expect(result.status).toBe("success");
    expect(result.text).toContain("仕入額,1000");
  });

  it("XLSXをシート単位のCSVテキストとして抽出する", async () => {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([["項目", "金額"], ["仕入額", 1000]]);
    XLSX.utils.book_append_sheet(wb, ws, "サマリー");
    const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" }) as Buffer;

    const result = await extractTextFromFile(buffer, "xlsx");
    expect(result.status).toBe("success");
    expect(result.text).toContain("シート: サマリー");
    expect(result.text).toContain("仕入額");
  });

  it("DOCXから段落テキストを抽出する", async () => {
    const doc = new Document({
      sections: [{ children: [new Paragraph("これはWordのテスト段落です。")] }],
    });
    const buffer = await Packer.toBuffer(doc);

    const result = await extractTextFromFile(buffer, "docx");
    expect(result.status).toBe("success");
    expect(result.text).toContain("これはWordのテスト段落です。");
  });

  it("未対応の拡張子はfailedを返す", async () => {
    const result = await extractTextFromFile(Buffer.from("x"), "exe");
    expect(result.status).toBe("failed");
  });
});
