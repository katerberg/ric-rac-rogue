import {Board} from './classes/Board';
import {Choice, Moves, NumberCoordinates} from './types';

function isColumnWin(selections: Moves, columns: number, rows: number, winNumber: number): boolean {
  for (let x = 0; x < columns; x++) {
    for (let y = 0; y < rows - winNumber + 1; y++) {
      let isWinningColumn = selections.get(`${x},${y}`) !== undefined;
      if (isWinningColumn) {
        for (let winCheck = 1; winCheck < winNumber; winCheck++) {
          if (selections.get(`${x},${y + winCheck}`) !== selections.get(`${x},${y}`)) {
            isWinningColumn = false;
            break;
          }
        }
      }
      if (isWinningColumn) {
        return true;
      }
    }
  }
  return false;
}

function isRowWin(selections: Moves, columns: number, rows: number, winNumber: number): boolean {
  for (let x = 0; x < columns - winNumber + 1; x++) {
    for (let y = 0; y < rows; y++) {
      let isWinningRow = selections.get(`${x},${y}`) !== undefined;
      if (isWinningRow) {
        for (let winCheck = 1; winCheck < winNumber; winCheck++) {
          if (selections.get(`${x + winCheck},${y}`) !== selections.get(`${x},${y}`)) {
            isWinningRow = false;
            break;
          }
        }
      }
      if (isWinningRow) {
        return true;
      }
    }
  }
  return false;
}

function isDiagonalWin(selections: Moves, columns: number, rows: number, winNumber: number): boolean {
  for (let x = 0; x < columns - winNumber + 1; x++) {
    for (let y = 0; y < rows - winNumber + 1; y++) {
      let isWinningDiagonal = selections.get(`${x},${y}`) !== undefined;
      if (isWinningDiagonal) {
        for (let winCheck = 1; winCheck < winNumber; winCheck++) {
          if (selections.get(`${x + winCheck},${y + winCheck}`) !== selections.get(`${x},${y}`)) {
            isWinningDiagonal = false;
            break;
          }
        }
      }
      if (isWinningDiagonal) {
        return true;
      }
    }
  }
  return false;
}

function isReverseDiagonalWin(selections: Moves, columns: number, rows: number, winNumber: number): boolean {
  for (let x = winNumber - 1; x < columns; x++) {
    for (let y = 0; y < rows - winNumber + 1; y++) {
      let isWinningDiagonal = selections.get(`${x},${y}`) !== undefined;
      if (isWinningDiagonal) {
        for (let winCheck = 1; winCheck < winNumber; winCheck++) {
          if (selections.get(`${x - winCheck},${y + winCheck}`) !== selections.get(`${x},${y}`)) {
            isWinningDiagonal = false;
            break;
          }
        }
      }
      if (isWinningDiagonal) {
        return true;
      }
    }
  }
  return false;
}

export function isWin(selections: Moves, columns: number, rows: number, winNumber: number): boolean {
  return (
    isColumnWin(selections, columns, rows, winNumber) ||
    isRowWin(selections, columns, rows, winNumber) ||
    isDiagonalWin(selections, columns, rows, winNumber) ||
    isReverseDiagonalWin(selections, columns, rows, winNumber)
  );
}

export function isCat(selections: Moves, columns: number, rows: number): boolean {
  return selections.size === columns * rows;
}

export function checkTerminal(
  board: Board,
  requiredWin: number,
  currentPlayer: Choice,
): {
  isTerminal: boolean;
  isCat: boolean;
  isWinner: boolean;
  winner: Choice | null;
} {
  const isCatGame = isCat(board.selections, board.columns, board.rows);
  const isWinner = isWin(board.selections, board.columns, board.rows, requiredWin);
  return {
    isTerminal: isWinner || isCatGame,
    isWinner,
    isCat: isCatGame,
    winner: isWinner ? currentPlayer : null,
  };
}

export function getColumnScore(selections: Moves, column: number, rows: number): number {
  let score = 0;
  for (let y = 0; y < rows; y++) {
    if (selections.get(`${column},${y}`) === 'x') {
      if (selections.get(`${column},${y + 1}`) === 'x') {
        if (selections.get(`${column},${y + 2}`) === 'x') {
          score += 100000;
          y += 2;
        } else {
          score += 10;
          y++;
        }
      } else {
        score += 1;
      }
    } else if (selections.get(`${column},${y}`) === 'o') {
      if (selections.get(`${column},${y + 1}`) === 'o') {
        if (selections.get(`${column},${y + 2}`) === 'o') {
          score -= 100000;
          y += 2;
        } else {
          score -= 10;
          y++;
        }
      } else {
        score -= 1;
      }
    }
  }
  return score;
}

