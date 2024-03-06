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

  copyRow(rowNumberToCopy: number): void {
    if (rowNumberToCopy > -1 && rowNumberToCopy < this.rows) {
      for (let y = this.rows - 1; y >= rowNumberToCopy; y--) {
        for (let x = 0; x < this.columns; x++) {
          const valueToCopy = this.selections.get(`${x},${y}`);
          if (valueToCopy !== undefined) {
            //Move previous selections
            this.selections.set(`${x},${y + 1}`, this.selections.get(`${x},${y}`));
          }
          if (y !== rowNumberToCopy) {
            this.selections.delete(`${x},${y}`);
          }
        }
      }
      this.rows++;
    }
  }

  copyColumn(columnNumberToCopy: number): void {
    if (columnNumberToCopy > -1 && columnNumberToCopy < this.columns) {
      for (let x = this.columns - 1; x >= columnNumberToCopy; x--) {
        for (let y = 0; y < this.rows; y++) {
          const valueToCopy = this.selections.get(`${x},${y}`);
          if (valueToCopy !== undefined) {
            //Move previous selections
            this.selections.set(`${x + 1},${y}`, this.selections.get(`${x},${y}`));
          }
          if (x !== columnNumberToCopy) {
            this.selections.delete(`${x},${y}`);
          }
        }
      }
      this.columns++;
    }
  }

  setRandomMove(player: Choice): void {
    const availableMoves = this.getAvailableMoves();
    this.selections.set(
      numberCoordsToCoords(availableMoves[Math.floor(Math.random() * availableMoves.length)]),
      player,
    );
  }
}
