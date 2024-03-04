import {getAvailableMoves} from './board';
import {numberCoordsToCoords} from './coordinatesHelper';
import {NumberCoordinates, State} from './types';
import {checkTerminal, getTotalScore} from './winCalculation';

const transpositionTable: Record<string, {bestScore: number; bestMove: NumberCoordinates}> = {};

export function boardToTranspositionTableKey(state: State): string {
  let key = '';
  for (let y = 0; y < state.columns; y++) {
    for (let x = 0; x < state.rows; x++) {
      key += state.selections.get(`${x},${y}`) ?? '_';
    }
    key += ',';
  }
  key = key.slice(0, -1);
  return key;
}

export function boardToTranspositionTableKeys(state: State): string[] {
  let key = '';
  let keyInverted = '';
  for (let y = 0; y < state.columns; y++) {
    for (let x = 0; x < state.rows; x++) {
      key += state.selections.get(`${x},${y}`) ?? '_';
      keyInverted += state.selections.get(`${y},${x}`) ?? '_';
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
  const availableMoves = getAvailableMoves(state);
  let [bestMove] = availableMoves;
  if (depth > state.maxDepth) {
    return {bestScore: getTotalScore(state.selections, state.columns, state.rows), bestMove};
  }
  //Initialize best to the worst possible value and have a default move
  const WORST_POSSIBLE_SCORE = maximizing ? -1_000_000 : 1_000_000;
  // const DEPTH_MULTIPLIER = maximizing ? 0.1 : -0.1;
  const DEPTH_MULTIPLIER = 0;
  let bestScore = WORST_POSSIBLE_SCORE;
  let newAlpha = alpha;
  let newBeta = beta;

  for (let i = 0; i < availableMoves.length; i++) {
    const move = availableMoves[i];
    //Initialize a new board with a copy of our current state
    const child: State = {
      ...state,
      currentPlayer: maximizing ? 'o' : 'x',
      selections: new Map(state.selections),
    };
    child.selections.set(numberCoordsToCoords(move), maximizing ? 'x' : 'o');
    const terminalState = checkTerminal(child);
    if (terminalState.isTerminal) {
      if (terminalState.isWinner) {
        // if it's terminal, get the best score minus how long it took to get there
        bestScore = WORST_POSSIBLE_SCORE * -1 - depth * DEPTH_MULTIPLIER;
        // eslint-disable-next-line no-console
        console.log('winner', bestScore, depth);
        // console.log('new best score', bestScore);
        bestMove = move;
        // lowestDepth = depth;
        break;
      }
      if (terminalState.isCat) {
        if ((maximizing && 0 > bestScore) || (!maximizing && 0 < bestScore)) {
          // if it's terminal, it's zero because it's better than any loss but worse than any win
          bestScore = 0;
          // console.log('new best score - cat', 0);
          bestMove = move;
        }
      }
      // if (depth === 0) {
      // console.log('terminal', availableMoves[i], bestMove, bestScore);
      // }
    } else {
      let nodeValue: {bestScore: number; bestMove: NumberCoordinates};
      const transpositionTableKey = boardToTranspositionTableKey(child);
      if (transpositionTable[transpositionTableKey]) {
        nodeValue = transpositionTable[transpositionTableKey];
      } else {
        nodeValue = getBestMove(child, !maximizing, depth + 1, newAlpha, newBeta);
        boardToTranspositionTableKeys(child).forEach((key) => {
          if (!transpositionTable[key]) {
            transpositionTable[key] = nodeValue;
          }
        });
      }
      if ((maximizing && nodeValue.bestScore > bestScore) || (!maximizing && nodeValue.bestScore < bestScore)) {
        // console.log('new best score from node', bestScore);
        ({bestScore} = nodeValue);
        bestMove = move;
        if (maximizing) {
          newAlpha = Math.max(bestScore, newAlpha);
        } else if (!maximizing) {
          newBeta = Math.min(bestScore, newBeta);
        }
      }
      if (depth === 0) {
        // console.log('not terminal', availableMoves[i], bestMove, bestScore);
      }
    }
    if (newBeta <= newAlpha) {
      break;
    }
  }
  if (depth === 0) {
    // eslint-disable-next-line no-console
    console.log('done', bestMove, bestScore);
  }
  return {bestScore, bestMove};
}