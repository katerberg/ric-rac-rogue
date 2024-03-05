import {getUrlParams} from '../environment';
import {Choice, Coordinate, Rule} from '../types';
import {Board} from './Board';

export class Level {
  board: Board;

  level: number;

  requiredWin: number;

  currentPlayer: Choice;

  maxDepth: number;

  rules: Rule[];

  constructor(level: number) {
    const urlParams = getUrlParams();
    const columns = urlParams.get('columns') || '3';
    const rows = urlParams.get('rows') || '3';
    this.level = level;
    this.board = new Board({
      columns: Number.parseInt(columns, 10),
      rows: Number.parseInt(rows, 10),
      selections: new Map<Coordinate, Choice>(),
    });
    this.requiredWin = 3;
    this.currentPlayer = 'x';
    this.maxDepth = 3;
    this.rules = [
      {
        name: 'Win: 3 in a row',
      },
      {
        name: 'Take turns',
      },
      {
        name: 'X goes first',
      },
    ];
  }
}
