import { describe, it, expect } from "vitest";
import { getPlan, PLANS } from "./plans";

describe("getPlan", () => {
  it("有効なプランIDに対応する設定を返す", () => {
    expect(getPlan("standard")).toBe(PLANS.standard);
  });

  it("未知のプランIDの場合はFreeプランにフォールバックする", () => {
    expect(getPlan("unknown-plan")).toBe(PLANS.free);
  });

  it("未指定の場合はFreeプランにフォールバックする", () => {
    expect(getPlan(null)).toBe(PLANS.free);
    expect(getPlan(undefined)).toBe(PLANS.free);
  });

  it("Freeプランはproject上限1件・PDF透かしありである", () => {
    expect(PLANS.free.monthlyProjectLimit).toBe(1);
    expect(PLANS.free.pdfWatermark).toBe(true);
  });
});
