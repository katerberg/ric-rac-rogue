import {Board} from './classes/Board';

export type Coordinate = `${number},${number}`;
export type NumberCoordinates = {x: number; y: number};
export type Choice = 'x' | 'o';
export type Moves = Map<Coordinate, Choice | undefined>;

export enum RuleType {
  WIN_CON,
  FIRST_MOVE,
  TURN_ORDER,
}
export enum RuleWinType {
  X_IN_A_ROW,
}

export type Rule = {
  type: RuleType;
  winType?: RuleWinType;
  firstPlayer?: Choice;
  xInARow?: number;
};
export type State = {
  board: Board;
  requiredWin: number;
  currentPlayer: Choice;
  maxDepth: number;
};
export type TerminalStatus = {
  isTerminal: boolean;
  isCat: boolean;
  isWinner: boolean;
  winner: Choice | null;
};

export enum PowerUpType {
  EXTRA_TURN,
  FLIP_TILE,
  RESET_COOLDOWN,
  COPY_COLUMN,
  COPY_ROW,
  REMOVE_COLUMN,
  REMOVE_ROW,
  INCREASE_ENERGY,
  INCREASE_MAX_ENERGY,
  INCREASE_REQUIRED_WIN,
  DECREASE_REQUIRED_WIN,
  TELEPORT_RANDOM,
  FORCE_RANDOM,
}

export enum StatusEffectType {
  EXTRA_TURN,
  FORCE_RANDOM,
}
