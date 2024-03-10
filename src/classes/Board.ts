import {numberCoordsToCoords} from '../coordinatesHelper';
import {Choice, Moves, NumberCoordinates, SelectionTimes, SpaceStatusEffect} from '../types';
import {WinLine} from './WinLine';

type BoardProps = {
  columns: number;
  rows: number;
  selections: Moves;
  blockedSpaces?: NumberCoordinates[];
};

export class Board {
  columns: number;

  rows: number;

  selections: Moves;

  selectionTimes: SelectionTimes;

  winLines: WinLine[];

  blockedSpaces: NumberCoordinates[];

  constructor({columns, rows, selections, blockedSpaces = []}: BoardProps) {
    this.columns = columns;
    this.rows = rows;
    this.selections = selections;
    this.selectionTimes = new Map();
    this.winLines = [];
    this.blockedSpaces = blockedSpaces;
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

  isUnblockedMove({x, y}: NumberCoordinates): boolean {
    return (
      this.isMoveOnBoard({x, y}) &&
      !this.blockedSpaces.some((blockedSpace) => blockedSpace.x === x && blockedSpace.y === y)
    );
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

  isPlayerMove({x, y}: NumberCoordinates): boolean {
    return ['x', 'o'].includes(`${this.selections.get(`${x},${y}`)}`) && this.isMoveOnBoard({x, y});
  }

  flipTile({x, y}: NumberCoordinates): boolean {
    if (this.isTakenMove({x, y})) {
      const currentValue = this.selections.get(`${x},${y}`);
      this.selections.set(`${x},${y}`, currentValue === 'x' ? 'o' : 'x');
      return true;
    }
    return false;
  }

  teleportRandom({x, y}: NumberCoordinates): void {
    const availableMoves = this.getAvailableMoves();
    if (availableMoves.length > 0) {
      const randomMove = availableMoves[Math.floor(Math.random() * availableMoves.length)];
      this.selections.set(`${randomMove.x},${randomMove.y}`, this.selections.get(`${x},${y}`));
      this.selectionTimes.set(`${randomMove.x},${randomMove.y}`, this.selectionTimes.get(`${x},${y}`) ?? 0);
      this.selections.delete(`${x},${y}`);
    }
  }

  copyRow(rowNumberToCopy: number): void {
    if (rowNumberToCopy > -1 && rowNumberToCopy < this.rows) {
      for (let y = this.rows - 1; y >= rowNumberToCopy; y--) {
        for (let x = 0; x < this.columns; x++) {
          const valueToCopy = this.selections.get(`${x},${y}`);
          if (valueToCopy !== undefined) {
            //Move previous selections
            this.selections.set(`${x},${y + 1}`, this.selections.get(`${x},${y}`));
            this.selectionTimes.set(`${x},${y + 1}`, this.selectionTimes.get(`${x},${y}`) ?? 0);
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
            this.selectionTimes.set(`${x + 1},${y}`, this.selectionTimes.get(`${x},${y}`) ?? 0);
          }
          if (x !== columnNumberToCopy) {
            this.selections.delete(`${x},${y}`);
          }
        }
      }
      this.columns++;
    }
  }

  removeRow(rowNumberToRemove: number): void {
    if (rowNumberToRemove > -1 && rowNumberToRemove < this.rows) {
      for (let y = rowNumberToRemove; y < this.rows; y++) {
        for (let x = 0; x < this.columns; x++) {
          if (rowNumberToRemove === y) {
            this.selections.delete(`${x},${y}`);
          }
          const valueToCopy = this.selections.get(`${x},${y + 1}`);
          if (valueToCopy !== undefined) {
            //Move previous selections
            this.selections.set(`${x},${y}`, valueToCopy);
            this.selectionTimes.set(`${x},${y}`, this.selectionTimes.get(`${x},${y + 1}`) ?? 0);
          } else {
            this.selections.delete(`${x},${y}`);
          }
        }
      }
      this.rows--;
    }
  }

  removeColumn(columnNumberToRemove: number): void {
    if (columnNumberToRemove > -1 && columnNumberToRemove < this.columns) {
      for (let x = columnNumberToRemove; x < this.columns; x++) {
        for (let y = 0; y < this.rows; y++) {
          if (columnNumberToRemove === x) {
            this.selections.delete(`${x},${y}`);
          }
          const valueToCopy = this.selections.get(`${x + 1},${y}`);
          if (valueToCopy !== undefined) {
            //Move previous selections
            this.selections.set(`${x},${y}`, valueToCopy);
            this.selectionTimes.set(`${x},${y}`, this.selectionTimes.get(`${x + 1},${y}`) ?? 0);
          } else {
            this.selections.delete(`${x},${y}`);
          }
        }
      }
      this.columns--;
    }
  }

  reverseRow(rowNumberToReverse: number): void {
    if (rowNumberToReverse > -1 && rowNumberToReverse < this.rows) {
      const previousValues: Array<Choice | SpaceStatusEffect | undefined> = [];
      for (let x = 0; x < this.columns / 2; x++) {
        previousValues[x] = this.selections.get(`${x},${rowNumberToReverse}`);
        const valueToCopy = this.selections.get(`${this.columns - x - 1},${rowNumberToReverse}`);
        if (valueToCopy !== undefined) {
          this.selections.set(`${x},${rowNumberToReverse}`, valueToCopy);
        } else {
          this.selections.delete(`${x},${rowNumberToReverse}`);
        }
      }
      previousValues.forEach((value, i) => {
        if (value !== undefined) {
          this.selections.set(`${this.columns - i - 1},${rowNumberToReverse}`, value);
        } else {
          this.selections.delete(`${this.columns - i - 1},${rowNumberToReverse}`);
        }
      });
    }
  }

  reverseColumn(columnNumberToReverse: number): void {
    if (columnNumberToReverse > -1 && columnNumberToReverse < this.columns) {
      const previousValues: Array<Choice | SpaceStatusEffect | undefined> = [];
      for (let y = 0; y < this.rows / 2; y++) {
        previousValues[y] = this.selections.get(`${columnNumberToReverse},${y}`);
        const valueToCopy = this.selections.get(`${columnNumberToReverse},${this.rows - y - 1}`);
        if (valueToCopy !== undefined) {
          this.selections.set(`${columnNumberToReverse},${y}`, valueToCopy);
        } else {
          this.selections.delete(`${columnNumberToReverse},${y}`);
        }
      }
      previousValues.forEach((value, i) => {
        if (value !== undefined) {
          this.selections.set(`${columnNumberToReverse},${this.rows - i - 1}`, value);
        } else {
          this.selections.delete(`${columnNumberToReverse},${this.rows - i - 1}`);
        }
      });
    }
  }

  getRandomMove(): NumberCoordinates {
    const availableMoves = this.getAvailableMoves();
    return availableMoves[Math.floor(Math.random() * availableMoves.length)];
  }

  setRandomMove(player: Choice): void {
    this.selections.set(numberCoordsToCoords(this.getRandomMove()), player);
  }

  // o _ x
  // o x _
  // _ _ x
  toString(): string {
    let result = '';
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.columns; x++) {
        result += `${this.selections.get(`${x},${y}`) ?? '_'} `;
      }
      result += '\n';
    }
    return result;
  }
}
