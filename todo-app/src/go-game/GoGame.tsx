import { useState, useCallback, useEffect, useRef } from 'react';
import type { AppMode, Commentary, GameState, Position } from './types';
import { LESSONS } from './lessons';
import { GoBoard } from './GoBoard';
import {
  createInitialGameState,
  boardFromSetup,
  placeStone,
  passMove,
  calculateTerritory,
} from './gameLogic';
import { getAIMove } from './ai';
import { generateCommentary } from './commentary';
import styles from './GoGame.module.css';

// ─── Home Screen ──────────────────────────────────────────────────────────────

function HomeScreen({ onStart }: { onStart: (mode: AppMode) => void }) {
  return (
    <div className={styles.home}>
      <div className={styles.homeHero}>
        <div className={styles.homeStones}>
          <div className={styles.stoneBlack} />
          <div className={styles.stoneWhite} />
        </div>
        <h1 className={styles.homeTitle}>囲碁で遊ぼう</h1>
        <p className={styles.homeSubtitle}>
          世界最古のボードゲームを、ゼロから楽しく学べます
        </p>
      </div>

      <div className={styles.homeCards}>
        <button className={`${styles.homeCard} ${styles.cardLesson}`} onClick={() => onStart('lesson')}>
          <span className={styles.cardEmoji}>📖</span>
          <div className={styles.cardContent}>
            <h2>レッスンで学ぶ</h2>
            <p>ルールを知らなくても大丈夫！ステップバイステップで囲碁の基本を学べます。</p>
          </div>
          <span className={styles.cardArrow}>→</span>
        </button>

        <button className={`${styles.homeCard} ${styles.cardPlay}`} onClick={() => onStart('freeplay')}>
          <span className={styles.cardEmoji}>🎮</span>
          <div className={styles.cardContent}>
            <h2>AIと対戦する</h2>
            <p>AIと対局しながら、毎手に解説つき。打った手の意味がわかります。</p>
          </div>
          <span className={styles.cardArrow}>→</span>
        </button>
      </div>

      <div className={styles.homeInfo}>
        <div className={styles.infoBadge}>🌏 約4000年の歴史</div>
        <div className={styles.infoBadge}>9路盤で入門</div>
        <div className={styles.infoBadge}>毎手に解説つき</div>
      </div>
    </div>
  );
}

// ─── Lesson Mode ─────────────────────────────────────────────────────────────

