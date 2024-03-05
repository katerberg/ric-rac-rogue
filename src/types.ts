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
  columns: number;
  rows: number;
  selections: Moves;
  requiredWin: number;
  currentPlayer: Choice;
  maxDepth: number;
  room: Room;
};
