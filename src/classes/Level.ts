import {getUrlParams, isDebug} from '../environment';
import {getBlockedSpaces, generateNumberOfAxes, generateRules} from '../rules';
import {Choice, Coordinate, NumberCoordinates, Rule, RuleType, TurnOrderType} from '../types';
import {getWin} from '../winCalculation';
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
    let columns = generateNumberOfAxes(level);
    let rows = level === 10 ? 5 : generateNumberOfAxes(level);

    if (isDebug()) {
      const urlParams = getUrlParams();
      columns = Number.parseInt(urlParams.get('columns') || `${generateNumberOfAxes(level)}`, 10);
      rows = level === 10 ? 5 : Number.parseInt(urlParams.get('rows') || `${generateNumberOfAxes(level)}`, 10);
    }
    this.level = level;
    this.board = new Board({
      columns,
      rows,
      selections: new Map<Coordinate, Choice>(),
      blockedSpaces: getBlockedSpaces(level, columns, rows),
    });
    this.rules = generateRules(level, columns, rows);
    this.requiredWin = this.rules.find((rule) => rule.type === RuleType.WIN_CON)?.xInARow ?? 3;
    if (this.rules.find((rule) => rule.type === RuleType.FIRST_MOVE)?.firstPlayer === 'o') {
      this.board.setRandomMove('o');
      if (this.rules.find((rule) => rule.type === RuleType.TURN_ORDER)?.turnOrderType === TurnOrderType.TWO_TO_ONE) {
        this.board.setRandomMove('o');
      }
    }
    this.maxDepth = level === 10 ? 4 : 6;
  }

  isTwoToOne(): boolean {
    return !!this.rules.find(
      (rule) => rule.type === RuleType.TURN_ORDER && rule.turnOrderType === TurnOrderType.TWO_TO_ONE,
    );
  }

  getWinningSpaces(choice: Choice): NumberCoordinates[] {
    return getWin(this.board.selections, this.board.columns, this.board.rows, this.requiredWin, choice) ?? [];
  }

  changeWinRequirement(requiredWin: number): void {
    this.requiredWin = requiredWin;
    const winCon = this.rules.find((rule) => rule.type === RuleType.WIN_CON);
    if (winCon?.xInARow) {
      winCon.xInARow = requiredWin;
    }
  }
}
