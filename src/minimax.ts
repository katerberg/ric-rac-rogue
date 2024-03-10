import {Board} from './classes/Board';
import {numberCoordsToCoords} from './coordinatesHelper';
import {Moves, NumberCoordinates, State, TurnOrderType} from './types';
import {checkTerminal, getTotalScore} from './winCalculation';

const transpositionTable: Record<string, {bestScore: number; bestMove: NumberCoordinates}> = {};

export function boardToTranspositionTableKey(selections: Moves, columns: number, rows: number): string {
  let key = '';
  for (let y = 0; y < columns; y++) {
    for (let x = 0; x < rows; x++) {
      key += selections.get(`${x},${y}`) ?? '_';
    }
    key += ',';
  }
  key = key.slice(0, -1);
  return key;
}

export function boardToTranspositionTableKeys(selections: Moves, columns: number, rows: number): string[] {
  let key = '';
  let keyInverted = '';
  for (let y = 0; y < columns; y++) {
    for (let x = 0; x < rows; x++) {
      key += selections.get(`${x},${y}`) ?? '_';
      keyInverted += selections.get(`${y},${x}`) ?? '_';
    }
    key += ',';
    keyInverted += ',';
  }
  key = key.slice(0, -1);
  keyInverted = keyInverted.slice(0, -1);
  return [key, keyInverted];
}

export function getBestMove(
  state: State,
  pruning: boolean,
  turnOrderType: TurnOrderType,
  previousMaximizing?: boolean,
  isMaximizing?: boolean,
  depth = 0,
  alpha = -1_000_000,
  beta = 1_000_000,
): {bestScore: number; bestMove: NumberCoordinates} {
  if (depth === 0) {
    const props = Object.getOwnPropertyNames(transpositionTable);
    for (let i = 0; i < props.length; i++) {
      delete transpositionTable[props[i]];
    }
  }
  const maximizing = isMaximizing !== undefined ? isMaximizing : state.currentPlayer === 'x';
  const availableMoves = state.board.getAvailableMoves();
  let [bestMove] = availableMoves;
  if (depth > state.maxDepth) {
    return {
      bestScore:
        getTotalScore(state.board.selections, state.board.columns, state.board.rows, state.requiredWin) +
        1000 * (maximizing ? -1 : 1),
      bestMove,
    };
  }
  //Initialize best to the worst possible value and have a default move
  const WORST_POSSIBLE_SCORE = maximizing ? -1_000_000 : 1_000_000;
  // const DEPTH_MULTIPLIER = maximizing ? 0.1 : -0.1;
  const DEPTH_MULTIPLIER = 0.1;
  let bestScore = WORST_POSSIBLE_SCORE;
  let newAlpha = alpha;
  let newBeta = beta;

  for (let i = 0; i < availableMoves.length; i++) {
    const move = availableMoves[i];
    //Initialize a new board with a copy of our current state
    const child: State = {
      ...state,
      board: new Board({
        columns: state.board.columns,
        rows: state.board.rows,
        selections: new Map(state.board.selections),
      }),
      currentPlayer: maximizing ? 'o' : 'x', //irrelevant and vestigial
    };
    child.board.selections.set(numberCoordsToCoords(move), maximizing ? 'x' : 'o');
    const terminalState = checkTerminal(child.board, child.requiredWin);
    if (terminalState.isTerminal) {
      if (terminalState.isWinner) {
        // if it's terminal, get the best score minus how long it took to get there
        bestScore = WORST_POSSIBLE_SCORE * -1 - depth * DEPTH_MULTIPLIER;
        bestMove = move;
        break;
      }
      if (terminalState.isCat) {
        if ((maximizing && 0 > bestScore) || (!maximizing && 0 < bestScore)) {
          // if it's terminal, it's zero because it's better than any loss but worse than any win
          bestScore = 0;
          bestMove = move;
        }
      }
    } else {
      let nodeValue: {bestScore: number; bestMove: NumberCoordinates};
      const transpositionTableKey = boardToTranspositionTableKey(
        child.board.selections,
        child.board.columns,
        child.board.rows,
      );
      if (transpositionTable[transpositionTableKey]) {
        nodeValue = transpositionTable[transpositionTableKey];
      } else {
        let nextMaximizing = !maximizing;
        if (turnOrderType === TurnOrderType.TWO_TO_ONE && previousMaximizing !== maximizing && !maximizing) {
          nextMaximizing = maximizing;
        }
        nodeValue = getBestMove(
          child,
          pruning,
          turnOrderType,
          maximizing,
          nextMaximizing,
          depth + 1,
          newAlpha,
          newBeta,
        );
        boardToTranspositionTableKeys(child.board.selections, child.board.columns, child.board.rows).forEach((key) => {
          if (!transpositionTable[key]) {
            transpositionTable[key] = nodeValue;
          }
        });
      }
      // alpha beta pruning
      if ((maximizing && nodeValue.bestScore > bestScore) || (!maximizing && nodeValue.bestScore < bestScore)) {
        ({bestScore} = nodeValue);
        bestMove = move;
        if (pruning) {
          if (maximizing) {
            newAlpha = Math.max(bestScore, newAlpha);
          } else if (!maximizing) {
            newBeta = Math.min(bestScore, newBeta);
          }
        }
      }
    }
    if (newBeta <= newAlpha) {
      break;
    }
  }
  return {bestScore, bestMove};
}
