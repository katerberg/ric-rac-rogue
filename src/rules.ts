/* eslint-disable no-case-declarations */
import {NumberCoordinates, Rule, RuleType, RuleWinType, TurnOrderType} from './types';

function getWeightedRandomNumber(probabilities: {[expectedNumber: number]: number}): number {
  let totalProbability = 0;
  Object.values(probabilities).forEach((num) => {
    totalProbability += num;
  });

  let rand = Math.random() * totalProbability;
  let val = Number.parseInt(Object.keys(probabilities)[0], 10);
  Object.entries(probabilities).some(([key, value]) => {
    rand -= value;
    if (rand <= 0) {
      val = Number.parseInt(key, 10);
      return true;
    }
    return false;
  });
  return val;
}

function getWinCondition(level: number, columns: number, rows: number): Rule {
  let winCon;
  switch (level) {
    case 2:
    case 3:
    case 4:
    case 5:
    case 6:
    case 7:
    case 8:
    case 9:
      const probability: {[key: number]: number} = {
        2: 0.2,
      };
      const min = Math.min(columns, rows);
      if (min > 2) {
        // 0.8 left
        const spread = min - 2;
        for (let i = 3; i <= min; i++) {
          probability[i] = 0.8 / spread;
        }
      } else {
        probability[2] = 1;
      }

      winCon = {
        type: RuleType.WIN_CON,
        winType: RuleWinType.X_IN_A_ROW,
        xInARow: getWeightedRandomNumber(probability),
      };
      break;

    case 10:
      winCon = {
        type: RuleType.WIN_CON,
        winType: RuleWinType.X_IN_A_ROW,
        xInARow: 4,
      };
      break;
    case 1:
    default:
      winCon = {
        type: RuleType.WIN_CON,
        winType: RuleWinType.X_IN_A_ROW,
        xInARow: 3,
      };
      break;
  }
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

export function generateNumberOfAxes(level: number): number {
  switch (level) {
    case 1:
      return getWeightedRandomNumber({3: 1});
    case 2:
    case 3:
      return getWeightedRandomNumber({3: 0.7, 4: 0.3});
    case 4:
    case 5:
      return getWeightedRandomNumber({2: 0.1, 3: 0.6, 4: 0.3});
    case 6:
    case 7:
      return getWeightedRandomNumber({2: 0.1, 3: 0.4, 4: 0.3, 5: 0.2});
    case 8:
    case 9:
      return getWeightedRandomNumber({2: 0.1, 3: 0.4, 4: 0.3, 5: 0.2});
    case 10:
      return getWeightedRandomNumber({7: 0.1, 8: 0.4, 9: 0.3, 10: 0.2});
    default:
      return Math.ceil(Math.random() * 3) + 2;
  }
}

export function generateRules(level: number, columns: number, rows: number): Rule[] {
  const rules = [
    getWinCondition(level, columns, rows),
    {
      type: RuleType.TURN_ORDER,
      turnOrderType: level === 10 ? TurnOrderType.TWO_TO_ONE : TurnOrderType.TAKE_TURNS,
    },
  ];

  if (level > 4 && level < 10) {
    const percentage = 0.1 * (level - 3);
    if (getWeightedRandomNumber({0: 1 - percentage, 1: percentage})) {
      rules.push({
        type: RuleType.BLOCKING_COLUMN,
        axisToBlock: Math.floor(Math.random() * columns),
      });
    }
  }

  rules.push(getFirstMoveRule(level));
  return rules;
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
    case RuleType.BLOCKING_COLUMN:
    case RuleType.BLOCKING_ROW:
      return 'Rotating embargo';
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
      const rowToBlock = Math.floor(Math.random() * rows);
      const columnToBlock = Math.floor(Math.random() * columns);
      return [
        ...Array.from(Array(rows).keys()).map((i) => ({x: columnToBlock, y: i})),
        ...Array.from(Array(columns).keys()).map((i) => (i === columnToBlock ? undefined : {x: i, y: rowToBlock})),
      ].filter((a) => a) as NumberCoordinates[];

    default:
      return [];
  }
}
