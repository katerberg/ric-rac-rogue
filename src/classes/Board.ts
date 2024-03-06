import {numberCoordsToCoords} from '../coordinatesHelper';
import {Choice, Moves, NumberCoordinates} from '../types';

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

  isMoveOnBoard({x, y}: NumberCoordinates): boolean {
    return x > -1 && y > -1 && x < this.columns && y < this.rows;
  }

  isAvailableMove({x, y}: NumberCoordinates): boolean {
    return this.selections.get(`${x},${y}`) === undefined && this.isMoveOnBoard({x, y});
  }

  isTakenMove({x, y}: NumberCoordinates): boolean {
    return this.selections.get(`${x},${y}`) !== undefined && this.isMoveOnBoard({x, y});
  }

  flipTile({x, y}: NumberCoordinates): boolean {
    if (this.isTakenMove({x, y})) {
      const currentValue = this.selections.get(`${x},${y}`);
      this.selections.set(`${x},${y}`, currentValue === 'x' ? 'o' : 'x');
      return true;
    }
    return false;
  }

  setRandomMove(player: Choice): void {
    const availableMoves = this.getAvailableMoves();
    this.selections.set(
      numberCoordsToCoords(availableMoves[Math.floor(Math.random() * availableMoves.length)]),
      player,
    );
  }
}
