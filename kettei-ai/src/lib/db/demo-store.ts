import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";
import type { DataStore } from "./store";
import type {
  Analysis,
  DocumentRecord,
  ExportRecord,
  Profile,
  Project,
  UsageRecord,
} from "./types";

interface DbShape {
  profiles: Profile[];
  projects: Project[];
  documents: DocumentRecord[];
  analyses: Analysis[];
  exports: ExportRecord[];
  usage: UsageRecord[];
}

const DB_PATH = path.join(process.cwd(), ".data", "demo-db.json");

function emptyDb(): DbShape {
  return { profiles: [], projects: [], documents: [], analyses: [], exports: [], usage: [] };
}

// 初回起動時にデモ用のシードアカウントを作成する。
async function seedDemoProfiles(): Promise<Profile[]> {
  const now = new Date().toISOString();
  const adminEmail = process.env.DEMO_ADMIN_EMAIL || "admin@kettei-ai.example.com";
  const adminPassword = process.env.DEMO_ADMIN_PASSWORD || "admin12345";
  const userEmail = process.env.DEMO_USER_EMAIL || "demo@kettei-ai.example.com";
  const userPassword = process.env.DEMO_USER_PASSWORD || "demo12345";

  const [adminHash, userHash] = await Promise.all([
    bcrypt.hash(adminPassword, 10),
    bcrypt.hash(userPassword, 10),
  ]);

  return [
    {
      id: randomUUID(),
      email: adminEmail,
      passwordHash: adminHash,
      displayName: "管理者（デモ）",
      role: "admin",
      plan: "professional",
      monthlyLimit: null,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: randomUUID(),
      email: userEmail,
      passwordHash: userHash,
      displayName: "デモユーザー",
      role: "user",
      plan: "free",
      monthlyLimit: null,
      createdAt: now,
      updatedAt: now,
    },
  ];
}

// 開発・デモ用途のJSONファイルストア。Next.js dev serverは単一プロセスのため、
// 書き込みをキューに直列化することで簡易的な排他制御を行う。
// 本番運用ではSupabaseStore（未実装・要接続確認）へ切り替えること。
class DemoStore implements DataStore {
  private db: DbShape | null = null;
  private writeQueue: Promise<void> = Promise.resolve();

  private async load(): Promise<DbShape> {
    if (this.db) return this.db;
    try {
      const raw = await fs.readFile(DB_PATH, "utf-8");
      this.db = JSON.parse(raw) as DbShape;
    } catch {
      this.db = emptyDb();
      this.db.profiles = await seedDemoProfiles();
      await this.persist();
    }
    return this.db;
  }

  private async persist(): Promise<void> {
    await fs.mkdir(path.dirname(DB_PATH), { recursive: true });
    await fs.writeFile(DB_PATH, JSON.stringify(this.db, null, 2), "utf-8");
  }

  private async mutate<T>(fn: (db: DbShape) => T): Promise<T> {
    const db = await this.load();
    let result!: T;
    this.writeQueue = this.writeQueue.then(async () => {
      result = fn(db);
      await this.persist();
    });
    await this.writeQueue;
    return result;
  }

  async createProfile(input: Omit<Profile, "createdAt" | "updatedAt">): Promise<Profile> {
    const now = new Date().toISOString();
    const profile: Profile = { ...input, createdAt: now, updatedAt: now };
    return this.mutate((db) => {
      db.profiles.push(profile);
      return profile;
    });
  }

  async getProfileById(id: string): Promise<Profile | null> {
    const db = await this.load();
    return db.profiles.find((p) => p.id === id) ?? null;
  }

  async getProfileByEmail(email: string): Promise<Profile | null> {
    const db = await this.load();
    return db.profiles.find((p) => p.email.toLowerCase() === email.toLowerCase()) ?? null;
  }

  async listProfiles(): Promise<Profile[]> {
    const db = await this.load();
    return [...db.profiles];
  }

  async updateProfile(id: string, patch: Partial<Profile>): Promise<Profile> {
    return this.mutate((db) => {
      const idx = db.profiles.findIndex((p) => p.id === id);
      if (idx === -1) throw new Error("profile not found");
      db.profiles[idx] = { ...db.profiles[idx], ...patch, updatedAt: new Date().toISOString() };
      return db.profiles[idx];
    });
  }

  async deleteProfile(id: string): Promise<void> {
    await this.mutate((db) => {
      const projectIds = db.projects.filter((p) => p.userId === id).map((p) => p.id);
      db.profiles = db.profiles.filter((p) => p.id !== id);
      db.projects = db.projects.filter((p) => p.userId !== id);
      db.documents = db.documents.filter((d) => !projectIds.includes(d.projectId));
      db.analyses = db.analyses.filter((a) => a.userId !== id);
      db.exports = db.exports.filter((e) => e.userId !== id);
      db.usage = db.usage.filter((u) => u.userId !== id);
    });
  }

