import type { Attempt } from "../types/session";

const STORAGE_KEY = "calm-trainer-history";
const MAX_HISTORY = 50;

export function loadHistory(): Attempt[] {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export function saveHistory(history: Attempt[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(0, MAX_HISTORY)));
}
