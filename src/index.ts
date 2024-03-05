import './index.scss';
import * as P5 from 'p5';
import {COLORS} from './colors';
import {coordsToNumberCoords} from './coordinatesHelper';
import {getBestMove} from './minimax';
import {Choice, Coordinate, NumberCoordinates, State} from './types';

let gameWidth = 1600;
let gameHeight = 750;

const gameAxisWidth = 10;
const gameInnerPadding = 24;
let p5: P5;
let loading = false;

function resizeP(): void {
  const verticalPadding = 80;
  const horizontalPadding = 0;
  const windowRatio = (window.innerWidth - horizontalPadding) / (window.innerHeight - verticalPadding);
  if (windowRatio < 0 || windowRatio > 10) {
    return;
  }

  gameWidth = p5.windowWidth - horizontalPadding;
  gameHeight = p5.windowHeight - verticalPadding;

  p5.resizeCanvas(p5.windowWidth - horizontalPadding, p5.windowHeight - verticalPadding);
}

const state = {
  columns: 5,
  rows: 5,
  requiredWin: 3,
  selections: new Map<Coordinate, Choice>(),
  currentPlayer: 'x' as Choice,
  maxDepth: 3,
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

function getCellWidth(): number {
  return gameWidth / state.columns;
}

function getCellHeight(): number {
  return gameHeight / state.rows;
}

function getCellCoordinatesFromClick(x: number, y: number): NumberCoordinates {
  // not strictly accurate since there are axes to consider but fine for now
  return {
    x: Math.floor((x / gameWidth) * state.columns),
    y: Math.floor((y / gameHeight) * state.rows),
  };
}

function redrawBoard(): void {
  const cellWidth = getCellWidth();
  const cellHeight = getCellHeight();
  p5.stroke(COLORS.gameAxes);
  p5.strokeCap(p5.ROUND);
  p5.strokeWeight(gameAxisWidth);
  p5.drawingContext.shadowBlur = 40;
  p5.drawingContext.shadowColor = COLORS.gameAxes;

  for (let col = 1; col < state.columns; col++) {
    p5.line(
      cellWidth * col - gameInnerPadding / 2,
      gameInnerPadding,
      cellWidth * col - gameInnerPadding / 2,
      gameHeight - gameInnerPadding * 2,
    );
    p5.line(
      cellWidth * col - gameInnerPadding / 2,
      gameInnerPadding,
      cellWidth * col - gameInnerPadding / 2,
      gameHeight - gameInnerPadding * 2,
    );
  }
  for (let row = 1; row < state.rows; row++) {
    p5.line(
      gameInnerPadding,
      cellHeight * row - gameInnerPadding / 2,
      gameWidth - gameInnerPadding * 2,
      cellHeight * row - gameInnerPadding / 2,
    );
    p5.line(
      gameInnerPadding,
      cellHeight * row - gameInnerPadding / 2,
      gameWidth - gameInnerPadding * 2,
      cellHeight * row - gameInnerPadding / 2,
    );
  }
}
function drawO(x: number, y: number): void {
  p5.stroke(COLORS.o);
  p5.fill(p5.color(0, 0));
  p5.strokeWeight(gameAxisWidth * 1.5);
  p5.drawingContext.shadowBlur = 40;
  p5.drawingContext.shadowColor = COLORS.o;
  const cellWidth = getCellWidth();
  const cellHeight = getCellHeight();

  const xStart = x * cellWidth + cellWidth * 0.5 - gameAxisWidth;
  const yStart = y * cellHeight + cellHeight * 0.5 - gameAxisWidth;
  p5.circle(xStart, yStart, Math.max(Math.min(cellWidth, cellHeight) * 0.8 - gameAxisWidth * 4, 10));
  // repeat here as needed
  p5.circle(xStart, yStart, Math.max(Math.min(cellWidth, cellHeight) * 0.8 - gameAxisWidth * 4, 10));
}

function drawX(x: number, y: number): void {
  p5.stroke(COLORS.x);
  p5.strokeCap(p5.ROUND);
  p5.strokeWeight(gameAxisWidth);
  p5.drawingContext.shadowBlur = 20;
  p5.drawingContext.shadowColor = COLORS.x;
  const cellWidth = getCellWidth();
  const cellHeight = getCellHeight();
  const xStart = x * cellWidth + gameAxisWidth * 2;
  const yStart = y * cellHeight + gameAxisWidth * 2;
  const xEnd = xStart + cellWidth * 0.9 - gameAxisWidth * 4;
  const yEnd = yStart + cellHeight * 0.8 - gameAxisWidth * 4;
  p5.line(xStart, yStart, xEnd, yEnd);
  p5.line(xEnd, yStart, xStart, yEnd);
  // repeat here as needed
  p5.line(xStart, yStart, xEnd, yEnd);
  p5.line(xEnd, yStart, xStart, yEnd);
}

function redrawSelections(): void {
  state.selections.forEach((key, value) => {
    const {x, y} = coordsToNumberCoords(value);
    if (key === 'x') {
      drawX(x, y);
    } else {
      drawO(x, y);
    }
  });
}

function redrawRules(): void {
  const container = document.getElementById('rules-container');
  if (container) {
    let innerHtml = '';
    state.room.rules.forEach((rule) => {
      innerHtml += `<div class="rule">${rule.name}</div>`;
    });
    container.innerHTML = innerHtml;
  }
}

function handleClick(): void {
  const {x, y} = getCellCoordinatesFromClick(p5.mouseX, p5.mouseY);
  if (
    !loading &&
    state.selections.get(`${x},${y}`) === undefined &&
    x > -1 &&
    y > -1 &&
    x < state.columns &&
    y < state.rows
  ) {
    loading = true;
    document.getElementById('loading')?.classList.add('loading');
    state.selections.set(`${x},${y}`, 'x');
    setTimeout(() => {
      const response = getBestMove(state, false);
      document.getElementById('loading')?.classList.remove('loading');
      loading = false;
      if (response.bestMove) {
        state.selections.set(`${response.bestMove.x},${response.bestMove.y}`, 'o');
      }
    }, 10);
  }
}

const sketch = (p: P5): void => {
  p.setup = (): void => {
    const canvas = p.createCanvas(gameWidth, gameHeight);
    canvas.id('game-canvas');
  };
  p.windowResized = (): void => {
    resizeP();
  };
  p.mouseClicked = handleClick;

  p.draw = (): void => {
    p.background(0, 0, 0);
    redrawBoard();
    redrawSelections();
  };
};

window.addEventListener('load', () => {
  p5 = new P5(sketch, document.getElementById('canvas-container')!);

  resizeP();
  redrawBoard();
  redrawRules();
});
