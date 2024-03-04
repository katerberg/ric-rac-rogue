import {NumberCoordinates, State} from './types';

export function getAvailableMoves(state: State): NumberCoordinates[] {
  const moves: NumberCoordinates[] = [];
  for (let x = 0; x < state.columns; x++) {
    for (let y = 0; y < state.rows; y++) {
      if (state.selections.get(`${x},${y}`) === undefined) {
        moves.push({x, y});
      }
    }
  }
  return moves;
}
