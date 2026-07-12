import type { DataStore } from "./store";
import { demoStore } from "./demo-store";
import { createSupabaseStore } from "./supabase-store";

export * from "./store";
export * from "./types";

let cached: DataStore | null = null;

export function isDemoDb(): boolean {
  return !(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export function getStore(): DataStore {
  if (cached) return cached;
  cached = isDemoDb() ? demoStore : createSupabaseStore();
  return cached;
}
