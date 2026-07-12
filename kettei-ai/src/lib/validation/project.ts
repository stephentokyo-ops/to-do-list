import { z } from "zod";
import { ANALYSIS_TYPES } from "@/lib/config/analysis-types";

const analysisTypeIds = ANALYSIS_TYPES.map((t) => t.id) as [string, ...string[]];

export const CreateProjectSchema = z.object({
  title: z.string().min(1, "案件名を入力してください。").max(200),
  analysisType: z.enum(analysisTypeIds, { message: "分析目的を選択してください。" }),
  background: z.string().max(5000),
  priorityPoints: z.string().max(2000),
  deadline: z.string().max(200),
  inputText: z.string().max(400000),
});
export type CreateProjectValues = z.infer<typeof CreateProjectSchema>;
