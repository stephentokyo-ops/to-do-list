import { BreathTimer } from "./components/BreathTimer";
import { CategoryFilter } from "./components/CategoryFilter";
import { FeedbackPanel } from "./components/FeedbackPanel";
import { HistoryPanel } from "./components/HistoryPanel";
import { ResponseForm } from "./components/ResponseForm";
import { ScenarioCard } from "./components/ScenarioCard";
import { TechniqueGuide } from "./components/TechniqueGuide";
import { useTrainer } from "./hooks/useTrainer";
import styles from "./App.module.css";

function App() {
  const {
    scenario,
    categoryFilter,
    setCategoryFilter,
    result,
    submitResponse,
    nextScenario,
    history,
    streak,
    averageScore,
  } = useTrainer();

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>冷静レスポンス・トレーニング</h1>
        <p className={styles.subtitle}>
          煽られたり、責められたりする場面を疑似体験しながら、切り返す前に一呼吸置いて
          冷静な返答を選ぶ練習をするアプリです。
        </p>
      </header>

      <div className={styles.layout}>
        <main className={styles.main}>
          <CategoryFilter value={categoryFilter} onChange={setCategoryFilter} />
          <ScenarioCard scenario={scenario} />
          <BreathTimer />
          <ResponseForm key={scenario.id} onSubmit={submitResponse} disabled={!!result} />

          {result && (
            <>
              <FeedbackPanel result={result} scenario={scenario} />
              <button type="button" className={styles.nextButton} onClick={nextScenario}>
                次のシナリオへ
              </button>
            </>
          )}
        </main>

        <aside className={styles.sidebar}>
          <HistoryPanel history={history} streak={streak} averageScore={averageScore} />
          <TechniqueGuide />
        </aside>
      </div>
    </div>
  );
}

export default App;
