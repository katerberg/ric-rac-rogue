// import {Board} from './classes/Board';
// import {numberCoordsToCoords} from './coordinatesHelper';
// import {Moves, NumberCoordinates, State} from './types';
// import {checkTerminal, getTotalScore} from './winCalculation';

// const transpositionTable: Record<string, {bestScore: number; bestMove: NumberCoordinates}> = {};

// export function boardToTranspositionTableKey(selections: Moves, columns: number, rows: number): string {
//   let key = '';
//   for (let y = 0; y < columns; y++) {
//     for (let x = 0; x < rows; x++) {
//       key += selections.get(`${x},${y}`) ?? '_';
//     }
//     key += ',';
//   }
//   key = key.slice(0, -1);
//   return key;
// }

// export function boardToTranspositionTableKeys(selections: Moves, columns: number, rows: number): string[] {
//   let key = '';
//   let keyInverted = '';
//   for (let y = 0; y < columns; y++) {
//     for (let x = 0; x < rows; x++) {
//       key += selections.get(`${x},${y}`) ?? '_';
//       keyInverted += selections.get(`${y},${x}`) ?? '_';
//     }
//     key += ',';
//     keyInverted += ',';
//   }
//   key = key.slice(0, -1);
//   keyInverted = keyInverted.slice(0, -1);
//   return [key, keyInverted];
// }

// export function getBestMove(
//   state: State,
//   pruning: boolean,
//   isMaximizing?: boolean,
//   depth = 0,
//   alpha = -1_000_000,
//   beta = 1_000_000,
// ): {bestScore: number; bestMove: NumberCoordinates} {
//   if (depth === 0) {
//     const props = Object.getOwnPropertyNames(transpositionTable);
//     for (let i = 0; i < props.length; i++) {
//       delete transpositionTable[props[i]];
//     }
//   }
//   const maximizing = isMaximizing !== undefined ? isMaximizing : state.currentPlayer === 'x';
//   const availableMoves = state.board.getAvailableMoves();
//   let [bestMove] = availableMoves;
//   if (depth > state.maxDepth) {
//     return {
//       bestScore:
//         getTotalScore(state.board.selections, state.board.columns, state.board.rows, state.requiredWin) +
//         1000 * (maximizing ? -1 : 1),
//       bestMove,
//     };
//   }
//   //Initialize best to the worst possible value and have a default move
//   const WORST_POSSIBLE_SCORE = maximizing ? -1_000_000 : 1_000_000;
//   // const DEPTH_MULTIPLIER = maximizing ? 0.1 : -0.1;
//   const DEPTH_MULTIPLIER = 0.1;
//   let bestScore = WORST_POSSIBLE_SCORE;
//   let newAlpha = alpha;
//   let newBeta = beta;

//   for (let i = 0; i < availableMoves.length; i++) {
//     const move = availableMoves[i];
//     //Initialize a new board with a copy of our current state
//     const child: State = {
//       ...state,
//       board: new Board({
//         columns: state.board.columns,
//         rows: state.board.rows,
//         selections: new Map(state.board.selections),
//       }),
//       currentPlayer: maximizing ? 'o' : 'x',
//     };
//     child.board.selections.set(numberCoordsToCoords(move), maximizing ? 'x' : 'o');
//     const terminalState = checkTerminal(child.board, child.requiredWin);
//     if (terminalState.isTerminal) {
//       if (terminalState.isWinner) {
//         // if it's terminal, get the best score minus how long it took to get there
//         bestScore = WORST_POSSIBLE_SCORE * -1 - depth * DEPTH_MULTIPLIER;
//         bestMove = move;
//         break;
//       }
//       if (terminalState.isCat) {
//         if ((maximizing && 0 > bestScore) || (!maximizing && 0 < bestScore)) {
//           // if it's terminal, it's zero because it's better than any loss but worse than any win
//           bestScore = 0;
//           bestMove = move;
//         }
//       }
//     } else {
//       let nodeValue: {bestScore: number; bestMove: NumberCoordinates};
//       const transpositionTableKey = boardToTranspositionTableKey(
//         child.board.selections,
//         child.board.columns,
//         child.board.rows,
//       );
//       if (transpositionTable[transpositionTableKey]) {
//         nodeValue = transpositionTable[transpositionTableKey];
//       } else {
//         nodeValue = getBestMove(child, pruning, !maximizing, depth + 1, newAlpha, newBeta);
//         boardToTranspositionTableKeys(child.board.selections, child.board.columns, child.board.rows).forEach((key) => {
//           if (!transpositionTable[key]) {
//             transpositionTable[key] = nodeValue;
//           }
//         });
//       }
//       // alpha beta pruning
//       if ((maximizing && nodeValue.bestScore > bestScore) || (!maximizing && nodeValue.bestScore < bestScore)) {
//         ({bestScore} = nodeValue);
//         bestMove = move;
//         if (pruning) {
//           if (maximizing) {
//             newAlpha = Math.max(bestScore, newAlpha);
//           } else if (!maximizing) {
//             newBeta = Math.min(bestScore, newBeta);
//           }
//         }
//       }
//     }
//     if (newBeta <= newAlpha) {
//       break;
//     }
//   }
//   return {bestScore, bestMove};
// }

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-param-reassign */
import {Board} from './classes/Board';
import {numberCoordsToCoords} from './coordinatesHelper';
import {Moves, NumberCoordinates, State} from './types';
import {checkTerminal, getTotalScore} from './winCalculation';

