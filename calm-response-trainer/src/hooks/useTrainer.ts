import { useEffect, useMemo, useState } from "react";
import { scenarios } from "../data/scenarios";
import type { AnalysisResult, Attempt, Category, Scenario } from "../types/session";
import { analyzeResponse } from "../utils/analyzer";
import { loadHistory, saveHistory } from "../utils/storage";

export type CategoryFilter = Category | "all";

function pickScenario(pool: Scenario[], excludeId?: string): Scenario {
  const candidates =
    pool.length > 1 ? pool.filter((s) => s.id !== excludeId) : pool;
  const list = candidates.length > 0 ? candidates : pool;
  return list[Math.floor(Math.random() * list.length)];
}

function poolFor(filter: CategoryFilter): Scenario[] {
  return filter === "all" ? scenarios : scenarios.filter((s) => s.category === filter);
}

export function useTrainer() {
  const [categoryFilter, setCategoryFilterState] = useState<CategoryFilter>("all");
  const pool = useMemo(() => poolFor(categoryFilter), [categoryFilter]);

  const [scenario, setScenario] = useState<Scenario>(() => pickScenario(scenarios));
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [history, setHistory] = useState<Attempt[]>(loadHistory);

  useEffect(() => {
    saveHistory(history);
  }, [history]);

  const setCategoryFilter = (filter: CategoryFilter) => {
    setCategoryFilterState(filter);
    setScenario((current) => {
      const nextPool = poolFor(filter);
      return nextPool.some((s) => s.id === current.id)
        ? current
        : pickScenario(nextPool);
    });
    setResult(null);
  };

  const submitResponse = (text: string) => {
    const analysis = analyzeResponse(text);
    setResult(analysis);
    const attempt: Attempt = {
      id: crypto.randomUUID(),
      scenarioId: scenario.id,
      response: text.trim(),
      score: analysis.score,
      level: analysis.level,
      createdAt: new Date().toISOString(),
    };
    setHistory((prev) => [attempt, ...prev]);
    return analysis;
  };

  const nextScenario = () => {
    setScenario((current) => pickScenario(pool, current.id));
    setResult(null);
  };

  const streak = useMemo(() => {
    let count = 0;
    for (const attempt of history) {
      if (attempt.level === "calm") {
        count += 1;
      } else {
        break;
      }
    }
    return count;
  }, [history]);

  const averageScore = useMemo(() => {
    if (history.length === 0) return null;
    const sum = history.reduce((acc, a) => acc + a.score, 0);
    return Math.round(sum / history.length);
  }, [history]);

  return {
    scenario,
    categoryFilter,
    setCategoryFilter,
    result,
    submitResponse,
    nextScenario,
    history,
    streak,
    averageScore,
  };
}
