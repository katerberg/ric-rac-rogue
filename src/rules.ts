import {Rule} from './types';

function getWinCondition(level: number): Rule {
  if (level === 1) {
    return {
      name: 'Win: 3 in a row',
    };
  }
  return {
    name: 'Win: 2 in a row',
  };
}

function getFirstMoveRule(level: number): Rule {
  if (level === 1) {
    return {
      name: 'X goes first',
    };
  }
  return {
    name: Math.random() > 0.5 ? 'X goes first' : 'O goes first',
  };
}

export function generateRules(level: number): Rule[] {
  return [
    getWinCondition(level),
    {
      name: 'Take turns',
    },
    getFirstMoveRule(level),
  ];
}
