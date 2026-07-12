import { describe, it, expect } from "vitest";
import { validateUploadedFile, FileValidationError, getExtension, sanitizeFilename } from "./validate";

describe("validateUploadedFile", () => {
  it("許可された拡張子とサイズのファイルを受理する", () => {
    expect(() =>
      validateUploadedFile({ name: "report.pdf", type: "application/pdf", size: 1024 }),
    ).not.toThrow();
  });

  it("未対応の拡張子を拒否する", () => {
    expect(() =>
      validateUploadedFile({ name: "malware.exe", type: "application/octet-stream", size: 1024 }),
    ).toThrow(FileValidationError);
  });

  it("空ファイルを拒否する", () => {
    expect(() =>
      validateUploadedFile({ name: "empty.txt", type: "text/plain", size: 0 }),
    ).toThrow(FileValidationError);
  });

  it("上限を超えるサイズのファイルを拒否する", () => {
    const maxBytes = Number(process.env.MAX_UPLOAD_SIZE_MB || "20") * 1024 * 1024;
    expect(() =>
      validateUploadedFile({ name: "huge.pdf", type: "application/pdf", size: maxBytes + 1 }),
    ).toThrow(FileValidationError);
  });
});

describe("getExtension", () => {
  it("拡張子を小文字で返す", () => {
    expect(getExtension("Report.PDF")).toBe("pdf");
  });

  it("拡張子がない場合は空文字を返す", () => {
    expect(getExtension("README")).toBe("");
  });
});

describe("sanitizeFilename", () => {
  it("パストラバーサルを除去する", () => {
    expect(sanitizeFilename("../../etc/passwd")).not.toContain("..");
  });

  it("ディレクトリ部分を除去する", () => {
    expect(sanitizeFilename("/var/tmp/report.pdf")).toBe("report.pdf");
  });
});
