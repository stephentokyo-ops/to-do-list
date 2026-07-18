import type { Category, Level } from "../types/session";

export const CATEGORY_LABELS: Record<Category, string> = {
  workplace: "職場",
  family: "家庭",
  friends: "友人",
  online: "オンライン・SNS",
  stranger: "見知らぬ人・接客",
};

export const LEVEL_LABELS: Record<Level, string> = {
  calm: "冷静で効果的",
  okay: "まずまず、改善の余地あり",
  reactive: "感情的になっています",
};
