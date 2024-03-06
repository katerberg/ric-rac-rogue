import {Board} from './Board';

describe('Board', () => {
  describe('removeRow', () => {
    it('leaves existing items', () => {
      const selections = new Map();
      selections.set('0,0', 'x');
      selections.set('1,3', 'o');
      selections.set('1,2', 'o');
      selections.set('1,1', 'x');

      const board = new Board({columns: 3, rows: 4, selections});

      board.removeRow(2);

      expect(board.rows).toBe(3);
      for (let y = 0; y < 4; y++) {
        for (let x = 0; x < 4; x++) {
          if (y === 2 && x === 1) {
            expect(board.selections.get(`${x},${y}`)).toBe('o');
          } else if (y === 0 && x === 0) {
            expect(board.selections.get(`${x},${y}`)).toBe('x');
          } else if (y === 1 && x === 1) {
            expect(board.selections.get(`${x},${y}`)).toBe('x');
          } else {
            expect(board.selections.get(`${x},${y}`)).toBe(undefined);
          }
        }
      }
    });
  });
  describe('removeColumn', () => {
    it('leaves existing items', () => {
      const selections = new Map();
      selections.set('0,0', 'x');
      selections.set('1,3', 'o');
      selections.set('2,2', 'o');
      selections.set('1,1', 'x');

      const board = new Board({columns: 4, rows: 4, selections});

      board.removeColumn(1);

      expect(board.columns).toBe(3);
      for (let y = 0; y < 4; y++) {
        for (let x = 0; x < 4; x++) {
          if (y === 2 && x === 1) {
            expect(board.selections.get(`${x},${y}`)).toBe('o');
          } else if (y === 0 && x === 0) {
            expect(board.selections.get(`${x},${y}`)).toBe('x');
          } else {
            expect(board.selections.get(`${x},${y}`)).toBe(undefined);
          }
        }
      }
    });
  });
});
