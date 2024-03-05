import {Moves, NumberCoordinates} from '../types';

type BoardProps = {
  columns: number;
  rows: number;
  selections: Moves;
};

export class Board {
  columns: number;

  rows: number;

  selections: Moves;

  constructor({columns, rows, selections}: BoardProps) {
    this.columns = columns;
    this.rows = rows;
    this.selections = selections;
  }

  getAvailableMoves(): NumberCoordinates[] {
    const moves: NumberCoordinates[] = [];
    for (let x = 0; x < this.columns; x++) {
      for (let y = 0; y < this.rows; y++) {
        if (this.selections.get(`${x},${y}`) === undefined) {
          moves.push({x, y});
        }
      }
    }
    return moves;
  }
}
