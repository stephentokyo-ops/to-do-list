import type { Board, Position, StoneColor, GameState } from './types';

export const BOARD_SIZE = 9;

export function createEmptyBoard(): Board {
  return Array(BOARD_SIZE)
    .fill(null)
    .map(() => Array(BOARD_SIZE).fill(null));
}

export function createInitialGameState(): GameState {
  return {
    board: createEmptyBoard(),
    currentPlayer: 'black',
    capturedByBlack: 0,
    capturedByWhite: 0,
    boardHistory: [],
    lastMove: null,
    consecutivePasses: 0,
    moveCount: 0,
  };
}

export function isInBounds(row: number, col: number): boolean {
  return row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE;
}

export function getNeighbors(pos: Position): Position[] {
  return [
    { row: pos.row - 1, col: pos.col },
    { row: pos.row + 1, col: pos.col },
    { row: pos.row, col: pos.col - 1 },
    { row: pos.row, col: pos.col + 1 },
  ].filter(p => isInBounds(p.row, p.col));
}

export function getGroup(board: Board, pos: Position): Position[] {
  const color = board[pos.row][pos.col];
  if (!color) return [];

  const group: Position[] = [];
  const visited = new Set<string>();
  const queue: Position[] = [pos];

  while (queue.length > 0) {
    const curr = queue.shift()!;
    const key = `${curr.row},${curr.col}`;
    if (visited.has(key)) continue;
    visited.add(key);

    if (board[curr.row][curr.col] === color) {
      group.push(curr);
      for (const n of getNeighbors(curr)) {
        if (!visited.has(`${n.row},${n.col}`)) queue.push(n);
      }
    }
  }
  return group;
}

export function getGroupLiberties(board: Board, group: Position[]): Position[] {
  const liberties: Position[] = [];
  const seen = new Set<string>();

  for (const stone of group) {
    for (const n of getNeighbors(stone)) {
      const key = `${n.row},${n.col}`;
      if (!seen.has(key) && board[n.row][n.col] === null) {
        liberties.push(n);
        seen.add(key);
      }
    }
  }
  return liberties;
}

export function getLibertyCount(board: Board, pos: Position): number {
  const group = getGroup(board, pos);
  return getGroupLiberties(board, group).length;
}

export function isAtari(board: Board, pos: Position): boolean {
  if (!board[pos.row][pos.col]) return false;
  return getLibertyCount(board, pos) === 1;
}

export interface PlaceMoveResult {
  success: boolean;
  newState: GameState;
  captured: Position[];
  error?: string;
}

export function placeStone(state: GameState, pos: Position): PlaceMoveResult {
  const { board, currentPlayer, boardHistory } = state;

  if (board[pos.row][pos.col] !== null) {
    return { success: false, newState: state, captured: [], error: 'すでに石が置かれています' };
  }

  const opponent: StoneColor = currentPlayer === 'black' ? 'white' : 'black';
  const newBoard: Board = board.map(row => [...row]);
  newBoard[pos.row][pos.col] = currentPlayer;

  const captured: Position[] = [];
  for (const n of getNeighbors(pos)) {
    if (newBoard[n.row][n.col] === opponent) {
      const group = getGroup(newBoard, n);
      const libs = getGroupLiberties(newBoard, group);
      if (libs.length === 0) {
        captured.push(...group);
        for (const stone of group) newBoard[stone.row][stone.col] = null;
      }
    }
  }

  // Suicide check
  const ownGroup = getGroup(newBoard, pos);
  const ownLibs = getGroupLiberties(newBoard, ownGroup);
  if (ownLibs.length === 0) {
    return {
      success: false,
      newState: state,
      captured: [],
      error: '自殺手は禁止です。石を置いた直後に取られる場所には打てません。',
    };
  }

  // Ko check
  const newBoardStr = JSON.stringify(newBoard);
  if (boardHistory.includes(newBoardStr)) {
    return {
      success: false,
      newState: state,
      captured: [],
      error: 'コウの規則：同じ局面に戻す手は打てません。',
    };
  }

  const newState: GameState = {
    board: newBoard,
    currentPlayer: opponent,
    capturedByBlack: state.capturedByBlack + (currentPlayer === 'black' ? captured.length : 0),
    capturedByWhite: state.capturedByWhite + (currentPlayer === 'white' ? captured.length : 0),
    boardHistory: [...boardHistory, JSON.stringify(board)],
    lastMove: pos,
    consecutivePasses: 0,
    moveCount: state.moveCount + 1,
  };

  return { success: true, newState, captured };
}

export function passMove(state: GameState): GameState {
  return {
    ...state,
    currentPlayer: state.currentPlayer === 'black' ? 'white' : 'black',
    consecutivePasses: state.consecutivePasses + 1,
    lastMove: null,
    moveCount: state.moveCount + 1,
  };
}

export function calculateTerritory(board: Board): { black: number; white: number } {
  const visited = new Set<string>();
  let blackTerritory = 0;
  let whiteTerritory = 0;

  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (board[r][c] !== null || visited.has(`${r},${c}`)) continue;

      const region: Position[] = [];
      const borders = new Set<StoneColor>();
      const regionVisited = new Set<string>();
      const queue: Position[] = [{ row: r, col: c }];

      while (queue.length > 0) {
        const curr = queue.shift()!;
        const key = `${curr.row},${curr.col}`;
        if (regionVisited.has(key)) continue;
        regionVisited.add(key);

        if (board[curr.row][curr.col] === null) {
          region.push(curr);
          visited.add(key);
          for (const n of getNeighbors(curr)) {
            const nkey = `${n.row},${n.col}`;
            if (!regionVisited.has(nkey)) {
              if (board[n.row][n.col] === null) queue.push(n);
              else borders.add(board[n.row][n.col] as StoneColor);
            }
          }
        }
      }

      if (borders.size === 1) {
        const owner = [...borders][0];
        if (owner === 'black') blackTerritory += region.length;
        else whiteTerritory += region.length;
      }
    }
  }

  return { black: blackTerritory, white: whiteTerritory };
}

export function boardFromSetup(
  setup: Array<{ row: number; col: number; color: StoneColor }>
): Board {
  const board = createEmptyBoard();
  for (const { row, col, color } of setup) {
    board[row][col] = color;
  }
  return board;
}
