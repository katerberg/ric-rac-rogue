import * as P5 from 'p5';
import {COLORS} from '../colors';
import {coordsToNumberCoords} from '../coordinatesHelper';
import {getUrlParams} from '../environment';
import {getBestMove} from '../minimax';
import {Choice, Coordinate, NumberCoordinates, State} from '../types';
import {Board} from './Board';

const urlParams = getUrlParams();
const columns = urlParams.get('columns') || '3';
const rows = urlParams.get('rows') || '3';

const gameAxisWidth = 10;
const gameInnerPadding = 24;

const verticalPadding = 80;
const horizontalPadding = 0;

export class Game {
  state: State;

  p5: P5;

  gameWidth: number;

  gameHeight: number;

  loading: boolean;

  startTime: number;

  constructor() {
    this.startTime = Date.now();
    const sketch = (p: P5): void => {
      p.setup = (): void => {
        const canvas = p.createCanvas(this.gameWidth, this.gameHeight);
        canvas.id('game-canvas');
      };
      p.windowResized = (): void => this.resizeP();
      p.mouseClicked = (): void => this.handleClick();

      p.draw = (): void => {
        p.background(0, 0, 0);
        this.redrawBoard();
        this.redrawSelections();
      };
    };
    this.p5 = new P5(sketch, document.getElementById('canvas-container')!);
    this.gameWidth = this.p5.windowWidth - horizontalPadding;
    this.gameHeight = this.p5.windowHeight - verticalPadding;
    this.loading = false;
    this.state = {
      requiredWin: 3,
      currentPlayer: 'x' as Choice,
      maxDepth: 3,
      board: new Board({
        columns: Number.parseInt(columns, 10),
        rows: Number.parseInt(rows, 10),
        selections: new Map<Coordinate, Choice>(),
      }),
      room: {
        rules: [
          {
            name: 'Win: 3 in a row',
          },
          {
            name: 'Take turns',
          },
          {
            name: 'X goes first',
          },
        ],
      },
    } as State;
  }

  private resizeP(): void {
    const windowRatio = (window.innerWidth - horizontalPadding) / (window.innerHeight - verticalPadding);
    if (windowRatio < 0 || windowRatio > 10) {
      return;
    }

    this.gameWidth = this.p5.windowWidth - horizontalPadding;
    this.gameHeight = this.p5.windowHeight - verticalPadding;

    this.p5.resizeCanvas(this.p5.windowWidth - horizontalPadding, this.p5.windowHeight - verticalPadding);
  }

  private getCellCoordinatesFromClick(x: number, y: number): NumberCoordinates {
    // not strictly accurate since there are axes to consider but fine for now
    return {
      x: Math.floor((x / this.gameWidth) * this.state.board.columns),
      y: Math.floor((y / this.gameHeight) * this.state.board.rows),
    };
  }

  private getCellWidth(): number {
    return this.gameWidth / this.state.board.columns;
  }

  private getCellHeight(): number {
    return this.gameHeight / this.state.board.rows;
  }

  private handleClick(): void {
    const {x, y} = this.getCellCoordinatesFromClick(this.p5.mouseX, this.p5.mouseY);
    if (
      !this.loading &&
      this.state.board.selections.get(`${x},${y}`) === undefined &&
      x > -1 &&
      y > -1 &&
      x < this.state.board.columns &&
      y < this.state.board.rows &&
      this.startTime + 100 < Date.now()
    ) {
      this.loading = true;
      document.getElementById('loading')?.classList.add('loading');
      this.state.board.selections.set(`${x},${y}`, 'x');
      setTimeout(() => {
        const response = getBestMove(this.state, false);
        document.getElementById('loading')?.classList.remove('loading');
        this.loading = false;
        if (response.bestMove) {
          this.state.board.selections.set(`${response.bestMove.x},${response.bestMove.y}`, 'o');
        }
      }, 10);
    }
  }

  private redrawBoard(): void {
    const cellWidth = this.getCellWidth();
    const cellHeight = this.getCellHeight();
    this.p5.stroke(COLORS.gameAxes);
    this.p5.strokeCap(this.p5.ROUND);
    this.p5.strokeWeight(gameAxisWidth);
    this.p5.drawingContext.shadowBlur = 40;
    this.p5.drawingContext.shadowColor = COLORS.gameAxes;

    for (let col = 1; col < this.state.board.columns; col++) {
      this.p5.line(
        cellWidth * col - gameInnerPadding / 2,
        gameInnerPadding,
        cellWidth * col - gameInnerPadding / 2,
        this.gameHeight - gameInnerPadding * 2,
      );
      this.p5.line(
        cellWidth * col - gameInnerPadding / 2,
        gameInnerPadding,
        cellWidth * col - gameInnerPadding / 2,
        this.gameHeight - gameInnerPadding * 2,
      );
    }
    for (let row = 1; row < this.state.board.rows; row++) {
      this.p5.line(
        gameInnerPadding,
        cellHeight * row - gameInnerPadding / 2,
        this.gameWidth - gameInnerPadding * 2,
        cellHeight * row - gameInnerPadding / 2,
      );
      this.p5.line(
        gameInnerPadding,
        cellHeight * row - gameInnerPadding / 2,
        this.gameWidth - gameInnerPadding * 2,
        cellHeight * row - gameInnerPadding / 2,
      );
    }
  }

