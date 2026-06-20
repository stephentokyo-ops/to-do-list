import type { Board, Position, StoneColor, GameState } from './types';
import {
  BOARD_SIZE,
  getNeighbors,
  getGroup,
  getGroupLiberties,
  placeStone,
} from './gameLogic';

const STAR_POINT_OPENINGS: Position[] = [
  { row: 2, col: 2 },
  { row: 2, col: 6 },
  { row: 6, col: 2 },
  { row: 6, col: 6 },
  { row: 4, col: 2 },
  { row: 2, col: 4 },
  { row: 4, col: 6 },
  { row: 6, col: 4 },
  { row: 4, col: 4 },
];

function countGroupLiberties(board: Board, pos: Position): number {
  if (!board[pos.row][pos.col]) return 0;
  const group = getGroup(board, pos);
  return getGroupLiberties(board, group).length;
}

function scorePosition(state: GameState, pos: Position, color: StoneColor): number {
  const result = placeStone({ ...state, currentPlayer: color }, pos);
  if (!result.success) return -Infinity;

  const newBoard = result.newState.board;
  const opponent: StoneColor = color === 'black' ? 'white' : 'black';
  let score = 0;

  // Reward captures
  score += result.captured.length * 25;

  // Check if we create atari on opponent
  for (const n of getNeighbors(pos)) {
    if (newBoard[n.row][n.col] === opponent) {
      const libs = countGroupLiberties(newBoard, n);
      if (libs === 1) score += 18;
      else if (libs === 2) score += 6;
    }
  }

  // Protect own group under threat
  const prevBoard = state.board;
  for (const n of getNeighbors(pos)) {
    if (prevBoard[n.row][n.col] === color) {
      const prevLibs = countGroupLiberties(prevBoard, n);
      const newLibs = countGroupLiberties(newBoard, n);
      if (prevLibs <= 1 && newLibs > 1) score += 20; // saved from capture
      else if (newLibs > prevLibs) score += 3;
    }
  }

  // Positional value: corners and sides are good early
  const isCorner =
    (pos.row <= 2 || pos.row >= BOARD_SIZE - 3) &&
    (pos.col <= 2 || pos.col >= BOARD_SIZE - 3);
  const isSide =
    pos.row <= 1 ||
    pos.row >= BOARD_SIZE - 2 ||
    pos.col <= 1 ||
    pos.col >= BOARD_SIZE - 2;

  if (state.moveCount < 10) {
    if (isCorner) score += 10;
    else if (isSide) score += 5;
  }

  // Slight penalty for being adjacent to own stone (avoid clustering)
  let ownAdjacent = 0;
  for (const n of getNeighbors(pos)) {
    if (prevBoard[n.row][n.col] === color) ownAdjacent++;
  }
  if (ownAdjacent > 1) score -= ownAdjacent * 2;

  return score;
}

export function getAIMove(state: GameState): Position | null {
  const color = state.currentPlayer;
  const board = state.board;

  // Play opening moves on empty star points
  if (state.moveCount < 8) {
    for (const opening of STAR_POINT_OPENINGS) {
      if (board[opening.row][opening.col] === null) {
        const tooClose = getNeighbors(opening).some(
          n => board[n.row][n.col] !== null
        );
        if (!tooClose) {
          const result = placeStone({ ...state, currentPlayer: color }, opening);
          if (result.success) return opening;
        }
      }
    }
  }

  // Score all valid moves
  const candidates: { pos: Position; score: number }[] = [];

  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (board[r][c] !== null) continue;
      const pos = { row: r, col: c };
      const score = scorePosition(state, pos, color);
      if (score > -Infinity) candidates.push({ pos, score });
    }
  }

  if (candidates.length === 0) return null;

  candidates.sort((a, b) => b.score - a.score);

  // Weighted random from top 5
  const top = candidates.slice(0, Math.min(5, candidates.length));
  const weights = top.map((_, i) => top.length - i);
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  let rand = Math.random() * totalWeight;

  for (let i = 0; i < top.length; i++) {
    rand -= weights[i];
    if (rand <= 0) return top[i].pos;
  }

  return top[0].pos;
}
