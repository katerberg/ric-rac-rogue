import {Board} from '../board';
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
    room: {rules: []},
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

      getBestMove(input);

      expect(new Date().getTime() - time).toMatchSnapshot();
    });

    it('4x4 with 3 in a row', () => {
      const input = {...getEmptyBoardState(4, 4)};

      const time = new Date().getTime();
      getBestMove(input);

      expect(new Date().getTime() - time).toMatchSnapshot();
    });

    it.skip('4x10 with 3 in a row', () => {
      const input = {...getEmptyBoardState(4, 10)};

      const time = new Date().getTime();
      getBestMove(input);

      expect(new Date().getTime() - time).toMatchSnapshot();
    });

    it.skip('4x20 with 3 in a row', () => {
      const input = {...getEmptyBoardState(4, 20)};

      const time = new Date().getTime();
      getBestMove(input);

      expect(new Date().getTime() - time).toMatchSnapshot();
    });
  });
  describe('limited depth', () => {
    it('4x4 with 3 in a row', () => {
      const input = {...getEmptyBoardState(4, 4), maxDepth: 10};

      const time = new Date().getTime();
      getBestMove(input);

      expect(new Date().getTime() - time).toMatchSnapshot();
    });

    it.skip('4x4 with 4 in a row', () => {
      const input = {...getEmptyBoardState(4, 4), requiredWin: 4, maxDepth: 10};

      const time = new Date().getTime();
      getBestMove(input);

      expect(new Date().getTime() - time).toMatchSnapshot();
    });
  });
});
