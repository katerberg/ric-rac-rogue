import {getUrlParams, isDebug} from '../environment';
import {generateRules} from '../rules';
import {Choice, Coordinate, Rule, RuleType} from '../types';
import {Board} from './Board';

export class Level {
  board: Board;

  level: number;

  requiredWin: number;

  maxDepth: number;

  rules: Rule[];

  // Simple Modifiers
  // Add column
  // Add row
  // Banded play along column
  // Banded play along row
  // Banded play along outside
  // Revenge
  // 3 in a column to win
  // 3 in a row to win
  // 3 in a diagonal to win
  // O goes first

  // Difficult modifiers
  // 4 in a square
  // 4 in a square
  // Boop
  // Gravity

  // 1: 3x3 with no special effects
  // 2: 4x4 with one tweak
  // 3:
  // 4:
  // 5:
  // 6:
  // 7:
  // 8:
  // 9:
  // Boss: one of the fancy situations (quantum, ultimate, ????)
  constructor(level: number) {
    let columns = 3;
    let rows = 3;

    if (isDebug()) {
      const urlParams = getUrlParams();
      columns = Number.parseInt(urlParams.get('columns') || '3', 10);
      rows = Number.parseInt(urlParams.get('rows') || '3', 10);
    }
    this.level = level;
    this.board = new Board({
      columns,
      rows,
      selections: new Map<Coordinate, Choice>(),
    });
    this.requiredWin = 3;
    this.maxDepth = 3;

    this.rules = generateRules(level);
    this.requiredWin = this.rules.find((rule) => rule.type === RuleType.WIN_CON)?.xInARow ?? 3;
    if (this.rules.find((rule) => rule.type === RuleType.FIRST_MOVE)?.firstPlayer === 'o') {
      this.board.setRandomMove('o');
    }
  }

  changeWinRequirement(requiredWin: number): void {
    this.requiredWin = requiredWin;
    const winCon = this.rules.find((rule) => rule.type === RuleType.WIN_CON);
    if (winCon?.xInARow) {
      winCon.xInARow = requiredWin;
    }
  }
}