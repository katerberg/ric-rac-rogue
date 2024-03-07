import * as P5 from 'p5';
import {COLORS} from '../colors';
import {coordsToNumberCoords} from '../coordinatesHelper';
import {getUrlParams, isDebug} from '../environment';
import {getBestMove} from '../minimax';
import {getRuleName} from '../rules';
import {Choice, Coordinate, NumberCoordinates, PowerUpType, StatusEffectType, TerminalStatus} from '../types';
import {checkTerminal} from '../winCalculation';
import {Level} from './Level';
import '../next-level.scss';
import '../sidebar.scss';
import {PowerUp} from './PowerUp';
import {StatusEffect} from './StatusEffect';

const gameAxisWidth = 10;
const gameInnerPadding = 24;

const verticalPadding = 80;
const horizontalPadding = 0;

export class Game {
  level: Level;

  p5: P5;

  energyMax: number;

  energyCurrent: number;

  powerUps: PowerUp[];

  gameWidth: number;

  gameHeight: number;

  loading: boolean;

  startTime: number;

  activeStatusEffects: StatusEffect[];

  currentAction: PowerUp | null;

  gameEndCallback: () => void;

  constructor(gameEndCallback: () => void) {
    this.startTime = Date.now();
    const sketch = (p: P5): void => {
      p.setup = (): void => {
        const canvas = p.createCanvas(this.gameWidth, this.gameHeight);
        canvas.id('game-canvas');
        p.textFont('Orbitron');
      };
      p.windowResized = (): void => this.resizeP();
      p.mouseClicked = (): void => this.handleClick();

      p.draw = (): void => {
        p.background(0, 0, 0);
        this.redrawBoard();
        this.redrawSelections();
        this.redrawEnergy();
      };
    };
    this.p5 = new P5(sketch, document.getElementById('canvas-container')!);
    this.gameWidth = this.p5.windowWidth - horizontalPadding;
    this.gameHeight = this.p5.windowHeight - verticalPadding;
    this.loading = false;
    this.energyMax = 100;
    this.energyCurrent = isDebug('energy') ? Number.parseInt(getUrlParams().get('energy') || '100', 10) : 100;
    this.powerUps = [
      new PowerUp({type: PowerUpType.DECREASE_REQUIRED_WIN}),
      // new PowerUp({type: PowerUpType.INCREASE_REQUIRED_WIN}),
      new PowerUp({type: PowerUpType.EXTRA_TURN}),
      new PowerUp({type: PowerUpType.FLIP_TILE}),
      new PowerUp({type: PowerUpType.RESET_COOLDOWN}),
      new PowerUp({type: PowerUpType.COPY_COLUMN}),
      // new PowerUp({type: PowerUpType.COPY_ROW}),
      // new PowerUp({type: PowerUpType.REMOVE_COLUMN}),
      new PowerUp({type: PowerUpType.REMOVE_ROW}),
      new PowerUp({type: PowerUpType.INCREASE_ENERGY}),
      new PowerUp({type: PowerUpType.INCREASE_MAX_ENERGY}),
    ];
    this.activeStatusEffects = [];
    this.currentAction = null;
    this.level = new Level(isDebug('level') ? Number.parseInt(getUrlParams().get('level') || '1', 10) : 1);
    this.gameEndCallback = gameEndCallback;
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
      x: Math.floor((x / this.gameWidth) * this.level.board.columns),
      y: Math.floor((y / this.gameHeight) * this.level.board.rows),
    };
  }

  private getCellWidth(): number {
    return this.gameWidth / this.level.board.columns;
  }

  private getCellHeight(): number {
    return this.gameHeight / this.level.board.rows;
  }

  private getStatusEffectPosition(statusEffect: StatusEffectType): number {
    return this.activeStatusEffects.findIndex((activeStatusEffect) => activeStatusEffect.type === statusEffect);
  }

  private resetCurrentAction(): void {
    if (this.currentAction) {
      this.currentAction.cooldownRemaining = 0;
      this.energyCurrent += this.currentAction.cost;
      this.currentAction = null;
      this.redrawActions();
    }
  }

  private isTimeForClick(): boolean {
    return !this.loading && this.startTime + 100 < Date.now();
  }

  private handleClick(): void {
    if (!this.isTimeForClick()) {
      return;
    }
    const {x, y} = this.getCellCoordinatesFromClick(this.p5.mouseX, this.p5.mouseY);
    if (this.level.board.isMoveOnBoard({x, y})) {
      if (this.currentAction?.type === PowerUpType.FLIP_TILE && this.level.board.flipTile({x, y})) {
        this.currentAction = null;
        return;
      }
      if (this.currentAction?.type === PowerUpType.REMOVE_COLUMN && this.level.board.isMoveOnBoard({x, y})) {
        this.level.board.removeColumn(x);
        this.currentAction = null;
        return;
      }
      if (this.currentAction?.type === PowerUpType.REMOVE_ROW && this.level.board.isMoveOnBoard({x, y})) {
        this.level.board.removeRow(y);
        this.currentAction = null;
        return;
      }
      if (this.currentAction?.type === PowerUpType.COPY_COLUMN && this.level.board.isMoveOnBoard({x, y})) {
        this.level.board.copyColumn(x);
        this.currentAction = null;
        return;
      }
      if (this.currentAction?.type === PowerUpType.COPY_ROW && this.level.board.isMoveOnBoard({x, y})) {
        this.level.board.copyRow(y);
        this.currentAction = null;
        return;
      }
      if (
        this.currentAction &&
        [
          PowerUpType.RESET_COOLDOWN,
          PowerUpType.FLIP_TILE,
          PowerUpType.REMOVE_COLUMN,
          PowerUpType.REMOVE_ROW,
          PowerUpType.COPY_COLUMN,
          PowerUpType.COPY_ROW,
        ].includes(this.currentAction.type)
      ) {
        this.resetCurrentAction();
        return;
      }
      if (this.level.board.isAvailableMove({x, y})) {
        this.energyCurrent -= 10;
        this.powerUps.forEach((powerUp) => {
          powerUp.cooldownRemaining -= 1;
        });
        this.redrawActions();
        if (this.makePlay(`${x},${y}`, 'x')) {
          return;
        }
        const extraTurnPosition = this.getStatusEffectPosition(StatusEffectType.EXTRA_TURN);
        if (extraTurnPosition !== -1) {
          this.activeStatusEffects.splice(extraTurnPosition, 1);
          return;
        }
        this.loading = true;
        document.getElementById('loading')?.classList.add('loading');
        setTimeout(() => {
          const response = getBestMove(
            {
              board: this.level.board,
              maxDepth: this.level.maxDepth,
              requiredWin: this.level.requiredWin,
              currentPlayer: 'x',
            },
            false,
          );
          document.getElementById('loading')?.classList.remove('loading');
          this.loading = false;
          if (response.bestMove) {
            this.makePlay(`${response.bestMove.x},${response.bestMove.y}`, 'o');
          }
          this.activeStatusEffects = this.activeStatusEffects
            .map((activeStatusEffect) => {
              activeStatusEffect.turnsRemaining -= 1;
              return activeStatusEffect;
            })
            .filter((activeStatusEffect) => activeStatusEffect.turnsRemaining > 0);
        }, 10);
      }
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

    for (let col = 1; col < this.level.board.columns; col++) {
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
    for (let row = 1; row < this.level.board.rows; row++) {
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
    this.p5.arc(xStart, yStart, radius * 1.2, radius, 1.74533, 1.309);
    // repeat here as needed
    this.p5.arc(xStart, yStart, radius * 1.2, radius, 1.74533, 1.309);
    this.p5.arc(xStart, yStart, radius * 1.2, radius, 1.74533, 1.309);
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
    // Two short diagonals
    this.p5.line(xEnd, yStart, xStart + (xEnd - xStart) * 0.6, yStart + (yEnd - yStart) * 0.4);
    this.p5.line(xStart + (xEnd - xStart) * 0.4, yStart + (yEnd - yStart) * 0.6, xStart, yEnd);

    // repeat here as needed
    this.p5.line(xStart, yStart, xEnd, yEnd);
    this.p5.line(xEnd, yStart, xStart + (xEnd - xStart) * 0.6, yStart + (yEnd - yStart) * 0.4);
    this.p5.line(xStart + (xEnd - xStart) * 0.4, yStart + (yEnd - yStart) * 0.6, xStart, yEnd);
    this.p5.line(xEnd, yStart, xStart + (xEnd - xStart) * 0.6, yStart + (yEnd - yStart) * 0.4);
    this.p5.line(xStart + (xEnd - xStart) * 0.4, yStart + (yEnd - yStart) * 0.6, xStart, yEnd);
  }

  private redrawSelections(): void {
    this.level.board.selections.forEach((key, value) => {
      const {x, y} = coordsToNumberCoords(value);
      if (key === 'x') {
        this.drawX(x, y);
      } else {
        this.drawO(x, y);
      }
    });
  }

  private redrawEnergy(): void {
    const strokeWidth = gameAxisWidth * 2;
    this.p5.stroke(COLORS.energy);
    this.p5.strokeCap(this.p5.ROUND);
    this.p5.strokeWeight(gameAxisWidth);
    this.p5.drawingContext.shadowBlur = 40;
    this.p5.drawingContext.shadowColor = COLORS.energy;
    const y = this.gameHeight - strokeWidth;
    const percentage = this.energyCurrent / this.energyMax;
    this.p5.line(0, y, this.gameWidth * percentage - strokeWidth, y);
    this.p5.line(0, y, this.gameWidth * percentage - strokeWidth, y);
    this.p5.line(0, y, this.gameWidth * percentage - strokeWidth, y);
    this.p5.line(0, y, this.gameWidth * percentage - strokeWidth, y);

    this.p5.textStyle(this.p5.NORMAL);
    this.p5.textSize(30);
    this.p5.fill(COLORS.background);
    this.p5.text(`ENERGY  ${this.energyCurrent} / ${this.energyMax}`, 50, y + 10);
  }

  private redrawRules(): void {
    const container = document.getElementById('rules-container');
    const level = document.getElementById('level-container');
    if (container && level) {
      container.innerHTML = '';
      this.level.rules.forEach((rule) => {
        const ruleDiv = document.createElement('div');
        ruleDiv.classList.add('rule');
        ruleDiv.innerText = getRuleName(rule);
        container.appendChild(ruleDiv);
      });

      level.innerHTML = `${this.level.level}`;
    }
  }

  private redrawActions(): void {
    const actionsContainer = document.getElementById('actions-container');
    if (actionsContainer) {
      actionsContainer.innerHTML = '';
      this.powerUps.forEach((powerUp) => {
        const button = document.createElement('button');
        if (powerUp.cooldownRemaining > 0) {
          button.classList.add('disabled');
        }
        button.addEventListener('click', () => {
          if (powerUp.cooldownRemaining < 1) {
            this.energyCurrent -= powerUp.cost;
            powerUp.cooldownRemaining = powerUp.cooldown;
            this.redrawActions();
            this.checkLossCondition();
            this.activatePowerUp(powerUp);
          } else if (this.currentAction?.type === PowerUpType.RESET_COOLDOWN) {
            powerUp.cooldownRemaining = 0;
            this.currentAction = null;
            this.redrawActions();
          }
        });
        const title = document.createElement('div');
        title.classList.add('title');
        title.innerHTML = powerUp.displayName;
        const disabledStatus = document.createElement('div');
        disabledStatus.classList.add('disabled-status');
        disabledStatus.innerHTML = `<span class="icon">⏱</span>${powerUp.cooldownRemaining} left`;
        const cooldown = document.createElement('div');
        cooldown.classList.add('cooldown');
        cooldown.innerHTML = `<span class="icon">⏱</span>${powerUp.cooldown}`;
        const cost = document.createElement('div');
        cost.classList.add('cost');
        cost.innerHTML = `<span class="icon">⚡︎</span>${powerUp.cost}`;
        button.appendChild(title);
        button.appendChild(disabledStatus);
        button.appendChild(cooldown);
        button.appendChild(cost);
        actionsContainer.appendChild(button);
      });
    }
  }

  private activatePowerUp(powerUp: PowerUp): void {
    this.resetCurrentAction();
    switch (powerUp.type) {
      case PowerUpType.EXTRA_TURN:
        this.activeStatusEffects.push(new StatusEffect({type: StatusEffectType.EXTRA_TURN}));
        break;
      case PowerUpType.INCREASE_MAX_ENERGY:
        this.energyMax += 10;
        break;
      case PowerUpType.INCREASE_ENERGY:
        if (this.energyCurrent > this.energyMax) {
          this.energyCurrent = this.energyMax;
        }
        break;
      case PowerUpType.INCREASE_REQUIRED_WIN:
        this.level.changeWinRequirement(this.level.requiredWin + 1);
        this.redrawRules();
        break;
      case PowerUpType.DECREASE_REQUIRED_WIN:
        this.level.changeWinRequirement(this.level.requiredWin - 1);
        this.redrawRules();
        this.checkWinCondition('x');
        break;
      case PowerUpType.FLIP_TILE:
      case PowerUpType.RESET_COOLDOWN:
      case PowerUpType.COPY_COLUMN:
      case PowerUpType.COPY_ROW:
      case PowerUpType.REMOVE_COLUMN:
      case PowerUpType.REMOVE_ROW:
        this.currentAction = powerUp;
        break;

      default:
    }
  }

  private endLevel(term: TerminalStatus): void {
    const nextLevelScreen = document.getElementById('next-level-screen');
    const nextLevelContent = document.getElementById('next-level-content');
    if (nextLevelScreen && nextLevelContent) {
      this.loading = true;
      const nextScreenPromise = new Promise<void>((resolve) => {
        nextLevelContent.innerHTML = '';
        const message = document.createElement('div');
        message.classList.add('next-level-message');
        let content = '<h1>';
        if (term.winner) {
          if (term.winner === 'x') {
            content += 'You win!';
            this.energyMax += 20;
            this.energyCurrent += Math.floor(this.energyMax * 0.3);
            if (this.energyCurrent > this.energyMax) {
              this.energyCurrent = this.energyMax;
            }
          } else {
            content += 'You lose.';
          }
        } else if (term.isCat) {
          this.energyCurrent += Math.floor(this.energyMax * 0.15);
          if (this.energyCurrent > this.energyMax) {
            this.energyCurrent = this.energyMax;
          }
          content += 'Tie';
        } else {
          content += 'Level done';
        }
        content += '</h1>';
        message.innerHTML = content;
        const button = document.createElement('button');
        button.classList.add('next-level-button');
        button.innerHTML = 'Next Level';

        button.addEventListener('click', () => {
          resolve();
          this.checkLossCondition();
        });

        nextLevelScreen.classList.add('visible');
        nextLevelContent.appendChild(message);
        nextLevelContent.appendChild(button);
      });

      nextScreenPromise.then(() => {
        this.startTime = Date.now();
        this.loading = false;
        nextLevelScreen.classList.remove('visible');
        this.level = new Level(this.level.level + 1);
        this.activeStatusEffects = [];
        this.redrawRules();
      });
    }
  }

  endGame(): void {
    const canvasContainer = document.getElementById('canvas-container');
    const startScreen = document.getElementById('start-screen');
    const topBar = document.getElementById('top-bar');
    const sidebar = document.getElementById('sidebar');
    if (canvasContainer && startScreen && topBar && sidebar) {
      this.p5.remove();
      canvasContainer.innerHTML = '';
      this.gameEndCallback();
      startScreen.classList.add('visible');
      sidebar.classList.remove('visible');
      topBar.classList.remove('visible');
    }
  }

  checkLossCondition(): void {
    if (this.energyCurrent <= 0) {
      this.endGame();
    }
  }

  checkWinCondition(player: Choice): boolean {
    const term = checkTerminal(this.level.board, this.level.requiredWin, player);
    if (term.isTerminal) {
      this.endLevel(term);
      return true;
    }
    return false;
  }

  makePlay(move: Coordinate, player: Choice): boolean {
    this.level.board.selections.set(move, player);
    const isWin = this.checkWinCondition(player);
    if (isWin) {
      return true;
    }
    this.checkLossCondition();

    return false;
  }

  start(): void {
    this.resizeP();
    this.redrawBoard();
    this.redrawRules();
    this.redrawActions();
    if (isDebug('endlevel')) {
      this.endLevel({isTerminal: true, winner: 'x', isCat: false, isWinner: true});
    }
  }
}