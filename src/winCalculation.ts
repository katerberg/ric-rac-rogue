import {Board} from './classes/Board';
import {Choice, Moves, NumberCoordinates, TerminalStatus} from './types';

function isColumnWin(selections: Moves, columns: number, rows: number, winNumber: number): Choice | undefined {
  for (let x = 0; x < columns; x++) {
    for (let y = 0; y < rows - winNumber + 1; y++) {
      let isWinningColumn = selections.get(`${x},${y}`);
      if (isWinningColumn) {
        for (let winCheck = 1; winCheck < winNumber; winCheck++) {
          if (selections.get(`${x},${y + winCheck}`) !== selections.get(`${x},${y}`)) {
            isWinningColumn = undefined;
            break;
          }
        }
      }
      if (isWinningColumn === 'x' || isWinningColumn === 'o') {
        return isWinningColumn;
      }
    }
  }
  return undefined;
}

function isRowWin(selections: Moves, columns: number, rows: number, winNumber: number): Choice | undefined {
  for (let x = 0; x < columns - winNumber + 1; x++) {
    for (let y = 0; y < rows; y++) {
      let isWinningRow = selections.get(`${x},${y}`);
      if (isWinningRow) {
        for (let winCheck = 1; winCheck < winNumber; winCheck++) {
          if (selections.get(`${x + winCheck},${y}`) !== selections.get(`${x},${y}`)) {
            isWinningRow = undefined;
            break;
          }
        }
      }
      if (isWinningRow === 'o' || isWinningRow === 'x') {
        return isWinningRow;
      }
    }
  }
  return undefined;
}

function isDiagonalWin(selections: Moves, columns: number, rows: number, winNumber: number): Choice | undefined {
  for (let x = 0; x < columns - winNumber + 1; x++) {
    for (let y = 0; y < rows - winNumber + 1; y++) {
      let isWinningDiagonal = selections.get(`${x},${y}`);
      if (isWinningDiagonal) {
        for (let winCheck = 1; winCheck < winNumber; winCheck++) {
          if (selections.get(`${x + winCheck},${y + winCheck}`) !== selections.get(`${x},${y}`)) {
            isWinningDiagonal = undefined;
            break;
          }
        }
      }
      if (isWinningDiagonal === 'o' || isWinningDiagonal === 'x') {
        return isWinningDiagonal;
      }
    }
  }
  return undefined;
}

function isReverseDiagonalWin(selections: Moves, columns: number, rows: number, winNumber: number): Choice | undefined {
  for (let x = winNumber - 1; x < columns; x++) {
    for (let y = 0; y < rows - winNumber + 1; y++) {
      let isWinningDiagonal = selections.get(`${x},${y}`);
      if (isWinningDiagonal) {
        for (let winCheck = 1; winCheck < winNumber; winCheck++) {
          if (selections.get(`${x - winCheck},${y + winCheck}`) !== selections.get(`${x},${y}`)) {
            isWinningDiagonal = undefined;
            break;
          }
        }
      }
      if (isWinningDiagonal === 'o' || isWinningDiagonal === 'x') {
        return isWinningDiagonal;
      }
    }
  }
  return undefined;
}

export function isWin(selections: Moves, columns: number, rows: number, winNumber: number): Choice | undefined {
  return (
    isColumnWin(selections, columns, rows, winNumber) ??
    isRowWin(selections, columns, rows, winNumber) ??
    isDiagonalWin(selections, columns, rows, winNumber) ??
    isReverseDiagonalWin(selections, columns, rows, winNumber)
  );
}

function getWinFromColumn(
  selections: Moves,
  columns: number,
  rows: number,
  winNumber: number,
  choice: Choice,
): NumberCoordinates[] | undefined {
  for (let x = 0; x < columns; x++) {
    for (let y = 0; y < rows - winNumber + 1; y++) {
      let isWinningColumn = selections.get(`${x},${y}`);
      if (isWinningColumn === choice) {
        for (let winCheck = 1; winCheck < winNumber; winCheck++) {
          if (selections.get(`${x},${y + winCheck}`) !== selections.get(`${x},${y}`)) {
            isWinningColumn = undefined;
            break;
          }
        }

        if (isWinningColumn !== undefined) {
          return Array.from(Array(winNumber).keys()).map((i) => ({x, y: y + i}));
        }
      }
    }
  }
  return undefined;
}

