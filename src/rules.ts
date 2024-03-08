/* eslint-disable no-case-declarations */
import {NumberCoordinates, Rule, RuleType, RuleWinType, TurnOrderType} from './types';

function getWinCondition(level: number, columns: number, rows: number): Rule {
  if (level === 1) {
    return {
      type: RuleType.WIN_CON,
      winType: RuleWinType.X_IN_A_ROW,
      xInARow: 3,
    };
  }
  if (level === 10) {
    return {
      type: RuleType.WIN_CON,
      winType: RuleWinType.X_IN_A_ROW,
      xInARow: 4,
    };
  }
  const winCon = {
    type: RuleType.WIN_CON,
    winType: RuleWinType.X_IN_A_ROW,
    xInARow: Math.min(Math.ceil(Math.random() * Math.max(columns, rows)) + 1, Math.max(columns, rows)),
  };
  if (winCon.xInARow > 3 && columns === 5 && rows === 5) {
    winCon.xInARow = 3;
  }
  return winCon;
}

function getFirstMoveRule(level: number): Rule {
  if (level === 1) {
    return {
      type: RuleType.FIRST_MOVE,
      firstPlayer: 'x',
    };
  }
  if (level === 10) {
    return {
      type: RuleType.FIRST_MOVE,
      firstPlayer: 'o',
    };
  }
  return {
    type: RuleType.FIRST_MOVE,
    firstPlayer: Math.random() > 0.5 ? 'x' : 'o',
  };
}

// 1: 3x3
// 2-5: nXm of 2-4
// 2-6: nXm of 3-5
export function generateNumberOfAxes(level: number): number {
  if (level === 1) {
    return 3;
  }
  if (level === 10) {
    return Math.ceil(Math.random() * 4) + 6;
  }
  if (level < 6) {
    return Math.ceil(Math.random() * 3) + 1;
  }
  return Math.ceil(Math.random() * 3) + 2;
}

export function generateRules(level: number, columns: number, rows: number): Rule[] {
  return [
    getWinCondition(level, columns, rows),
    {
      type: RuleType.TURN_ORDER,
      turnOrderType: level === 10 ? TurnOrderType.TWO_TO_ONE : TurnOrderType.TAKE_TURNS,
    },
    getFirstMoveRule(level),
  ];
}

export function getRuleName(rule: Rule): string {
  switch (rule.type) {
    case RuleType.WIN_CON:
      return `Win: ${rule.xInARow} in a row`;
    case RuleType.TURN_ORDER:
      if (rule.turnOrderType === TurnOrderType.TWO_TO_ONE) {
        return 'Two turns to one';
      }
      return 'Take turns';
    case RuleType.FIRST_MOVE:
      return `${rule.firstPlayer?.toUpperCase()} goes first`;
    default:
      return 'Unknown';
  }
}

function getCell(columns: number, rows: number): NumberCoordinates {
  return {x: Math.floor(Math.random() * columns), y: Math.floor(Math.random() * rows)};
}

export function getBlockedSpaces(level: number, columns: number, rows: number): NumberCoordinates[] {
  const cellsToBlock: NumberCoordinates[] = [];
  switch (level) {
    case 1:
      return [];
    case 2:
    case 3:
    case 4:
    case 5:
    case 6:
      const numBlocks = Math.floor(Math.random() * 3);
      while (numBlocks > cellsToBlock.length) {
        const cellToBlock = getCell(columns, rows);
        if (!cellsToBlock.find((c) => c.x === cellToBlock.x && c.y === cellToBlock.y)) {
          cellsToBlock.push(cellToBlock);
        }
      }
      return cellsToBlock;
    case 7:
    case 8:
    case 9:
      const numberOfBlocks = Math.ceil(Math.random() * 3);
      while (numberOfBlocks > cellsToBlock.length) {
        const cellToBlock = getCell(columns, rows);
        if (!cellsToBlock.find((c) => c.x === cellToBlock.x && c.y === cellToBlock.y)) {
          cellsToBlock.push(cellToBlock);
        }
      }
      return cellsToBlock;
    case 10:
      const columnToBlock = Math.floor(Math.random() * columns);
      const rowToBlock = Math.floor(Math.random() * rows);
      return [
        ...Array.from(Array(rows).keys()).map((i) => ({x: i, y: columnToBlock})),
        ...Array.from(Array(columns).keys()).map((i) => (i === columnToBlock ? undefined : {x: rowToBlock, y: i})),
      ].filter((a) => a) as NumberCoordinates[];

    default:
      return [];
  }
}
