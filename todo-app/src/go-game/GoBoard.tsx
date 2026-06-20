import { useState } from 'react';
import type { Board, Position, StoneColor } from './types';
import { BOARD_SIZE } from './gameLogic';
import styles from './GoBoard.module.css';

const CELL = 44;
const PAD = 22;
const SVG_SIZE = (BOARD_SIZE - 1) * CELL + 2 * PAD;

const STAR_POINTS: Position[] = [
  { row: 2, col: 2 },
  { row: 2, col: 6 },
  { row: 4, col: 4 },
  { row: 6, col: 2 },
  { row: 6, col: 6 },
];

function px(row: number, col: number): { x: number; y: number } {
  return { x: PAD + col * CELL, y: PAD + row * CELL };
}

interface GoBoardProps {
  board: Board;
  currentPlayer: StoneColor;
  lastMove: Position | null;
  onMove: (pos: Position) => void;
  disabled?: boolean;
  highlights?: Position[];
}

export function GoBoard({
  board,
  currentPlayer,
  lastMove,
  onMove,
  disabled = false,
  highlights = [],
}: GoBoardProps) {
  const [hover, setHover] = useState<Position | null>(null);

  const isStarPoint = (r: number, c: number) =>
    STAR_POINTS.some(s => s.row === r && s.col === c);

  function handleClick(r: number, c: number) {
    if (disabled || board[r][c] !== null) return;
    onMove({ row: r, col: c });
  }

  return (
    <div className={styles.wrapper}>
      <svg
        width={SVG_SIZE}
        height={SVG_SIZE}
        viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
        className={styles.svg}
      >
        <defs>
          <radialGradient id="blackStone" cx="38%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#777" />
            <stop offset="100%" stopColor="#111" />
          </radialGradient>
          <radialGradient id="whiteStone" cx="38%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#cccccc" />
          </radialGradient>
          <filter id="stoneShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="1" dy="1.5" stdDeviation="1.5" floodOpacity="0.35" />
          </filter>
          <filter id="boardShadow">
            <feDropShadow dx="0" dy="2" stdDeviation="4" floodOpacity="0.2" />
          </filter>
        </defs>

        {/* Board background */}
        <rect
          width={SVG_SIZE}
          height={SVG_SIZE}
          rx="6"
          fill="#D4A843"
          filter="url(#boardShadow)"
        />
        {/* Wood grain overlay */}
        <rect width={SVG_SIZE} height={SVG_SIZE} rx="6" fill="url(#woodGrain)" opacity="0.15" />

        {/* Grid lines */}
        {Array.from({ length: BOARD_SIZE }).map((_, i) => {
          const { x } = px(0, i);
          const { y } = px(i, 0);
          return (
            <g key={i}>
              <line x1={x} y1={PAD} x2={x} y2={SVG_SIZE - PAD} stroke="#6B4A1E" strokeWidth="0.8" />
              <line x1={PAD} y1={y} x2={SVG_SIZE - PAD} y2={y} stroke="#6B4A1E" strokeWidth="0.8" />
            </g>
          );
        })}

        {/* Board border (thicker outer lines) */}
        <rect
          x={PAD}
          y={PAD}
          width={(BOARD_SIZE - 1) * CELL}
          height={(BOARD_SIZE - 1) * CELL}
          fill="none"
          stroke="#5A3A10"
          strokeWidth="1.5"
        />

        {/* Star points */}
        {STAR_POINTS.map(({ row, col }) => {
          const { x, y } = px(row, col);
          return <circle key={`star-${row}-${col}`} cx={x} cy={y} r={3.5} fill="#5A3A10" />;
        })}

        {/* Highlights */}
        {highlights.map(({ row, col }) => {
          const { x, y } = px(row, col);
          return (
            <rect
              key={`hl-${row}-${col}`}
              x={x - CELL / 2}
              y={y - CELL / 2}
              width={CELL}
              height={CELL}
              fill={isStarPoint(row, col) ? 'rgba(255,200,30,0.45)' : 'rgba(255,200,30,0.35)'}
              rx="3"
            />
          );
        })}

        {/* Hover ghost stone */}
        {hover && !disabled && board[hover.row][hover.col] === null && (
          (() => {
            const { x, y } = px(hover.row, hover.col);
            const r = CELL * 0.44;
            return (
              <circle
                cx={x}
                cy={y}
                r={r}
                fill={
                  currentPlayer === 'black'
                    ? 'rgba(0,0,0,0.38)'
                    : 'rgba(255,255,255,0.65)'
                }
                stroke={currentPlayer === 'black' ? '#000' : '#aaa'}
                strokeWidth="0.8"
                pointerEvents="none"
              />
            );
          })()
        )}

        {/* Stones */}
        {Array.from({ length: BOARD_SIZE }).flatMap((_, row) =>
          Array.from({ length: BOARD_SIZE }).map((_, col) => {
            const stone = board[row][col];
            if (!stone) return null;
            const { x, y } = px(row, col);
            const r = CELL * 0.44;
            const isLast = lastMove?.row === row && lastMove?.col === col;
            return (
              <g key={`stone-${row}-${col}`} filter="url(#stoneShadow)">
                <circle
                  cx={x}
                  cy={y}
                  r={r}
                  fill={stone === 'black' ? 'url(#blackStone)' : 'url(#whiteStone)'}
                  stroke={stone === 'white' ? '#bbb' : 'none'}
                  strokeWidth="0.5"
                />
                {isLast && (
                  <circle
                    cx={x}
                    cy={y}
                    r={r * 0.32}
                    fill={stone === 'black' ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.4)'}
                    pointerEvents="none"
                  />
                )}
              </g>
            );
          })
        )}

        {/* Coordinate labels */}
        {Array.from({ length: BOARD_SIZE }).map((_, i) => {
          const letter = String.fromCharCode(65 + i); // A-I
          const num = BOARD_SIZE - i;
          const { x } = px(0, i);
          const { y } = px(i, 0);
          return (
            <g key={`coord-${i}`} fontSize="9" fill="#7A5C2A" fontFamily="monospace">
              <text x={x} y={PAD - 8} textAnchor="middle">{letter}</text>
              <text x={PAD - 9} y={y + 3} textAnchor="middle">{num}</text>
            </g>
          );
        })}

        {/* Click areas */}
        {Array.from({ length: BOARD_SIZE }).flatMap((_, row) =>
          Array.from({ length: BOARD_SIZE }).map((_, col) => {
            const { x, y } = px(row, col);
            const empty = board[row][col] === null;
            return (
              <rect
                key={`click-${row}-${col}`}
                x={x - CELL / 2}
                y={y - CELL / 2}
                width={CELL}
                height={CELL}
                fill="transparent"
                style={{ cursor: (!disabled && empty) ? 'pointer' : 'default' }}
                onClick={() => handleClick(row, col)}
                onMouseEnter={() => { if (!disabled && empty) setHover({ row, col }); }}
                onMouseLeave={() => setHover(null)}
              />
            );
          })
        )}
      </svg>
    </div>
  );
}
