import { useState } from "react";
import { getTechnique } from "../data/techniques";
import type { AnalysisResult, Scenario } from "../types/session";
import { LEVEL_LABELS } from "../utils/labels";
import styles from "./FeedbackPanel.module.css";

interface Props {
  result: AnalysisResult;
  scenario: Scenario;
}

export function FeedbackPanel({ result, scenario }: Props) {
  const [showSample, setShowSample] = useState(false);
  const technique = getTechnique(scenario.hint);

  return (
    <div className={`${styles.panel} ${styles[result.level]}`}>
      <div className={styles.header}>
        <span className={styles.score}>{result.score}点</span>
        <span className={styles.level}>{LEVEL_LABELS[result.level]}</span>
      </div>

      {result.negativeHits.length > 0 && (
        <div className={styles.section}>
          <h4>気になった表現</h4>
          <ul>
            {result.negativeHits.map((hit, i) => (
              <li key={i}>{hit.note}</li>
            ))}
          </ul>
        </div>
      )}

      {result.positiveHits.length > 0 && (
        <div className={styles.section}>
          <h4>良かった点</h4>
          <ul>
            {result.positiveHits.map((hit, i) => (
              <li key={i}>{hit.note}</li>
            ))}
          </ul>
        </div>
      )}

      {result.advice.length > 0 && (
        <div className={styles.section}>
          <h4>アドバイス</h4>
          <ul>
            {result.advice.map((a, i) => (
              <li key={i}>{a}</li>
            ))}
          </ul>
        </div>
      )}

      {technique && (
        <div className={styles.technique}>
          <strong>おすすめのテクニック: {technique.title}</strong>
          <p>{technique.description}</p>
        </div>
      )}

      <button
        type="button"
        className={styles.sampleToggle}
        onClick={() => setShowSample((v) => !v)}
      >
        {showSample ? "模範回答を隠す" : "模範回答を見る"}
      </button>
      {showSample && <p className={styles.sample}>{scenario.sampleResponse}</p>}
    </div>
  );
}
