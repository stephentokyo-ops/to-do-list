import type { DecisionMemo } from "@/lib/ai/schema";
import type { PlanId } from "@/lib/config/plans";

export type UserRole = "user" | "admin";

export interface Profile {
  id: string;
  email: string;
  passwordHash: string; // Supabase Auth利用時は空文字（パスワードはSupabase側で管理）
  displayName: string;
  role: UserRole;
  plan: PlanId;
  monthlyLimit: number | null; // null = プラン既定値を使用
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  createdAt: string;
  updatedAt: string;
}

export type ProjectStatus = "draft" | "analyzing" | "completed" | "failed";

export interface Project {
  id: string;
  userId: string;
  title: string;
  analysisType: string;
  background: string;
  priorityPoints: string;
  deadline: string;
  inputText: string;
  status: ProjectStatus;
  createdAt: string;
  updatedAt: string;
}

export type ExtractionStatus = "pending" | "success" | "failed";

export interface DocumentRecord {
  id: string;
  projectId: string;
  userId: string;
  originalFilename: string;
  storagePath: string;
  mimeType: string;
  sizeBytes: number;
  extractedText: string;
  extractionStatus: ExtractionStatus;
  errorMessage?: string;
  createdAt: string;
}

export type AnalysisStatus = "pending" | "succeeded" | "failed";

export interface Analysis {
  id: string;
  projectId: string;
  userId: string;
  provider: string;
  model: string;
  promptVersion: string;
  inputTokens: number;
  outputTokens: number;
  estimatedCost: number;
  status: AnalysisStatus;
  resultJson: DecisionMemo | null;
  resultMarkdown: string | null;
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
}

export type ExportFormat = "markdown" | "pdf" | "docx";

export interface ExportRecord {
  id: string;
  analysisId: string;
  userId: string;
  format: ExportFormat;
  storagePath: string;
  createdAt: string;
}

export interface UsageRecord {
  id: string;
  userId: string;
  analysisId: string;
  inputTokens: number;
  outputTokens: number;
  estimatedCost: number;
  createdAt: string;
}

export interface PromptVersionRecord {
  id: string;
  name: string;
  version: string;
  systemPrompt: string;
  isActive: boolean;
  createdAt: string;
}
