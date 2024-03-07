import {Rule, RuleType, RuleWinType} from './types';

function getWinCondition(level: number): Rule {
  if (level === 1) {
    return {
      type: RuleType.WIN_CON,
      winType: RuleWinType.X_IN_A_ROW,
      xInARow: 3,
    };
  }
  return {
    type: RuleType.WIN_CON,
    winType: RuleWinType.X_IN_A_ROW,
    xInARow: 2,
  };
}

function getFirstMoveRule(level: number): Rule {
  if (level === 1) {
    return {
      type: RuleType.FIRST_MOVE,
      firstPlayer: 'x',
    };
  }
  return {
    type: RuleType.FIRST_MOVE,
    firstPlayer: Math.random() > 0.5 ? 'x' : 'o',
  };
}

export function generateRules(level: number): Rule[] {
  return [
    getWinCondition(level),
    {
      type: RuleType.TURN_ORDER,
    },
    getFirstMoveRule(level),
  ];
}

export function getRuleName(rule: Rule): string {
  switch (rule.type) {
    case RuleType.WIN_CON:
      return `Win: ${rule.xInARow} in a row`;
    case RuleType.TURN_ORDER:
      return 'Take turns';
    case RuleType.FIRST_MOVE:
      return `${rule.firstPlayer?.toUpperCase()} goes first`;
    default:
      return 'Unknown';
  }
}
