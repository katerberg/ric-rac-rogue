import {Board} from './classes/Board';

export type Coordinate = `${number},${number}`;
export type NumberCoordinates = {x: number; y: number};
export type Choice = 'x' | 'o';
export type SpaceStatusEffect = 'blocked' | 'forced';
export type Moves = Map<Coordinate, Choice | SpaceStatusEffect | undefined>;
export type SelectionTimes = Map<Coordinate, number>;

export enum RuleType {
  WIN_CON,
  FIRST_MOVE,
  TURN_ORDER,
}

export enum RuleWinType {
  X_IN_A_ROW,
}

export enum TurnOrderType {
  TAKE_TURNS,
  TWO_TO_ONE,
}

export type Rule = {
  type: RuleType;
  turnOrderType?: TurnOrderType;
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

export type Stats = {
  totalMoves: number;
  totalTies: number;
  totalWins: number;
  totalLosses: number;
  powerUpsActivated: number;
};

export type TerminalStatus = {
  isTerminal: boolean;
  isCat: boolean;
  isWinner: boolean;
  winner: Choice | null;
};
export enum MenuOption {
  CANCEL,
  END_RUN,
}

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
  FORCE_SPACE,
  BLOCKED_SPACE,
}

export enum StatusEffectType {
  EXTRA_TURN,
  FORCE_RANDOM,
  FORCE_SPACE,
  BLOCKED_SPACE,
}

/* eslint-disable-next-line @typescript-eslint/ban-types */
export function randomEnum<T extends Object>(anEnum: T): T[keyof T] {
  const enumValues = Object.keys(anEnum) as Array<keyof T>;
  const randomIndex = Math.floor(Math.floor(enumValues.length / 2) + Math.random() * Math.floor(enumValues.length / 2));
  const randomEnumKey = enumValues[randomIndex];
  return anEnum[randomEnumKey];
}