  private drawO(x: number, y: number): void {
    this.p5.stroke(COLORS.o);
    this.p5.fill(this.p5.color(0, 0));
    this.p5.strokeWeight(gameAxisWidth * 1.5);
    this.p5.drawingContext.shadowBlur = 40;
    this.p5.drawingContext.shadowColor = COLORS.o;
    const cellWidth = this.getCellWidth();
    const cellHeight = this.getCellHeight();

    const xStart = x * cellWidth + cellWidth * 0.5 - gameAxisWidth;
    const yStart = y * cellHeight + cellHeight * 0.5 - gameAxisWidth;
    const radius = Math.max(Math.min(cellWidth, cellHeight) * 0.8 - gameAxisWidth * 4, 10);
    this.p5.arc(xStart, yStart, radius, radius, 1.74533, 1.309);
    // repeat here as needed
    this.p5.arc(xStart, yStart, radius, radius, 1.74533, 1.309);
    this.p5.arc(xStart, yStart, radius, radius, 1.74533, 1.309);
  }

  private drawX(x: number, y: number): void {
    this.p5.stroke(COLORS.x);
    this.p5.strokeCap(this.p5.ROUND);
    this.p5.strokeWeight(gameAxisWidth);
    this.p5.drawingContext.shadowBlur = 20;
    this.p5.drawingContext.shadowColor = COLORS.x;
    const cellWidth = this.getCellWidth();
    const cellHeight = this.getCellHeight();
    const xStart = x * cellWidth + gameAxisWidth * 2;
    const yStart = y * cellHeight + gameAxisWidth * 2;
    const xEnd = xStart + cellWidth * 0.9 - gameAxisWidth * 4;
    const yEnd = yStart + cellHeight * 0.8 - gameAxisWidth * 4;
    // Long diagonal
    this.p5.line(xStart, yStart, xEnd, yEnd);
    // const angle = Math.tan((((yStart - yEnd) / (xEnd - xStart)) * Math.PI) / 180);
    // const distance = Math.sqrt(Math.pow(yStart - yEnd, 2) + Math.pow(xEnd - xStart, 2));
    // const distanceToMiddle = distance / 2;
    // console.log((angle * 180) / Math.PI, Math.sin(angle));
    // console.log(Math.cos(angle), Math.sin(angle), distance);
    // this.p5.line(xStart, yEnd, xStart + Math.cos(angle) * distance, yEnd - Math.sin(angle) * distance);

    // // Working Lower diagonal
    // this.p5.line(
    //   xEnd,
    //   yStart,
    //   // Math.cos(angle)
    //   xStart + gameAxisWidth * 2 + (xEnd - xStart) / 2,
    //   yEnd - gameAxisWidth * 2 - (yEnd - yStart) / 2,
    // );
    // // Working Top diagonal
    // this.p5.line(
    //   xStart - gameAxisWidth * 2 + (xEnd - xStart) / 2,
    //   yEnd + gameAxisWidth * 2 - (yEnd - yStart) / 2,
    //   xStart,
    //   yEnd,
    // );
    this.p5.line(xEnd, yStart, xStart, yEnd);
    // repeat here as needed
    this.p5.line(xStart, yStart, xEnd, yEnd);
    this.p5.line(xEnd, yStart, xStart, yEnd);
  }

  private redrawSelections(): void {
    this.state.board.selections.forEach((key, value) => {
      const {x, y} = coordsToNumberCoords(value);
      if (key === 'x') {
        this.drawX(x, y);
      } else {
        this.drawO(x, y);
      }
    });
  }

  private redrawRules(): void {
    const container = document.getElementById('rules-container');
    if (container) {
      let innerHtml = '';
      this.state.room.rules.forEach((rule) => {
        innerHtml += `<div class="rule">${rule.name}</div>`;
      });
      container.innerHTML = innerHtml;
    }
  }

  start(): void {
    this.resizeP();
    this.redrawBoard();
    this.redrawRules();
  }
}