function getWinFromReverseDiagonal(
  selections: Moves,
  columns: number,
  rows: number,
  winNumber: number,
  choice: Choice,
): NumberCoordinates[] | undefined {
  for (let x = winNumber - 1; x < columns; x++) {
    for (let y = 0; y < rows - winNumber + 1; y++) {
      let isWinningDiagonal = selections.get(`${x},${y}`);
      if (isWinningDiagonal === choice) {
        for (let winCheck = 1; winCheck < winNumber; winCheck++) {
          if (selections.get(`${x - winCheck},${y + winCheck}`) !== selections.get(`${x},${y}`)) {
            isWinningDiagonal = undefined;
            break;
          }
        }
        if (isWinningDiagonal !== undefined) {
          return Array.from(Array(winNumber).keys()).map((i) => ({x: x - i, y: y + i}));
        }
      }
    }
  }
  return undefined;
}

function getWinFromDiagonal(
  selections: Moves,
  columns: number,
  rows: number,
  winNumber: number,
  choice: Choice,
): NumberCoordinates[] | undefined {
  for (let x = 0; x < columns - winNumber + 1; x++) {
    for (let y = 0; y < rows - winNumber + 1; y++) {
      let isWinningDiagonal = selections.get(`${x},${y}`);
      if (isWinningDiagonal === choice) {
        for (let winCheck = 1; winCheck < winNumber; winCheck++) {
          if (selections.get(`${x + winCheck},${y + winCheck}`) !== selections.get(`${x},${y}`)) {
            isWinningDiagonal = undefined;
            break;
          }
        }
        if (isWinningDiagonal !== undefined) {
          return Array.from(Array(winNumber).keys()).map((i) => ({x: x + i, y: y + i}));
        }
      }
    }
  }
  return undefined;
}

function getWinFromRow(
  selections: Moves,
  columns: number,
  rows: number,
  winNumber: number,
  choice: Choice,
): NumberCoordinates[] | undefined {
  for (let x = 0; x < columns - winNumber + 1; x++) {
    for (let y = 0; y < rows; y++) {
      let isWinningRow = selections.get(`${x},${y}`);
      if (isWinningRow === choice) {
        for (let winCheck = 1; winCheck < winNumber; winCheck++) {
          if (selections.get(`${x + winCheck},${y}`) !== selections.get(`${x},${y}`)) {
            isWinningRow = undefined;
            break;
          }
        }

        if (isWinningRow !== undefined) {
          return Array.from(Array(winNumber).keys()).map((i) => ({x: x + i, y}));
        }
      }
    }
  }
  return undefined;
}

export function getWin(
  selections: Moves,
  columns: number,
  rows: number,
  winNumber: number,
  choice: Choice,
): NumberCoordinates[] | undefined {
  return (
    getWinFromDiagonal(selections, columns, rows, winNumber, choice) ??
    getWinFromReverseDiagonal(selections, columns, rows, winNumber, choice) ??
    getWinFromRow(selections, columns, rows, winNumber, choice) ??
    getWinFromColumn(selections, columns, rows, winNumber, choice)
  );
}

export function isCat(selections: Moves, columns: number, rows: number): boolean {
  return selections.size === columns * rows;
}

export function checkTerminal(board: Board, requiredWin: number): TerminalStatus {
  const isCatGame = isCat(board.selections, board.columns, board.rows);
  const isWinner = isWin(board.selections, board.columns, board.rows, requiredWin);
  return {
    isTerminal: !!isWinner || isCatGame,
    isWinner: !!isWinner,
    isCat: isCatGame,
    winner: isWinner ?? null,
  };
}

export function getColumnScore(selections: Moves, column: number, rows: number, requiredWin: number): number {
  let score = 0;
  for (let y = 0; y < rows; y++) {
    const startingValue = selections.get(`${column},${y}`);
    if (startingValue === 'x' || startingValue === 'o') {
      let connectors = 0;
      while (++connectors < requiredWin) {
        if (selections.get(`${column},${y + connectors}`) !== startingValue) {
          break;
        }
      }

      score += Math.pow(10, connectors - (requiredWin === connectors ? 0 : 1)) * (startingValue === 'o' ? -1 : 1);
    }
  }
  return score;
}

