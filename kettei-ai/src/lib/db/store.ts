import type {
  Analysis,
  DocumentRecord,
  ExportRecord,
  Profile,
  Project,
  UsageRecord,
} from "./types";

// データストアの抽象インターフェース。
// DemoStore（ローカルJSONファイル）と SupabaseStore（本番Postgres）の双方が実装する。
// 呼び出し側（Route Handler / Server Action）はこのインターフェースのみに依存する。
export interface DataStore {
  // profiles
  // id は呼び出し側が決定する（デモ: 生成したUUID / Supabase: auth.users.id）
  createProfile(input: Omit<Profile, "createdAt" | "updatedAt">): Promise<Profile>;
  getProfileById(id: string): Promise<Profile | null>;
  getProfileByEmail(email: string): Promise<Profile | null>;
  listProfiles(): Promise<Profile[]>;
  updateProfile(id: string, patch: Partial<Profile>): Promise<Profile>;
  deleteProfile(id: string): Promise<void>;

  // projects
  createProject(input: Omit<Project, "id" | "createdAt" | "updatedAt">): Promise<Project>;
  getProject(id: string): Promise<Project | null>;
  listProjectsByUser(userId: string): Promise<Project[]>;
  updateProject(id: string, patch: Partial<Project>): Promise<Project>;
  deleteProject(id: string): Promise<void>;

  // documents
  createDocument(input: Omit<DocumentRecord, "id" | "createdAt">): Promise<DocumentRecord>;
  listDocumentsByProject(projectId: string): Promise<DocumentRecord[]>;

  // analyses
  createAnalysis(input: Omit<Analysis, "id" | "createdAt" | "updatedAt">): Promise<Analysis>;
  getAnalysis(id: string): Promise<Analysis | null>;
  listAnalysesByProject(projectId: string): Promise<Analysis[]>;
  listAnalysesByUser(userId: string): Promise<Analysis[]>;
  updateAnalysis(id: string, patch: Partial<Analysis>): Promise<Analysis>;

  // exports
  createExport(input: Omit<ExportRecord, "id" | "createdAt">): Promise<ExportRecord>;

  // usage
  recordUsage(input: Omit<UsageRecord, "id" | "createdAt">): Promise<UsageRecord>;
  getMonthlyUsage(userId: string, yearMonth: string): Promise<{ projectCount: number; totalChars: number }>;
  listAllUsage(): Promise<UsageRecord[]>;
}