const transpositionTable: Record<string, {bestScore: number; bestMove: NumberCoordinates}> = {};

function cloneBoard(board: Board): Board {
  return new Board({
    columns: board.columns,
    rows: board.rows,
    selections: new Map(board.selections),
  });
}

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

// // * Debugging
// // Temporary call count to make sure the pruning is _actually_ pruning
// let getBestMoveCallCount = 0;
// // Pretty gnarly debugging string that ultimately stores the state of
// // the board at each depth of the recursive function as strings that
// // are indented according to depth to get a hacky kind of tree view of
// // the calls and scoring
// let debugStateStrings: string[] = [];
// // Builds aformentioned hacky tree view of the calls and scoring
// const printState = (state: State, msg: string, depth: number, score: number): string => {
//   const indentSize = depth * 15;
//   const indent = ' '.repeat(indentSize);
//   let result = `${indent + msg}\n`;
//   result += `${indent}player: ${state.currentPlayer}\n`;
//   result += `${indent}score: ${score}\n`;
//   const indentedBoardString = state.board
//     .toString()
//     .split('\n')
//     .map((line) => indent + line)
//     .join('\n');
//   result += indentedBoardString;
//   return result;
// };

// Same as above but for printing a pruning message
function printPruningMessage(depth: number): string {
  const indentSize = depth * 15;
  const indent = ' '.repeat(indentSize);
  return `${indent}-- pruning -- \n`;
}
// * Debugging

const BEST_MINIMIZING_SCORE = 1_000_000;
const BEST_MAXIMIZING_SCORE = -1_000_000;

export function getBestMove(
  state: State,
  pruning: boolean,
  depth = 0,
  alpha = -1_000_000,
  beta = 1_000_000,
): {
  bestScore: number;
  // should probably be `| null` instead but whatever
  bestMove: NumberCoordinates | undefined;
} {
  // removed the isMaximizing param just to minimize the number of
  // things I had to think about at the time
  const isMaximizingPlayer = state.currentPlayer === 'x';
  // getBestMoveCallCount++;

  // * Return Score if Terminal State
  const terminalState = checkTerminal(state.board, state.requiredWin);
  if (terminalState.isTerminal) {
    // Game has a winner
    if (terminalState.isWinner) {
      if (state.currentPlayer === 'x') {
        const depthWeightedScore = BEST_MAXIMIZING_SCORE + depth;
        // debugStateStrings.push(printState(state, `state at depth ${depth} (o wins)`, depth, depthWeightedScore));
        return {
          bestScore: depthWeightedScore,
          bestMove: undefined,
        };
      }
      if (state.currentPlayer === 'o') {
        const depthWeightedScore = BEST_MINIMIZING_SCORE - depth;
        // debugStateStrings.push(printState(state, `state at depth ${depth} (x wins)`, depth, depthWeightedScore));
        return {
          bestScore: depthWeightedScore,
          bestMove: undefined,
        };
      }
    }
    // Game is a draw
    if (terminalState.isCat) {
      // debugStateStrings.push(printState(state, `state at depth ${depth} (draw)`, depth, 0));
      return {bestScore: 0, bestMove: undefined};
    }
  }

  let bestScore = isMaximizingPlayer ? BEST_MAXIMIZING_SCORE : BEST_MINIMIZING_SCORE;
  let bestMove: NumberCoordinates | undefined = undefined;

  const availableMoves = state.board.getAvailableMoves();

  if (depth > state.maxDepth) {
    const [defaultMove] = availableMoves;
    return {
      bestScore:
        getTotalScore(state.board.selections, state.board.columns, state.board.rows, state.requiredWin) +
        1000 * (isMaximizingPlayer ? -1 : 1),
      bestMove: defaultMove,
    };
  }

  for (const move of availableMoves) {
    const nextBoard = cloneBoard(state.board);
    const nextPlayer = state.currentPlayer === 'x' ? 'o' : 'x';

    const nextState: State = {
      ...state,
      board: nextBoard,
      currentPlayer: nextPlayer,
    };

    nextState.board.selections.set(numberCoordsToCoords(move), isMaximizingPlayer ? 'x' : 'o');

    const result = getBestMove(nextState, pruning, depth + 1, alpha, beta);

    // alpha beta pruning
    if ((isMaximizingPlayer && result.bestScore > bestScore) || (!isMaximizingPlayer && result.bestScore < bestScore)) {
      ({bestScore} = result);
      bestMove = move;

      if (pruning) {
        if (isMaximizingPlayer) {
          alpha = Math.max(alpha, bestScore);
        } else if (!isMaximizingPlayer) {
          beta = Math.min(beta, bestScore);
        }
        if (beta <= alpha) {
          // debugStateStrings.push(printPruningMessage(depth));
          break;
        }
      }
    }

    if (pruning && beta <= alpha) {
      // debugStateStrings.push(printPruningMessage(depth));
      break;
    }
  }

  // debugStateStrings.push(printState(state, `state at depth ${depth}`, depth, bestScore));

  // if (depth === 0) {
  //   debugStateStrings.reverse();
  //   // eslint-disable-next-line no-console
  //   // console.log(debugStateStrings.join('\n\n'));
  //   // eslint-disable-next-line no-console
  //   console.log(`getBestMoveCallCount: ${getBestMoveCallCount}`);
  //   getBestMoveCallCount = 0;
  //   debugStateStrings = [];
  // }

  return {
    bestScore,
    bestMove,
  };
}