export function getRowScore(selections: Moves, columns: number, row: number, requiredWin: number): number {
  let score = 0;
  for (let x = 0; x < columns; x++) {
    const startingValue = selections.get(`${x},${row}`);
    if (startingValue === 'x' || startingValue === 'o') {
      let connectors = 0;
      while (++connectors < requiredWin) {
        if (selections.get(`${x + connectors},${row}`) !== startingValue) {
          break;
        }
      }

      score += Math.pow(10, connectors - (requiredWin === connectors ? 0 : 1)) * (startingValue === 'o' ? -1 : 1);
    }
  }
  return score;
}

export function getTotalColumnScore(selections: Moves, columns: number, rows: number, requiredWin: number): number {
  let score = 0;
  for (let x = 0; x < columns; x++) {
    score += getColumnScore(selections, x, rows, requiredWin);
  }

  return score;
}

export function getTotalRowScore(selections: Moves, columns: number, rows: number, requiredWin: number): number {
  let score = 0;
  for (let y = 0; y < rows; y++) {
    score += getRowScore(selections, columns, y, requiredWin);
  }

  return score;
}

export function getDiagonalScore(
  selections: Moves,
  columns: number,
  rows: number,
  startingCoordinate: NumberCoordinates,
  requiredWin: number,
): number {
  let {x, y} = startingCoordinate;
  let score = 0;
  while (x < columns && y < rows) {
    const startingValue = selections.get(`${x},${y}`);
    if (startingValue === 'x' || startingValue === 'o') {
      let connectors = 0;
      while (++connectors < requiredWin) {
        if (selections.get(`${x + connectors},${y + connectors}`) !== startingValue) {
          y += connectors;
          x += connectors;
          break;
        }
      }

      if (connectors === requiredWin) {
        y += connectors;
        x += connectors;
        score += Math.pow(10, connectors + 1) * (startingValue === 'o' ? -1 : 1);
      } else {
        score += Math.pow(10, connectors - 1) * (startingValue === 'o' ? -1 : 1);
      }
    } else {
      x += 1;
      y += 1;
    }
  }
  return score;
}

export function getTotalDiagonalScore(selections: Moves, columns: number, rows: number, requiredWin: number): number {
  let score = 0;
  for (let x = 0; x < columns; x++) {
    score += getDiagonalScore(selections, columns, rows, {x, y: 0}, requiredWin);
  }
  for (let y = 1; y < rows; y++) {
    score += getDiagonalScore(selections, columns, rows, {x: 0, y}, requiredWin);
  }

  return score;
}

function getReverseDiagonalScore(
  selections: Moves,
  columns: number,
  rows: number,
  startingCoordinate: NumberCoordinates,
  requiredWin: number,
): number {
  let {x, y} = startingCoordinate;
  let score = 0;
  while (x < columns && y < rows) {
    const startingValue = selections.get(`${x},${y}`);
    if (startingValue === 'x' || startingValue === 'o') {
      let connectors = 0;
      while (++connectors < requiredWin) {
        if (selections.get(`${x - connectors},${y + connectors}`) !== startingValue) {
          x -= connectors;
          y += connectors;
          break;
        }
      }

      if (connectors === requiredWin) {
        x -= connectors;
        y += connectors;
        score += Math.pow(10, connectors + 1) * (startingValue === 'o' ? -1 : 1);
      } else {
        score += Math.pow(10, connectors - 1) * (startingValue === 'o' ? -1 : 1);
      }
    } else {
      x -= 1;
      y += 1;
    }
  }
  return score;
}

export function getTotalReverseDiagonalScore(
  selections: Moves,
  columns: number,
  rows: number,
  requiredWin: number,
): number {
  let score = 0;
  for (let x = 0; x < columns; x++) {
    score += getReverseDiagonalScore(selections, columns, rows, {x, y: 0}, requiredWin);
  }
  for (let y = 1; y < rows; y++) {
    score += getReverseDiagonalScore(selections, columns, rows, {x: 3, y}, requiredWin);
  }

  return score;
}

export function getTotalScore(selections: Moves, columns: number, rows: number, winNumber: number): number {
  return (
    getTotalColumnScore(selections, columns, rows, winNumber) +
    getTotalRowScore(selections, columns, rows, winNumber) +
    getTotalDiagonalScore(selections, columns, rows, winNumber) +
    getTotalReverseDiagonalScore(selections, columns, rows, winNumber)
  );
}