export function getRowScore(selections: Moves, columns: number, row: number): number {
  let score = 0;
  for (let x = 0; x < columns; x++) {
    if (selections.get(`${x},${row}`) === 'x') {
      if (selections.get(`${x + 1},${row}`) === 'x') {
        if (selections.get(`${x + 2},${row}`) === 'x') {
          score += 100000;
          x += 2;
        } else {
          score += 10;
          x++;
        }
      } else {
        score += 1;
      }
    } else if (selections.get(`${x},${row}`) === 'o') {
      if (selections.get(`${x + 1},${row}`) === 'o') {
        if (selections.get(`${x + 2},${row}`) === 'o') {
          score -= 100000;
          x += 2;
        } else {
          score -= 10;
          x++;
        }
      } else {
        score -= 1;
      }
    }
  }
  return score;
}

export function getTotalColumnScore(selections: Moves, columns: number, rows: number): number {
  let score = 0;
  for (let x = 0; x < columns; x++) {
    score += getColumnScore(selections, x, rows);
  }

  return score;
}

export function getTotalRowScore(selections: Moves, columns: number, rows: number): number {
  let score = 0;
  for (let y = 0; y < rows; y++) {
    score += getRowScore(selections, columns, y);
  }

  return score;
}

export function getDiagonalScore(
  selections: Moves,
  columns: number,
  rows: number,
  startingCoordinate: NumberCoordinates,
): number {
  let {x, y} = startingCoordinate;
  let score = 0;
  while (x < columns && y < rows) {
    if (selections.get(`${x},${y}`) === 'x') {
      if (selections.get(`${x + 1},${y + 1}`) === 'x') {
        if (selections.get(`${x + 2},${y + 2}`) === 'x') {
          score += 100000;
          x += 3;
          y += 3;
        } else {
          score += 10;
          x += 2;
          y += 2;
        }
      } else {
        score += 1;
        x += 1;
        y += 1;
      }
    } else if (selections.get(`${x},${y}`) === 'o') {
      if (selections.get(`${x + 1},${y + 1}`) === 'o') {
        if (selections.get(`${x + 2},${y + 2}`) === 'o') {
          score -= 100000;
          x += 3;
          y += 3;
        } else {
          score -= 10;
          x += 2;
          y += 2;
        }
      } else {
        score -= 1;
        x += 1;
        y += 1;
      }
    } else {
      x += 1;
      y += 1;
    }
  }
  return score;
}

export function getTotalDiagonalScore(selections: Moves, columns: number, rows: number): number {
  let score = 0;
  for (let x = 0; x < columns; x++) {
    score += getDiagonalScore(selections, columns, rows, {x, y: 0});
  }
  for (let y = 1; y < rows; y++) {
    score += getDiagonalScore(selections, columns, rows, {x: 0, y});
  }

  return score;
}

function getReverseDiagonalScore(
  selections: Moves,
  columns: number,
  rows: number,
  startingCoordinate: NumberCoordinates,
): number {
  let {x, y} = startingCoordinate;
  let score = 0;
  while (x >= 0 && y < rows) {
    if (selections.get(`${x},${y}`) === 'x') {
      if (selections.get(`${x - 1},${y + 1}`) === 'x') {
        if (selections.get(`${x - 2},${y + 2}`) === 'x') {
          score += 100000;
          x -= 3;
          y += 3;
        } else {
          score += 10;
          x -= 2;
          y += 2;
        }
      } else {
        score += 1;
        x -= 1;
        y += 1;
      }
    } else if (selections.get(`${x},${y}`) === 'o') {
      if (selections.get(`${x - 1},${y + 1}`) === 'o') {
        if (selections.get(`${x - 2},${y + 2}`) === 'o') {
          score -= 100000;
          x -= 3;
          y += 3;
        } else {
          score -= 10;
          x -= 2;
          y += 2;
        }
      } else {
        score -= 1;
        x -= 1;
        y += 1;
      }
    } else {
      x -= 1;
      y += 1;
    }
  }
  return score;
}

export function getTotalReverseDiagonalScore(selections: Moves, columns: number, rows: number): number {
  let score = 0;
  for (let x = 0; x < columns; x++) {
    score += getReverseDiagonalScore(selections, columns, rows, {x, y: 0});
  }
  for (let y = 1; y < rows; y++) {
    score += getReverseDiagonalScore(selections, columns, rows, {x: 3, y});
  }

  return score;
}

export function getTotalScore(selections: Moves, columns: number, rows: number): number {
  return (
    getTotalColumnScore(selections, columns, rows) +
    getTotalRowScore(selections, columns, rows) +
    getTotalDiagonalScore(selections, columns, rows) +
    getTotalReverseDiagonalScore(selections, columns, rows)
  );
}
