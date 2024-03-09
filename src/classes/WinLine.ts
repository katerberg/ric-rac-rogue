import {NumberCoordinates} from '../types';

export class WinLine {
  drawStart: number;

  start: NumberCoordinates;

  end: NumberCoordinates;

  drawTime: number;

  constructor(start: NumberCoordinates, end: NumberCoordinates, drawStart: number) {
    this.drawStart = drawStart;
    this.drawTime = 500;
    this.start = start;
    this.end = end;
  }
}