function LessonMode({ onBack }: { onBack: () => void }) {
  const [lessonIdx, setLessonIdx] = useState(0);
  const [stepIdx, setStepIdx] = useState(0);
  const [gameState, setGameState] = useState<GameState>(createInitialGameState());
  const [feedback, setFeedback] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const lesson = LESSONS[lessonIdx];
  const step = lesson.steps[stepIdx];

  // Reset board when step changes
  useEffect(() => {
    const base = createInitialGameState();
    const board = boardFromSetup(step.boardSetup);
    setGameState({
      ...base,
      board,
      currentPlayer: step.currentPlayerOverride ?? 'black',
    });
    setFeedback(null);
    setShowSuccess(false);
  }, [lessonIdx, stepIdx]);

  function handleMove(pos: Position) {
    if (step.locked) return;

    if (step.taskType === 'target') {
      const allowed = step.targetPositions ?? [];
      if (!allowed.some(p => p.row === pos.row && p.col === pos.col)) {
        setFeedback('ヒント：ハイライトされた場所に打ちましょう！');
        return;
      }
    }

    const result = placeStone(gameState, pos);
    if (!result.success) {
      setFeedback(result.error ?? '打てない場所です');
      return;
    }

    if (step.taskType === 'capture' && result.captured.length === 0) {
      setFeedback('石を取る練習です。相手のダメ（空点）を全て塞ぐ場所に打ちましょう！');
      return;
    }

    setGameState(result.newState);
    setFeedback(null);
    setShowSuccess(true);
  }

  function advance() {
    setShowSuccess(false);
    if (stepIdx + 1 < lesson.steps.length) {
      setStepIdx(s => s + 1);
    } else if (lessonIdx + 1 < LESSONS.length) {
      setLessonIdx(l => l + 1);
      setStepIdx(0);
    }
  }

  const isLastStep = stepIdx === lesson.steps.length - 1 && lessonIdx === LESSONS.length - 1;
  const totalSteps = lesson.steps.length;

  return (
    <div className={styles.lessonLayout}>
      {/* Sidebar */}
      <aside className={styles.lessonSidebar}>
        <button className={styles.backBtn} onClick={onBack}>← ホームへ</button>
        <div className={styles.lessonList}>
          {LESSONS.map((l, idx) => (
            <button
              key={l.id}
              className={`${styles.lessonItem} ${idx === lessonIdx ? styles.lessonItemActive : ''} ${idx < lessonIdx ? styles.lessonItemDone : ''}`}
              onClick={() => { setLessonIdx(idx); setStepIdx(0); }}
            >
              <span className={styles.lessonItemEmoji}>{l.emoji}</span>
              <span className={styles.lessonItemTitle}>{l.title}</span>
              {idx < lessonIdx && <span className={styles.doneCheck}>✓</span>}
            </button>
          ))}
        </div>
      </aside>

      {/* Main area */}
      <main className={styles.lessonMain}>
        <div className={styles.lessonHeader}>
          <span className={styles.lessonEmoji}>{lesson.emoji}</span>
          <div>
            <h2 className={styles.lessonTitle}>{lesson.title}</h2>
            <p className={styles.lessonTagline}>{lesson.tagline}</p>
          </div>
        </div>

        <div className={styles.stepProgress}>
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`${styles.stepDot} ${i < stepIdx ? styles.stepDone : ''} ${i === stepIdx ? styles.stepCurrent : ''}`}
            />
          ))}
          <span className={styles.stepLabel}>{stepIdx + 1} / {totalSteps}</span>
        </div>

        <div className={styles.lessonContent}>
          <div className={styles.instructionPanel}>
            <h3 className={styles.stepTitle}>{step.title}</h3>
            <div className={styles.stepDescription}>
              {step.description.split('\n').map((line, i) => {
                if (line === '') return <br key={i} />;
                // Bold **text**
                const parts = line.split(/(\*\*[^*]+\*\*)/g);
                return (
                  <p key={i}>
                    {parts.map((part, j) => {
                      if (part.startsWith('**') && part.endsWith('**')) {
                        return <strong key={j}>{part.slice(2, -2)}</strong>;
                      }
                      return part;
                    })}
                  </p>
                );
              })}
            </div>

            {feedback && (
              <div className={styles.feedbackBox}>
                💡 {feedback}
              </div>
            )}

            {showSuccess && step.successMessage && (
              <div className={styles.successBox}>
                <span className={styles.successIcon}>🎉</span>
                <p>{step.successMessage}</p>
                <button className={styles.nextBtn} onClick={advance}>
                  {isLastStep ? '完了！AIと対戦してみよう' : '次へ →'}
                </button>
              </div>
            )}

            {(step.taskType === 'none' || step.locked) && !showSuccess && (
              <button className={styles.nextBtn} onClick={advance}>
                次へ →
              </button>
            )}
          </div>

          <div className={styles.boardArea}>
            <GoBoard
              board={gameState.board}
              currentPlayer={gameState.currentPlayer}
              lastMove={gameState.lastMove}
              onMove={handleMove}
              disabled={step.locked || showSuccess}
              highlights={step.highlights}
            />
            {!step.locked && !showSuccess && (
              <p className={styles.turnIndicator}>
                <span className={gameState.currentPlayer === 'black' ? styles.blackStoneSmall : styles.whiteStoneSmall} />
                {gameState.currentPlayer === 'black' ? '黒番（あなた）' : '白番'}
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

// ─── Free Play Mode ───────────────────────────────────────────────────────────

type GamePhase = 'playing' | 'finished';

interface FreePlayState {
  game: GameState;
  phase: GamePhase;
  commentaries: Commentary[];
  territory: { black: number; white: number } | null;
  isAIThinking: boolean;
}

function FreePlayMode({ onBack }: { onBack: () => void }) {
  const [state, setState] = useState<FreePlayState>({
    game: createInitialGameState(),
    phase: 'playing',
    commentaries: [
      {
        text: '対局を始めましょう！あなたは黒番です。囲碁は黒が先手です。序盤は隅（すみ）から打つのが基本です。盤の交叉点をクリックして石を置いてください。',
        type: 'info',
      },
    ],
    territory: null,
    isAIThinking: false,
  });

  const commentaryEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    commentaryEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [state.commentaries]);

  const addCommentary = useCallback((c: Commentary) => {
    setState(prev => ({
      ...prev,
      commentaries: [...prev.commentaries.slice(-15), c],
    }));
  }, []);

  function handlePlayerMove(pos: Position) {
    if (state.phase !== 'playing' || state.isAIThinking) return;
    if (state.game.currentPlayer !== 'black') return;

    const result = placeStone(state.game, pos);
    if (!result.success) {
      addCommentary({ text: `⚠️ ${result.error}`, type: 'warning' });
      return;
    }

    const commentary = generateCommentary(
      state.game,
      result.newState.board,
      pos,
      result.captured,
      true
    );

    const newGame = result.newState;
    setState(prev => ({
      ...prev,
      game: newGame,
      commentaries: [...prev.commentaries.slice(-15), commentary],
      isAIThinking: true,
    }));

    // AI moves after delay
    setTimeout(() => {
      const aiMove = getAIMove(newGame);
      if (!aiMove) {
        // AI passes
        const passed = passMove(newGame);
        const passedAgain = passed.consecutivePasses >= 2;
        if (passedAgain) {
          const territory = calculateTerritory(passed.board);
          setState(prev => ({
            ...prev,
            game: passed,
            phase: 'finished',
            territory,
            isAIThinking: false,
            commentaries: [...prev.commentaries.slice(-15), {
              text: '両者がパスしたので対局終了です。陣地を数えましょう！',
              type: 'info',
            }],
          }));
        } else {
          setState(prev => ({
            ...prev,
            game: passed,
            isAIThinking: false,
            commentaries: [...prev.commentaries.slice(-15), {
              text: 'AIがパスしました。あなたも打てる場所がなければパスしてください。',
              type: 'info',
            }],
          }));
        }
        return;
      }

      const aiResult = placeStone(newGame, aiMove);
      if (!aiResult.success) {
        setState(prev => ({ ...prev, isAIThinking: false }));
        return;
      }

      const aiCommentary = generateCommentary(
        newGame,
        aiResult.newState.board,
        aiMove,
        aiResult.captured,
        false
      );

      setState(prev => ({
        ...prev,
        game: aiResult.newState,
        commentaries: [...prev.commentaries.slice(-15), aiCommentary],
        isAIThinking: false,
      }));
    }, 700);
  }

  function handlePass() {
    if (state.phase !== 'playing' || state.isAIThinking) return;
    const passed = passMove(state.game);
    if (passed.consecutivePasses >= 2) {
      const territory = calculateTerritory(passed.board);
      setState(prev => ({
        ...prev,
        game: passed,
        phase: 'finished',
        territory,
        commentaries: [...prev.commentaries.slice(-15), {
          text: '両者パスで対局終了！陣地を計算しました。',
          type: 'info',
        }],
      }));
    } else {
      setState(prev => ({
        ...prev,
        game: passed,
        isAIThinking: true,
        commentaries: [...prev.commentaries.slice(-15), {
          text: 'パスしました。AIが考えています…',
          type: 'info',
        }],
      }));

      setTimeout(() => {
        const aiMove = getAIMove(passed);
        if (!aiMove) {
          const passedAgain = passMove(passed);
          const territory = calculateTerritory(passedAgain.board);
          setState(prev => ({
            ...prev,
            game: passedAgain,
            phase: 'finished',
            territory,
            isAIThinking: false,
            commentaries: [...prev.commentaries.slice(-15), {
              text: 'AIもパスしました。対局終了です！',
              type: 'info',
            }],
          }));
        } else {
          const aiResult = placeStone(passed, aiMove);
          if (!aiResult.success) {
            setState(prev => ({ ...prev, isAIThinking: false }));
            return;
          }
          const aiCommentary = generateCommentary(
            passed, aiResult.newState.board, aiMove, aiResult.captured, false
          );
          setState(prev => ({
            ...prev,
            game: aiResult.newState,
            commentaries: [...prev.commentaries.slice(-15), aiCommentary],
            isAIThinking: false,
          }));
        }
      }, 700);
    }
  }

  function handleRestart() {
    setState({
      game: createInitialGameState(),
      phase: 'playing',
      commentaries: [{
        text: '新しい対局を始めます！あなたは黒番です。序盤は隅に打つのが基本ですよ。',
        type: 'info',
      }],
      territory: null,
      isAIThinking: false,
    });
  }

  const { game, phase, commentaries, territory, isAIThinking } = state;
  const blackScore = game.capturedByBlack + (territory?.black ?? 0);
  const whiteScore = game.capturedByWhite + (territory?.white ?? 0);

  return (
    <div className={styles.freeplayLayout}>
      {/* Top bar */}
      <div className={styles.freeplayTopBar}>
        <button className={styles.backBtn} onClick={onBack}>← ホームへ</button>
        <h2 className={styles.freeplayTitle}>AIと対局</h2>
        <div className={styles.scoreRow}>
          <span className={styles.scoreBlack}>
            <span className={styles.stoneBlackTiny} /> 黒：{game.capturedByBlack}取
          </span>
          <span className={styles.scoreSep}>|</span>
          <span className={styles.scoreWhite}>
            <span className={styles.stoneWhiteTiny} /> 白：{game.capturedByWhite}取
          </span>
        </div>
      </div>

      <div className={styles.freeplayBody}>
        {/* Board column */}
        <div className={styles.freeplayBoardCol}>
          <GoBoard
            board={game.board}
            currentPlayer={game.currentPlayer}
            lastMove={game.lastMove}
            onMove={handlePlayerMove}
            disabled={phase !== 'playing' || game.currentPlayer !== 'black' || isAIThinking}
          />

          {phase === 'playing' && (
            <div className={styles.freeplayControls}>
              {isAIThinking ? (
                <div className={styles.thinkingIndicator}>
                  <span className={styles.thinkingDots} />
                  AIが考えています…
                </div>
              ) : (
                <>
                  <div className={styles.turnBadge}>
                    {game.currentPlayer === 'black' ? (
                      <><span className={styles.stoneBlackTiny} /> あなたの番（黒）</>
                    ) : (
                      <><span className={styles.stoneWhiteTiny} /> AIの番（白）</>
                    )}
                  </div>
                  {game.currentPlayer === 'black' && (
                    <button className={styles.passBtn} onClick={handlePass}>
                      パス
                    </button>
                  )}
                </>
              )}
            </div>
          )}

          {phase === 'finished' && territory && (
            <div className={styles.resultPanel}>
              <h3 className={styles.resultTitle}>対局終了！</h3>
              <div className={styles.resultScores}>
                <div className={styles.resultScore}>
                  <span className={styles.resultStoneBlack} />
                  <div>
                    <div className={styles.resultPlayerName}>あなた（黒）</div>
                    <div className={styles.resultScoreDetail}>
                      陣地 {territory.black} + 取り石 {game.capturedByBlack} = <strong>{blackScore}</strong>
                    </div>
                  </div>
                </div>
                <div className={styles.resultScore}>
                  <span className={styles.resultStoneWhite} />
                  <div>
                    <div className={styles.resultPlayerName}>AI（白）</div>
                    <div className={styles.resultScoreDetail}>
                      陣地 {territory.white} + 取り石 {game.capturedByWhite} = <strong>{whiteScore}</strong>
                    </div>
                  </div>
                </div>
              </div>
              <div className={styles.resultWinner}>
                {blackScore > whiteScore
                  ? '🎉 黒（あなた）の勝ち！'
                  : blackScore < whiteScore
                    ? '🤖 白（AI）の勝ち！'
                    : '🤝 引き分け！'}
              </div>
              <button className={styles.restartBtn} onClick={handleRestart}>
                もう一度対局する
              </button>
            </div>
          )}
        </div>

        {/* Commentary column */}
        <div className={styles.commentaryCol}>
          <h3 className={styles.commentaryTitle}>📝 解説</h3>
          <div className={styles.commentaryList}>
            {commentaries.map((c, i) => (
              <div
                key={i}
                className={`${styles.commentaryItem} ${styles[`commentary_${c.type}`]}`}
              >
                <span className={styles.commentaryIcon}>
                  {c.type === 'good' ? '✅' : c.type === 'warning' ? '⚠️' : c.type === 'tip' ? '💡' : 'ℹ️'}
                </span>
                <p>{c.text}</p>
              </div>
            ))}
            <div ref={commentaryEndRef} />
          </div>

          <div className={styles.gameInfoPanel}>
            <h4>📊 対局情報</h4>
            <div className={styles.gameInfoRow}>
              <span>手数</span><span>{game.moveCount}手</span>
            </div>
            <div className={styles.gameInfoRow}>
              <span>黒の取り石</span><span>{game.capturedByBlack}個</span>
            </div>
            <div className={styles.gameInfoRow}>
              <span>白の取り石</span><span>{game.capturedByWhite}個</span>
            </div>
          </div>

          <div className={styles.rulesQuickRef}>
            <h4>📖 クイックルール</h4>
            <ul>
              <li>交叉点に交互に石を置く</li>
              <li>ダメ（空点）が0になった石は取られる</li>
              <li>自殺手は禁止</li>
              <li>コウ（繰り返し）は禁止</li>
              <li>パスを2回連続で終局</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Root Component ───────────────────────────────────────────────────────────

export function GoGame() {
  const [mode, setMode] = useState<AppMode>('home');

  return (
    <div className={styles.root}>
      {mode === 'home' && <HomeScreen onStart={setMode} />}
      {mode === 'lesson' && <LessonMode onBack={() => setMode('home')} />}
      {mode === 'freeplay' && <FreePlayMode onBack={() => setMode('home')} />}
    </div>
  );
}

export default GoGame;
