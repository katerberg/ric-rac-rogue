import {Choice, Coordinate} from './types';
import {
  isWin,
  getTotalColumnScore,
  getColumnScore,
  getRowScore,
  getTotalRowScore,
  getTotalDiagonalScore,
  getTotalReverseDiagonalScore,
  getTotalScore,
  isCat,
} from './winCalculation';

function objectToMap(obj: {[key: Coordinate]: Choice}): Map<Coordinate, Choice> {
  return new Map<Coordinate, Choice>(Object.entries(obj).map(([key, value]) => [key as Coordinate, value]));
}

describe('winCalculation', () => {
  describe('isWin', () => {
    it('should return false when there are not enough selections', () => {
      expect(isWin(new Map(), 3, 3, 3)).toBe(undefined);
    });

    it('should return true when there are 3 in a row vertically', () => {
      expect(isWin(objectToMap({'0,0': 'x', '0,1': 'x', '0,2': 'x'}), 3, 3, 3)).toBe('x');
    });

    it('should return true when there are 3 in a row horizontally', () => {
      expect(isWin(objectToMap({'0,0': 'x', '1,0': 'x', '2,0': 'x'}), 3, 6, 3)).toBe('x');
    });

    it('should return true when there are 3 in a row diagonally', () => {
      expect(isWin(objectToMap({'1,1': 'x', '2,2': 'x', '3,3': 'x'}), 7, 8, 3)).toBe('x');
    });

    it('should return true when there are 3 in a row reverse-diagonally', () => {
      expect(isWin(objectToMap({'2,1': 'o', '1,2': 'o', '0,3': 'o'}), 5, 5, 3)).toBe('o');
    });

    it('detects two long reverse wins', () => {
      expect(isWin(objectToMap({'0,2': 'x', '1,1': 'x', '0,3': 'o'}), 5, 5, 2)).toBe('x');
    });

    it('detects two long diagonal wins', () => {
      expect(isWin(objectToMap({'0,0': 'x', '1,1': 'x', '0,1': 'o'}), 2, 2, 2)).toBe('x');
    });
    it('detects two long column wins', () => {
      expect(isWin(objectToMap({'0,0': 'o', '0,1': 'o', '1,0': 'x'}), 2, 2, 2)).toBe('o');
    });
    it('detects two long row wins', () => {
      expect(isWin(objectToMap({'0,0': 'x', '1,0': 'x', '0,1': 'o'}), 2, 2, 2)).toBe('x');
    });
  });

  describe('isCat', () => {
    it('should return false when there are not enough selections', () => {
      expect(isCat(objectToMap({'0,0': 'x', '0,1': 'x', '1,0': 'x'}), 2, 2)).toBe(false);
    });

    it('should return true when all spaces are filled', () => {
      expect(isCat(objectToMap({'0,0': 'x', '0,1': 'o', '1,0': 'x', '2,2': 'o'}), 2, 2)).toBe(true);
    });
  });

  describe('getColumnScore', () => {
    it('gives 100000 for 3 in a row, 10 for two in a row, and 1 for one in a row', () => {
      const input = {
        '0,0': 'x',
        '0,1': 'o',
        '0,2': 'x',
        '0,3': 'x',
        '0,4': 'x',
      } as {[key: Coordinate]: Choice};

      expect(getColumnScore(objectToMap(input), 0, 5)).toEqual(100000);
    });

    it('smoketest missing items', () => {
      expect(getColumnScore(new Map(), 4, 4)).toEqual(0);
    });
  });

  // https://www3.ntu.edu.sg/home/ehchua/programming/java/javagame_tictactoe_ai.html
  describe('getTotalColumnScore', () => {
    it('gives 100 for 3 in a row, 10 for two in a row, and 1 for one in a row', () => {
      const input = {
        '0,0': 'x',
        '0,1': 'x',
        '0,2': 'x',
        '1,1': 'o',
        '2,1': 'o',
        '2,2': 'o',
      } as {[key: Coordinate]: Choice};

      expect(getTotalColumnScore(objectToMap(input), 3, 3)).toEqual(99989);
    });

    it('gives negatives for Os', () => {
      const input = {
        '0,2': 'x',
        '1,0': 'o',
        '1,1': 'o',
        '1,2': 'o',
      } as {[key: Coordinate]: Choice};

      expect(getTotalColumnScore(objectToMap(input), 3, 3)).toEqual(-99999);
    });

    it('smoketest missing items', () => {
      expect(getTotalColumnScore(new Map(), 4, 4)).toEqual(0);
    });
  });

  describe('getRowScore', () => {
    it('gives 100000 for 3 in a row, 10 for two in a row, and 1 for one in a row', () => {
      const input = {
        '0,0': 'x',
        '1,0': 'o',
        '2,0': 'x',
        '3,0': 'x',
        '4,0': 'x',
      } as {[key: Coordinate]: Choice};

      expect(getRowScore(objectToMap(input), 5, 0)).toEqual(100000);
    });

    it('smoketest missing items', () => {
      expect(getRowScore(new Map(), 4, 4)).toEqual(0);
    });
  });

  // https://www3.ntu.edu.sg/home/ehchua/programming/java/javagame_tictactoe_ai.html
  describe('getTotalColumnScore', () => {
    it('gives 100 for 3 in a row, 10 for two in a row, and 1 for one in a row', () => {
      const input = {
        '0,0': 'x',
        '1,0': 'x',
        '2,0': 'x',
        '1,1': 'o',
        '2,1': 'o',
        '2,2': 'o',
      } as {[key: Coordinate]: Choice};

      expect(getTotalRowScore(objectToMap(input), 3, 3)).toEqual(99989);
    });

    it('gives negatives for Os', () => {
      const input = {
        '0,2': 'x',
        '0,1': 'o',
        '1,1': 'o',
        '2,1': 'o',
      } as {[key: Coordinate]: Choice};

      expect(getTotalRowScore(objectToMap(input), 3, 3)).toEqual(-99999);
    });

    it('smoketest missing items', () => {
      expect(getTotalRowScore(new Map(), 4, 4)).toEqual(0);
    });
  });

  describe('getTotalDiagonalScore', () => {
    it('gives 100 for 3 in a row, 10 for two in a row, and 1 for one in a row', () => {
      const input = {
        '0,0': 'x',
        '1,0': 'x',
        '2,0': 'o',
        '3,0': 'o',
        '0,1': 'x',
        '1,1': 'x',
        '2,1': 'o',
        '3,1': 'o',
        '0,2': 'x',
        '1,2': 'x',
        '2,2': 'x',
        '3,2': 'o',
        '0,3': 'o',
        '1,3': 'o',
        '2,3': 'o',
        '3,3': 'o',
      } as {[key: Coordinate]: Choice};

      expect(getTotalDiagonalScore(objectToMap(input), 4, 4)).toEqual(99987);
    });

    it('smoketest missing items', () => {
      expect(getTotalDiagonalScore(new Map(), 4, 4)).toEqual(0);
    });
  });

  describe('getTotalReverseDiagonalScore', () => {
    it('gives 100 for 3 in a row, 10 for two in a row, and 1 for one in a row', () => {
      const input = {
        '0,0': 'x',
        '1,0': 'x',
        '2,0': 'o',
        '3,0': 'o',
        '0,1': 'x',
        '1,1': 'x',
        '2,1': 'o',
        '3,1': 'o',
        '0,2': 'x',
        '1,2': 'o',
        '2,2': 'x',
        '3,2': 'o',
        '0,3': 'x',
        '1,3': 'o',
        '2,3': 'o',
        '3,3': 'o',
      } as {[key: Coordinate]: Choice};

      expect(getTotalReverseDiagonalScore(objectToMap(input), 4, 4)).toEqual(-99991);
    });

    it('smoketest missing items', () => {
      expect(getTotalReverseDiagonalScore(new Map(), 4, 4)).toEqual(0);
    });
  });

  describe('getTotalScore', () => {
    it('smoketests 4x4', () => {
      const input = {
        '0,0': 'x',
        '1,0': 'o',
        '2,0': 'x',
        '3,0': 'o',
        '0,1': 'o',
        '1,1': 'x',
        '2,1': 'x',
        '3,1': 'o',
        '0,2': 'x',
        '1,2': 'o',
        '2,2': 'o',
        '3,2': 'x',
        '0,3': 'o',
        '1,3': 'x',
        '2,3': 'x',
        '3,3': 'o',
      } as {[key: Coordinate]: Choice};

      expect(getTotalScore(objectToMap(input), 4, 4)).toEqual(99997);
    });

    it('smoketest missing items', () => {
      expect(getTotalScore(new Map(), 4, 4)).toEqual(0);
    });
  });
});
