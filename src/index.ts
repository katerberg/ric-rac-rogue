import './index.scss';
import {Choice, Coordinate, NumberCoordinates, State} from './types';

const gameWidth = 1600;
const gameHeight = 750;
const gameRatio = gameWidth / gameHeight;
function resize(): void {
  const gameNode = document.getElementById('game');
  gameNode?.classList.remove('vertical-constraint', 'horizontal-constraint');
  const windowRatio = window.innerWidth / (window.innerHeight - 120);
  if (windowRatio < 0 || windowRatio > 10) {
    return;
  }
  if (gameRatio < windowRatio) {
    gameNode?.classList.add('vertical-constraint');
  } else {
    gameNode?.classList.add('horizontal-constraint');
  }
}

const state = {
  columns: 3,
  rows: 3,
  requiredWin: 3,
  selections: new Map<Coordinate, Choice>(),
} as State;

function getCellWidth(): number {
  return gameWidth / state.columns;
}

function getCellHeight(): number {
  return gameHeight / state.rows;
}

function initCanvasSize(canvas: HTMLCanvasElement): void {
  const width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
  const height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
  canvas.width = gameWidth; //horizontal resolution (?) - increase for better looking text
  canvas.height = gameHeight; //vertical resolution (?) - increase for better looking text
  canvas.style.width = `${width}`; //actual width of canvas
  canvas.style.height = `${height}`; //actual height of canvas
}

function getCanvas(): HTMLCanvasElement {
  return document.getElementById('game-canvas') as HTMLCanvasElement;
}

function getCellCoordinatesFromClick(event: MouseEvent): NumberCoordinates {
  const elem = getCanvas();
  const elemLeft = elem.offsetLeft + elem.clientLeft;
  const elemTop = elem.offsetTop + elem.clientTop;
  const x = event.pageX - elemLeft;
  const y = event.pageY - elemTop;

  return {x: Math.floor((x / elem.clientWidth) * state.columns), y: Math.floor((y / elem.clientHeight) * state.rows)};
}

function handleClick(event: MouseEvent): void {
  const {x, y} = getCellCoordinatesFromClick(event);
  switch (state.selections.get(`${x},${y}`)) {
    case 'x':
      state.selections.set(`${x},${y}`, 'o');
      break;
    case 'o':
      state.selections.delete(`${x},${y}`);
      break;
    case undefined:
    default:
      state.selections.set(`${x},${y}`, 'x');
      break;
  }
  // eslint-disable-next-line no-console
  console.log(state.selections);
}

// function clearBoard(ctx: CanvasRenderingContext2D): void {
//   const cellWidth = getCellWidth();
//   const cellHeight = getCellHeight();

//   for (let col = 1; col < state.columns; col++) {
//     ctx.clearRect(cellWidth * col - 5, 10, 10, gameHeight - 20);
//   }
//   for (let row = 1; row < state.rows; row++) {
//     ctx.clearRect(10, cellHeight * row - 5, gameWidth - 20, 10);
//   }
// }

function redrawBoard(ctx: CanvasRenderingContext2D): void {
  const cellWidth = getCellWidth();
  const cellHeight = getCellHeight();

  ctx.fillStyle = 'rgb(10 200 110)';
  for (let col = 1; col < state.columns; col++) {
    ctx.fillRect(cellWidth * col - 5, 10, 10, gameHeight - 20);
  }
  for (let row = 1; row < state.rows; row++) {
    ctx.fillRect(10, cellHeight * row - 5, gameWidth - 20, 10);
  }
}

resize();
addEventListener('resize', () => {
  resize();
});

window.addEventListener('load', () => {
  initCanvasSize(getCanvas());

  const canvas = getCanvas();
  canvas.addEventListener('click', handleClick, false);
  const ctx = canvas.getContext('2d');
  if (ctx) {
    redrawBoard(ctx);
  }
});
