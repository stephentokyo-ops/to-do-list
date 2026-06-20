export type StoneColor = 'black' | 'white';
export type Board = (StoneColor | null)[][];

export interface Position {
  row: number;
  col: number;
}

export interface GameState {
  board: Board;
  currentPlayer: StoneColor;
  capturedByBlack: number;
  capturedByWhite: number;
  boardHistory: string[];
  lastMove: Position | null;
  consecutivePasses: number;
  moveCount: number;
}

export type AppMode = 'home' | 'lesson' | 'freeplay';

export type TaskType = 'none' | 'any' | 'target' | 'capture';

export interface LessonStep {
  id: string;
  title: string;
  description: string;
  boardSetup: Array<{ row: number; col: number; color: StoneColor }>;
  locked: boolean;
  taskType: TaskType;
  targetPositions?: Position[];
  highlights?: Position[];
  successMessage: string;
  currentPlayerOverride?: StoneColor;
}

export interface LessonData {
  id: string;
  title: string;
  emoji: string;
  tagline: string;
  steps: LessonStep[];
}

export interface Commentary {
  text: string;
  type: 'info' | 'good' | 'warning' | 'tip';
}
