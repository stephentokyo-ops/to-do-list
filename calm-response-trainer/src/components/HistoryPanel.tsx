import { scenarios } from "../data/scenarios";
import type { Attempt } from "../types/session";
import { LEVEL_LABELS } from "../utils/labels";
import styles from "./HistoryPanel.module.css";

interface Props {
  history: Attempt[];
  streak: number;
  averageScore: number | null;
}

function findLine(scenarioId: string): string {
  return scenarios.find((s) => s.id === scenarioId)?.line ?? "(削除されたシナリオ)";
}

export function HistoryPanel({ history, streak, averageScore }: Props) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.statValue}>{streak}</span>
          <span className={styles.statLabel}>連続冷静回答</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statValue}>{averageScore ?? "-"}</span>
          <span className={styles.statLabel}>平均スコア</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statValue}>{history.length}</span>
          <span className={styles.statLabel}>総練習回数</span>
        </div>
      </div>

      {history.length === 0 ? (
        <p className={styles.empty}>まだ練習記録がありません。</p>
      ) : (
        <ul className={styles.list}>
          {history.slice(0, 8).map((attempt) => (
            <li key={attempt.id} className={styles.item}>
              <div className={styles.itemLine}>{findLine(attempt.scenarioId)}</div>
              <div className={styles.itemMeta}>
                <span className={`${styles.badge} ${styles[attempt.level]}`}>
                  {attempt.score}点・{LEVEL_LABELS[attempt.level]}
                </span>
                <time>{new Date(attempt.createdAt).toLocaleString("ja-JP")}</time>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
