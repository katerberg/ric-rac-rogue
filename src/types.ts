import {Board} from './classes/Board';

export type Coordinate = `${number},${number}`;
export type NumberCoordinates = {x: number; y: number};
export type Choice = 'x' | 'o';
export type Moves = Map<Coordinate, Choice | undefined>;
export type Rule = {
  name: string;
};
export type Room = {
  rules: Rule[];
};
export type State = {
  board: Board;
  requiredWin: number;
  currentPlayer: Choice;
  maxDepth: number;
  room: Room;
};