  async createProject(input: Omit<Project, "id" | "createdAt" | "updatedAt">): Promise<Project> {
    const now = new Date().toISOString();
    const project: Project = { ...input, id: randomUUID(), createdAt: now, updatedAt: now };
    return this.mutate((db) => {
      db.projects.push(project);
      return project;
    });
  }

  async getProject(id: string): Promise<Project | null> {
    const db = await this.load();
    return db.projects.find((p) => p.id === id) ?? null;
  }

  async listProjectsByUser(userId: string): Promise<Project[]> {
    const db = await this.load();
    return db.projects
      .filter((p) => p.userId === userId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async updateProject(id: string, patch: Partial<Project>): Promise<Project> {
    return this.mutate((db) => {
      const idx = db.projects.findIndex((p) => p.id === id);
      if (idx === -1) throw new Error("project not found");
      db.projects[idx] = { ...db.projects[idx], ...patch, updatedAt: new Date().toISOString() };
      return db.projects[idx];
    });
  }

  async deleteProject(id: string): Promise<void> {
    await this.mutate((db) => {
      db.projects = db.projects.filter((p) => p.id !== id);
      db.documents = db.documents.filter((d) => d.projectId !== id);
      db.analyses = db.analyses.filter((a) => a.projectId !== id);
    });
  }

  async createDocument(input: Omit<DocumentRecord, "id" | "createdAt">): Promise<DocumentRecord> {
    const doc: DocumentRecord = { ...input, id: randomUUID(), createdAt: new Date().toISOString() };
    return this.mutate((db) => {
      db.documents.push(doc);
      return doc;
    });
  }

  async listDocumentsByProject(projectId: string): Promise<DocumentRecord[]> {
    const db = await this.load();
    return db.documents.filter((d) => d.projectId === projectId);
  }

  async createAnalysis(input: Omit<Analysis, "id" | "createdAt" | "updatedAt">): Promise<Analysis> {
    const now = new Date().toISOString();
    const analysis: Analysis = { ...input, id: randomUUID(), createdAt: now, updatedAt: now };
    return this.mutate((db) => {
      db.analyses.push(analysis);
      return analysis;
    });
  }

  async getAnalysis(id: string): Promise<Analysis | null> {
    const db = await this.load();
    return db.analyses.find((a) => a.id === id) ?? null;
  }

  async listAnalysesByProject(projectId: string): Promise<Analysis[]> {
    const db = await this.load();
    return db.analyses
      .filter((a) => a.projectId === projectId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async listAnalysesByUser(userId: string): Promise<Analysis[]> {
    const db = await this.load();
    return db.analyses
      .filter((a) => a.userId === userId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async updateAnalysis(id: string, patch: Partial<Analysis>): Promise<Analysis> {
    return this.mutate((db) => {
      const idx = db.analyses.findIndex((a) => a.id === id);
      if (idx === -1) throw new Error("analysis not found");
      db.analyses[idx] = { ...db.analyses[idx], ...patch, updatedAt: new Date().toISOString() };
      return db.analyses[idx];
    });
  }

  async createExport(input: Omit<ExportRecord, "id" | "createdAt">): Promise<ExportRecord> {
    const record: ExportRecord = { ...input, id: randomUUID(), createdAt: new Date().toISOString() };
    return this.mutate((db) => {
      db.exports.push(record);
      return record;
    });
  }

  async recordUsage(input: Omit<UsageRecord, "id" | "createdAt">): Promise<UsageRecord> {
    const record: UsageRecord = { ...input, id: randomUUID(), createdAt: new Date().toISOString() };
    return this.mutate((db) => {
      db.usage.push(record);
      return record;
    });
  }

  async getMonthlyUsage(
    userId: string,
    yearMonth: string,
  ): Promise<{ projectCount: number; totalChars: number }> {
    const db = await this.load();
    const projectCount = db.projects.filter(
      (p) => p.userId === userId && p.createdAt.startsWith(yearMonth),
    ).length;
    const projectIds = new Set(
      db.projects.filter((p) => p.userId === userId && p.createdAt.startsWith(yearMonth)).map((p) => p.id),
    );
    let totalChars = 0;
    for (const doc of db.documents) {
      if (projectIds.has(doc.projectId)) totalChars += doc.extractedText.length;
    }
    for (const project of db.projects) {
      if (projectIds.has(project.id)) totalChars += project.inputText.length;
    }
    return { projectCount, totalChars };
  }

  async listAllUsage(): Promise<UsageRecord[]> {
    const db = await this.load();
    return [...db.usage];
  }
}

export const demoStore: DataStore = new DemoStore();
