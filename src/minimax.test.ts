import {boardToTranspositionTableKeys, getBestMove} from './minimax';
import {Choice, Coordinate, State} from './types';

function getFullBoardState(): State {
  const state = {
    columns: 3,
    rows: 3,
    requiredWin: 3,
    maxDepth: 1200,
    selections: new Map<Coordinate, Choice>(),
    currentPlayer: 'x' as Choice,
  };

  state.selections.set('0,0', 'x');
  state.selections.set('1,0', 'x');
  state.selections.set('2,0', 'o');
  state.selections.set('0,1', 'x');
  state.selections.set('1,1', 'x');
  state.selections.set('2,1', 'o');
  state.selections.set('0,2', 'o');
  state.selections.set('1,2', 'o');
  state.selections.set('2,2', 'x');
  return state;
}

describe('minimax', () => {
  describe('getBestMove', () => {
    it('finds a winning terminal move for x', () => {
      const input = getFullBoardState();
      input.selections.delete('2,2');

      const result = getBestMove(input);

      expect(result.bestMove).toEqual({x: 2, y: 2});
      expect(result.bestScore).toEqual(1_000_000);
    });

    it('finds a winning terminal move for o', () => {
      const input = getFullBoardState();
      input.selections.delete('2,2');
      input.currentPlayer = 'o';

      const result = getBestMove(input);

      expect(result.bestMove).toEqual({x: 2, y: 2});
      expect(result.bestScore).toEqual(-1_000_000);
    });

    it('finds move in two turns for x', () => {
      const input = getFullBoardState();
      input.selections = new Map();
      input.selections.set('0,0', 'x');
      input.selections.set('1,1', 'o');
      input.selections.set('2,0', 'o');
      input.selections.set('2,2', 'x');

      const result = getBestMove(input);

      expect(result.bestMove).toEqual({x: 0, y: 2});
      expect(result.bestScore).toEqual(1_000_000 - 0.2);
    });

    it('finds blocking move to end in cat game for x', () => {
      const input = getFullBoardState();
      input.selections = new Map();
      input.selections.set('0,0', 'o');
      input.selections.set('1,0', 'o');
      input.selections.set('2,0', 'x');
      input.selections.set('0,1', 'x');
      input.selections.set('2,1', 'o');
      input.selections.set('1,2', 'o');
      input.selections.set('2,2', 'x');

      const result = getBestMove(input);

      expect(result.bestMove).toEqual({x: 1, y: 1});
      expect(result.bestScore).toEqual(0);
    });

    it('finds blocking move in 4x4 to end in cat game', () => {
      const input = getFullBoardState();
      input.currentPlayer = 'o';
      input.columns = 4;
      input.rows = 4;
      input.selections = new Map();
      input.selections.set('0,0', 'o');
      input.selections.set('2,0', 'x');
      input.selections.set('2,1', 'x');

      const result = getBestMove(input);

      expect(result.bestMove).toEqual({x: 2, y: 2});
      expect(result.bestScore).toEqual(1_000_000 - 0.3);
    });

    it('finds cat game from middle', () => {
      const input = getFullBoardState();
      input.currentPlayer = 'o';
      input.selections = new Map();
      input.selections.set('0,0', 'x');
      input.selections.set('1,1', 'o');
      input.selections.set('2,2', 'x');

      const result = getBestMove(input);

      expect(result.bestMove).toEqual({x: 0, y: 1});
      expect(result.bestScore).toEqual(0);
    });
  });

  describe('boardToTranspositionTableKeys', () => {
    it('translates empty 3x3', () => {
      const input = getFullBoardState();
      input.selections = new Map();

      expect(boardToTranspositionTableKeys(input)).toEqual(['___,___,___', '___,___,___']);
    });

    it('translates populated 4x3, including inverting and 180 degrees', () => {
      const input = getFullBoardState();
      input.columns = 3;
      input.rows = 4;
      input.selections = new Map();
      input.selections.set('1,0', 'x');
      input.selections.set('0,1', 'o');

      expect(boardToTranspositionTableKeys(input)).toEqual(['_x__,o___,____', '_o__,x___,____']);
    });
  });
});
