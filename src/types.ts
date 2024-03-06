import {Board} from './classes/Board';

export type Coordinate = `${number},${number}`;
export type NumberCoordinates = {x: number; y: number};
export type Choice = 'x' | 'o';
export type Moves = Map<Coordinate, Choice | undefined>;
export type Rule = {
  name: string;
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
  INCREASE_ENERGY,
}

export enum StatusEffectType {
  EXTRA_TURN,
}
