import type { Scenario } from "../types/session";
import { CATEGORY_LABELS } from "../utils/labels";
import styles from "./ScenarioCard.module.css";

interface Props {
  scenario: Scenario;
}

const DIFFICULTY_LABEL = ["易", "中", "難"];

export function ScenarioCard({ scenario }: Props) {
  return (
    <div className={styles.card}>
      <div className={styles.meta}>
        <span className={styles.badge}>{CATEGORY_LABELS[scenario.category]}</span>
        <span className={styles.difficulty}>
          難易度: {DIFFICULTY_LABEL[scenario.difficulty - 1]}
        </span>
      </div>
      <p className={styles.context}>{scenario.context}</p>
      <p className={styles.line}>「{scenario.line}」</p>
    </div>
  );
}
