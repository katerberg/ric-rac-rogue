import {Board} from './classes/Board';
import {boardToTranspositionTableKeys, getBestMove} from './minimax';
import {Choice, Coordinate, State} from './types';

function getFullBoardState(): State {
  const state = {
    requiredWin: 3,
    currentPlayer: 'x' as Choice,
    maxDepth: 1200,
    room: {rules: []},
    board: new Board({
      columns: 3,
      rows: 3,
      selections: new Map<Coordinate, Choice>(),
    }),
  };

  state.board.selections.set('0,0', 'x');
  state.board.selections.set('1,0', 'x');
  state.board.selections.set('2,0', 'o');
  state.board.selections.set('0,1', 'x');
  state.board.selections.set('1,1', 'x');
  state.board.selections.set('2,1', 'o');
  state.board.selections.set('0,2', 'o');
  state.board.selections.set('1,2', 'o');
  state.board.selections.set('2,2', 'x');
  return state;
}

describe('minimax', () => {
  describe('getBestMove', () => {
    it('finds a winning terminal move for x', () => {
      const input = getFullBoardState();
      input.board.selections.delete('2,2');

      const result = getBestMove(input, false);

      expect(result.bestMove).toEqual({x: 2, y: 2});
      expect(result.bestScore).toEqual(1_000_000);
    });

    it('finds a winning terminal move for o', () => {
      const input = getFullBoardState();
      input.board.selections = new Map();
      input.currentPlayer = 'o';
      input.board.selections.set('0,0', 'x');
      input.board.selections.set('1,1', 'o');
      input.board.selections.set('0,1', 'o');
      input.board.selections.set('2,2', 'x');
      input.board.selections.set('0,2', 'x');

      const result = getBestMove(input, true);

      expect(result.bestMove).toEqual({x: 2, y: 1});
      expect(result.bestScore).toEqual(-1_000_000);
    });

    it('finds move in two turns for x', () => {
      const input = getFullBoardState();
      input.board.selections = new Map();
      input.board.selections.set('0,0', 'x');
      input.board.selections.set('1,1', 'o');
      input.board.selections.set('2,0', 'o');
      input.board.selections.set('2,2', 'x');

      const result = getBestMove(input, false);

      expect(result.bestMove).toEqual({x: 0, y: 2});
      expect(result.bestScore).toEqual(1_000_000 - 0.2);
    });

    it('finds blocking move to end in cat game for x', () => {
      const input = getFullBoardState();
      input.board.selections = new Map();
      input.board.selections.set('0,0', 'o');
      input.board.selections.set('1,0', 'o');
      input.board.selections.set('2,0', 'x');
      input.board.selections.set('0,1', 'x');
      input.board.selections.set('2,1', 'o');
      input.board.selections.set('1,2', 'o');
      input.board.selections.set('2,2', 'x');

      const result = getBestMove(input, false);

      expect(result.bestMove).toEqual({x: 1, y: 1});
      expect(result.bestScore).toEqual(0);
    });

    it('finds blocking move in 4x4 to end in cat game', () => {
      const input = getFullBoardState();
      input.board.columns = 4;
      input.board.rows = 4;
      input.currentPlayer = 'o';
      input.board.selections = new Map();
      input.board.selections.set('0,0', 'o');
      input.board.selections.set('2,0', 'x');
      input.board.selections.set('2,1', 'x');

      const result = getBestMove(input, false);

      expect(result.bestMove).toEqual({x: 2, y: 2});
      expect(result.bestScore).toEqual(1_000_000 - 0.3);
    });

    it('finds cat game from middle', () => {
      const input = getFullBoardState();
      input.board.selections = new Map();
      input.currentPlayer = 'o';
      input.board.selections.set('0,0', 'x');
      input.board.selections.set('1,1', 'o');
      input.board.selections.set('2,2', 'x');

      const result = getBestMove(input, false);

      expect(result.bestMove).toEqual({x: 0, y: 1});
      expect(result.bestScore).toEqual(0);
    });
  });

  describe('boardToTranspositionTableKeys', () => {
    it('translates empty 3x3', () => {
      expect(boardToTranspositionTableKeys(new Map(), 3, 3)).toEqual(['___,___,___', '___,___,___']);
    });

    it('translates populated 4x3, including inverting and 180 degrees', () => {
      const selections = new Map();
      selections.set('1,0', 'x');
      selections.set('0,1', 'o');

      expect(boardToTranspositionTableKeys(selections, 3, 4)).toEqual(['_x__,o___,____', '_o__,x___,____']);
    });
  });
});
