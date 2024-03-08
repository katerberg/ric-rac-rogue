import {Board} from '../classes/Board';
import {getBestMove} from '../minimax';
import {State} from '../types';

function getEmptyBoardState(rows = 3, columns = 3): State {
  return {
    requiredWin: 3,
    maxDepth: 1200,
    board: new Board({
      columns,
      rows,
      selections: new Map(),
    }),
    currentPlayer: 'x',
  };
}

describe('snapshot', () => {
  beforeEach(() => {
    jest.setTimeout(100_000);
  });
  describe('infinite depth', () => {
    it('3x3 with 3 in a row', () => {
      const input = getEmptyBoardState();

      const time = new Date().getTime();

      getBestMove(input, true);

      expect(new Date().getTime() - time).toMatchSnapshot();
    });

    it('4x4 with 3 in a row', () => {
      const input = {...getEmptyBoardState(4, 4)};

      const time = new Date().getTime();
      getBestMove(input, true);

      expect(new Date().getTime() - time).toMatchSnapshot();
    });

    it('4x10 with 3 in a row', () => {
      const input = {...getEmptyBoardState(4, 10)};

      const time = new Date().getTime();
      getBestMove(input, true);

      expect(new Date().getTime() - time).toMatchSnapshot();
    });

    it('4x20 with 3 in a row', () => {
      const input = {...getEmptyBoardState(4, 20)};

      const time = new Date().getTime();
      getBestMove(input, true);

      expect(new Date().getTime() - time).toMatchSnapshot();
    });
  });

  describe('limited depth', () => {
    it('4x4 with 3 in a row depth 10', () => {
      const input = {...getEmptyBoardState(4, 4), maxDepth: 10};

      const time = new Date().getTime();
      getBestMove(input, true);

      expect(new Date().getTime() - time).toMatchSnapshot();
    });

    it('5x5 with 3 in a row depth 6', () => {
      const input = {...getEmptyBoardState(5, 5), maxDepth: 6};

      const time = new Date().getTime();
      getBestMove(input, true);

      expect(new Date().getTime() - time).toMatchSnapshot();
    });

    it('5x5 with 4 in a row depth 6', () => {
      const input = {...getEmptyBoardState(5, 5), requiredWin: 4, maxDepth: 6};

      const time = new Date().getTime();
      getBestMove(input, true);

      expect(new Date().getTime() - time).toMatchSnapshot();
    });

    it('4x10 with 4 in a row depth 8', () => {
      const input = {...getEmptyBoardState(5, 5), requiredWin: 4, maxDepth: 6};

      const time = new Date().getTime();
      getBestMove(input, true);

      expect(new Date().getTime() - time).toMatchSnapshot();
    });

    it('6x6 with 3 in a row depth 6', () => {
      const input = {...getEmptyBoardState(6, 6), maxDepth: 6};

      const time = new Date().getTime();
      getBestMove(input, true);

      expect(new Date().getTime() - time).toMatchSnapshot();
    });

    it('4x4 with 4 in a row depth 10', () => {
      const input = {...getEmptyBoardState(4, 4), requiredWin: 4, maxDepth: 10};

      const time = new Date().getTime();
      getBestMove(input, true);

      expect(new Date().getTime() - time).toMatchSnapshot();
    });
  });

  describe.only('pruning limits', () => {
    for (let x = 2; x < 5; x++) {
      for (let y = 2; y < 8; y++) {
        for (let requiredWin = 3; requiredWin < 4; requiredWin++) {
          for (let maxDepth = 6; maxDepth < 9; maxDepth += 2) {
            // eslint-disable-next-line @typescript-eslint/no-loop-func
            it.skip(`for ${x}x${y} with required win ${requiredWin} max depth ${maxDepth}`, () => {
              const input = {...getEmptyBoardState(x, y), requiredWin, maxDepth: 6};
              const time = new Date().getTime();
              getBestMove(input, false);

              expect(new Date().getTime() - time).toMatchSnapshot();
            });
          }
        }
      }
    }
    for (let x = 2; x < 5; x++) {
      for (let y = 2; y < 4; y++) {
        for (let requiredWin = 4; requiredWin < 5; requiredWin++) {
          for (let maxDepth = 6; maxDepth < 7; maxDepth += 2) {
            // eslint-disable-next-line @typescript-eslint/no-loop-func
            it(`for ${x}x${y} with required win ${requiredWin} max depth ${maxDepth}`, () => {
              const input = {...getEmptyBoardState(x, y), requiredWin, maxDepth: 6};
              const time = new Date().getTime();
              getBestMove(input, false);

              expect(new Date().getTime() - time).toMatchSnapshot();
            });
          }
        }
      }
    }
  });
});
