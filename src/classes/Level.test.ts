import {RuleType, RuleWinType} from '../types';
import {Level} from './Level';

describe('Level', () => {
  describe('getWinningSpaces', () => {
    it('gives empty array if there is not a winning line', () => {
      const selections = new Map();
      selections.set('0,0', 'x');
      selections.set('1,3', 'o');
      selections.set('2,2', 'o');
      selections.set('1,1', 'x');

      const level = new Level(7);
      level.board.columns = 4;
      level.board.rows = 4;
      level.board.selections = selections;
      level.rules = [
        {
          type: RuleType.WIN_CON,
          winType: RuleWinType.X_IN_A_ROW,
          xInARow: 3,
        },
      ];

      expect(level.getWinningSpaces('x')).toEqual([]);
    });

    it('gives winning spaces', () => {
      const selections = new Map();
      selections.set('0,0', 'x');
      selections.set('1,3', 'o');
      selections.set('2,2', 'x');
      selections.set('2,3', 'o');
      selections.set('1,1', 'x');

      const level = new Level(7);
      level.board.columns = 4;
      level.board.rows = 4;
      level.board.selections = selections;
      level.requiredWin = 3;
      level.rules = [
        {
          type: RuleType.WIN_CON,
          winType: RuleWinType.X_IN_A_ROW,
          xInARow: 3,
        },
      ];

      expect(level.getWinningSpaces('x')).toEqual([
        {x: 0, y: 0},
        {x: 1, y: 1},
        {x: 2, y: 2},
      ]);
    });

    it('gives first winning spaces if there are multiples', () => {
      const selections = new Map();
      selections.set('0,0', 'x');
      selections.set('0,1', 'x');
      selections.set('0,2', 'x');
      selections.set('0,3', 'x');
      selections.set('1,3', 'o');
      selections.set('2,2', 'o');
      selections.set('1,1', 'x');

      const level = new Level(7);
      level.board.columns = 4;
      level.board.rows = 4;
      level.board.selections = selections;
      level.requiredWin = 3;
      level.rules = [
        {
          type: RuleType.WIN_CON,
          winType: RuleWinType.X_IN_A_ROW,
          xInARow: 3,
        },
      ];

      const result = level.getWinningSpaces('x');
      expect(result).toEqual([
        {x: 0, y: 0},
        {x: 0, y: 1},
        {x: 0, y: 2},
      ]);
    });
  });
});
