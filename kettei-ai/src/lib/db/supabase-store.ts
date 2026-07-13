import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { DataStore } from "./store";
import type {
  Analysis,
  DocumentRecord,
  ExportRecord,
  Profile,
  Project,
  UsageRecord,
} from "./types";

// Supabase(PostgreSQL)を用いた本番用データストア実装。
// 注意: このプロジェクトの実行環境には実際のSupabaseプロジェクトが接続されていないため、
// 本実装は supabase/migrations のスキーマに基づいて記述したのみで、実機での動作確認は行っていない。
// 本番投入前に必ず Supabase プロジェクトを用意し、E2Eで動作検証すること。

function toProfile(row: Record<string, unknown>): Profile {
  return {
    id: row.id as string,
    email: row.email as string,
    passwordHash: (row.password_hash as string) ?? "",
    displayName: row.display_name as string,
    role: row.role as Profile["role"],
    plan: row.plan as Profile["plan"],
    monthlyLimit: (row.monthly_limit as number | null) ?? null,
    stripeCustomerId: (row.stripe_customer_id as string | null) ?? null,
    stripeSubscriptionId: (row.stripe_subscription_id as string | null) ?? null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

function toProject(row: Record<string, unknown>): Project {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    title: row.title as string,
    analysisType: row.analysis_type as string,
    background: (row.background as string) ?? "",
    priorityPoints: (row.priority_points as string) ?? "",
    deadline: (row.deadline as string) ?? "",
    inputText: (row.input_text as string) ?? "",
    status: row.status as Project["status"],
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

function toDocument(row: Record<string, unknown>): DocumentRecord {
  return {
    id: row.id as string,
    projectId: row.project_id as string,
    userId: row.user_id as string,
    originalFilename: row.original_filename as string,
    storagePath: row.storage_path as string,
    mimeType: row.mime_type as string,
    sizeBytes: row.size_bytes as number,
    extractedText: (row.extracted_text as string) ?? "",
    extractionStatus: row.extraction_status as DocumentRecord["extractionStatus"],
    errorMessage: row.error_message as string | undefined,
    createdAt: row.created_at as string,
  };
}

function toAnalysis(row: Record<string, unknown>): Analysis {
  return {
    id: row.id as string,
    projectId: row.project_id as string,
    userId: row.user_id as string,
    provider: row.provider as string,
    model: row.model as string,
    promptVersion: row.prompt_version as string,
    inputTokens: (row.input_tokens as number) ?? 0,
    outputTokens: (row.output_tokens as number) ?? 0,
    estimatedCost: (row.estimated_cost as number) ?? 0,
    status: row.status as Analysis["status"],
    resultJson: (row.result_json as Analysis["resultJson"]) ?? null,
    resultMarkdown: (row.result_markdown as string) ?? null,
    errorMessage: (row.error_message as string) ?? null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

class SupabaseStore implements DataStore {
  private client: SupabaseClient;

  constructor() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    this.client = createClient(url, serviceKey, { auth: { persistSession: false } });
  }

  async createProfile(input: Omit<Profile, "createdAt" | "updatedAt">): Promise<Profile> {
    const { data, error } = await this.client
      .from("profiles")
      .insert({
        id: input.id,
        email: input.email,
        password_hash: input.passwordHash,
        display_name: input.displayName,
        role: input.role,
        plan: input.plan,
        monthly_limit: input.monthlyLimit,
        stripe_customer_id: input.stripeCustomerId,
        stripe_subscription_id: input.stripeSubscriptionId,
      })
      .select()
      .single();
    if (error) throw error;
    return toProfile(data);
  }

  async getProfileById(id: string): Promise<Profile | null> {
    const { data, error } = await this.client.from("profiles").select().eq("id", id).maybeSingle();
    if (error) throw error;
    return data ? toProfile(data) : null;
  }

  async getProfileByEmail(email: string): Promise<Profile | null> {
    const { data, error } = await this.client
      .from("profiles")
      .select()
      .ilike("email", email)
      .maybeSingle();
    if (error) throw error;
    return data ? toProfile(data) : null;
  }

  async listProfiles(): Promise<Profile[]> {
    const { data, error } = await this.client.from("profiles").select();
    if (error) throw error;
    return (data ?? []).map(toProfile);
  }

  async updateProfile(id: string, patch: Partial<Profile>): Promise<Profile> {
    const { data, error } = await this.client
      .from("profiles")
      .update({
        display_name: patch.displayName,
        role: patch.role,
        plan: patch.plan,
        monthly_limit: patch.monthlyLimit,
        stripe_customer_id: patch.stripeCustomerId,
        stripe_subscription_id: patch.stripeSubscriptionId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return toProfile(data);
  }

  async deleteProfile(id: string): Promise<void> {
    // auth.usersをAdmin APIで削除する。profilesは外部キーのON DELETE CASCADEで連動削除される
    // (supabase/migrations/0001_init.sql参照)。service_role_keyで生成したクライアントのみ実行可能。
    const { error } = await this.client.auth.admin.deleteUser(id);
    if (error) throw error;
  }

  async createProject(input: Omit<Project, "id" | "createdAt" | "updatedAt">): Promise<Project> {
    const { data, error } = await this.client
      .from("projects")
      .insert({
        user_id: input.userId,
        title: input.title,
        analysis_type: input.analysisType,
        background: input.background,
        priority_points: input.priorityPoints,
        deadline: input.deadline,
        input_text: input.inputText,
        status: input.status,
      })
      .select()
      .single();
    if (error) throw error;
    return toProject(data);
  }

  async getProject(id: string): Promise<Project | null> {
    const { data, error } = await this.client.from("projects").select().eq("id", id).maybeSingle();
    if (error) throw error;
    return data ? toProject(data) : null;
  }

  async listProjectsByUser(userId: string): Promise<Project[]> {
    const { data, error } = await this.client
      .from("projects")
      .select()
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map(toProject);
  }

  async updateProject(id: string, patch: Partial<Project>): Promise<Project> {
    const { data, error } = await this.client
      .from("projects")
      .update({
        title: patch.title,
        analysis_type: patch.analysisType,
        background: patch.background,
        priority_points: patch.priorityPoints,
        deadline: patch.deadline,
        input_text: patch.inputText,
        status: patch.status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return toProject(data);
  }

  async deleteProject(id: string): Promise<void> {
    const { error } = await this.client.from("projects").delete().eq("id", id);
    if (error) throw error;
  }

  async createDocument(input: Omit<DocumentRecord, "id" | "createdAt">): Promise<DocumentRecord> {
    const { data, error } = await this.client
      .from("documents")
      .insert({
        project_id: input.projectId,
        user_id: input.userId,
        original_filename: input.originalFilename,
        storage_path: input.storagePath,
        mime_type: input.mimeType,
        size_bytes: input.sizeBytes,
        extracted_text: input.extractedText,
        extraction_status: input.extractionStatus,
        error_message: input.errorMessage,
      })
      .select()
      .single();
    if (error) throw error;
    return toDocument(data);
  }

  async listDocumentsByProject(projectId: string): Promise<DocumentRecord[]> {
    const { data, error } = await this.client.from("documents").select().eq("project_id", projectId);
    if (error) throw error;
    return (data ?? []).map(toDocument);
  }

  async createAnalysis(input: Omit<Analysis, "id" | "createdAt" | "updatedAt">): Promise<Analysis> {
    const { data, error } = await this.client
      .from("analyses")
      .insert({
        project_id: input.projectId,
        user_id: input.userId,
        provider: input.provider,
        model: input.model,
        prompt_version: input.promptVersion,
        input_tokens: input.inputTokens,
        output_tokens: input.outputTokens,
        estimated_cost: input.estimatedCost,
        status: input.status,
        result_json: input.resultJson,
        result_markdown: input.resultMarkdown,
        error_message: input.errorMessage,
      })
      .select()
      .single();
    if (error) throw error;
    return toAnalysis(data);
  }

  async getAnalysis(id: string): Promise<Analysis | null> {
    const { data, error } = await this.client.from("analyses").select().eq("id", id).maybeSingle();
    if (error) throw error;
    return data ? toAnalysis(data) : null;
  }

  async listAnalysesByProject(projectId: string): Promise<Analysis[]> {
    const { data, error } = await this.client
      .from("analyses")
      .select()
      .eq("project_id", projectId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map(toAnalysis);
  }

  async listAnalysesByUser(userId: string): Promise<Analysis[]> {
    const { data, error } = await this.client
      .from("analyses")
      .select()
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map(toAnalysis);
  }

  async updateAnalysis(id: string, patch: Partial<Analysis>): Promise<Analysis> {
    const { data, error } = await this.client
      .from("analyses")
      .update({
        status: patch.status,
        result_json: patch.resultJson,
        result_markdown: patch.resultMarkdown,
        error_message: patch.errorMessage,
        input_tokens: patch.inputTokens,
        output_tokens: patch.outputTokens,
        estimated_cost: patch.estimatedCost,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return toAnalysis(data);
  }

  async createExport(input: Omit<ExportRecord, "id" | "createdAt">): Promise<ExportRecord> {
    const { data, error } = await this.client
      .from("exports")
      .insert({
        analysis_id: input.analysisId,
        user_id: input.userId,
        format: input.format,
        storage_path: input.storagePath,
      })
      .select()
      .single();
    if (error) throw error;
    return {
      id: data.id,
      analysisId: data.analysis_id,
      userId: data.user_id,
      format: data.format,
      storagePath: data.storage_path,
      createdAt: data.created_at,
    };
  }

  async recordUsage(input: Omit<UsageRecord, "id" | "createdAt">): Promise<UsageRecord> {
    const { data, error } = await this.client
      .from("usage_records")
      .insert({
        user_id: input.userId,
        analysis_id: input.analysisId,
        input_tokens: input.inputTokens,
        output_tokens: input.outputTokens,
        estimated_cost: input.estimatedCost,
      })
      .select()
      .single();
    if (error) throw error;
    return {
      id: data.id,
      userId: data.user_id,
      analysisId: data.analysis_id,
      inputTokens: data.input_tokens,
      outputTokens: data.output_tokens,
      estimatedCost: data.estimated_cost,
      createdAt: data.created_at,
    };
  }

  async getMonthlyUsage(
    userId: string,
    yearMonth: string,
  ): Promise<{ projectCount: number; totalChars: number }> {
    const { data, error } = await this.client
      .from("projects")
      .select("id, input_text")
      .eq("user_id", userId)
      .gte("created_at", `${yearMonth}-01`)
      .lt("created_at", `${yearMonth}-32`);
    if (error) throw error;
    const projectCount = data?.length ?? 0;
    let totalChars = 0;
    for (const row of data ?? []) {
      totalChars += ((row as { input_text?: string }).input_text ?? "").length;
    }
    return { projectCount, totalChars };
  }

  async listAllUsage(): Promise<UsageRecord[]> {
    const { data, error } = await this.client.from("usage_records").select();
    if (error) throw error;
    return (data ?? []).map((row) => ({
      id: row.id,
      userId: row.user_id,
      analysisId: row.analysis_id,
      inputTokens: row.input_tokens,
      outputTokens: row.output_tokens,
      estimatedCost: row.estimated_cost,
      createdAt: row.created_at,
    }));
  }
}

export function createSupabaseStore(): DataStore {
  return new SupabaseStore();
}
