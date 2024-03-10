import {Board} from './classes/Board';
import {numberCoordsToCoords} from './coordinatesHelper';
import {NumberCoordinates} from './types';
import {checkTerminal} from './winCalculation';

export function getWinningMove(board: Board, requiredWin: number): NumberCoordinates | undefined {
  return board.getAvailableMoves().find((move) => {
    const newBoard = new Board({...board, selections: new Map(board.selections)});
    newBoard.selections.set(numberCoordsToCoords(move), 'o');
    if (checkTerminal(newBoard, requiredWin).winner === 'o') {
      return move;
    }
    return false;
  });
}

export function getBlockingMove(board: Board, requiredWin: number): NumberCoordinates | undefined {
  return board.getAvailableMoves().find((move) => {
    const newBoard = new Board({...board, selections: new Map(board.selections)});
    newBoard.selections.set(numberCoordsToCoords(move), 'x');
    if (checkTerminal(newBoard, requiredWin).winner === 'x') {
      return move;
    }
    return false;
  });
}
