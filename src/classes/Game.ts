import * as P5 from 'p5';
import {COLORS} from '../colors';
import {coordsToNumberCoords, numberCoordsToCoords} from '../coordinatesHelper';
import {getUrlParams, isDebug} from '../environment';
import {getBestMove} from '../minimax';
import {getRuleName} from '../rules';
import {
  Choice,
  Coordinate,
  MenuOption,
  NumberCoordinates,
  PowerUpType,
  Stats,
  StatusEffectType,
  TerminalStatus,
  randomEnum,
} from '../types';
import {checkTerminal} from '../winCalculation';
import {Level} from './Level';
import '../top-bar.scss';
import '../next-level.scss';
import '../sidebar.scss';
import '../menu.scss';
import '../end-game.scss';
import {PowerUp, getStartingPowerUp} from './PowerUp';
import {StatusEffect} from './StatusEffect';

const gameAxisWidth = 10;
const gameInnerPadding = 24;

const verticalPadding = 80;
const horizontalPadding = 0;

const ENERGY_COST_MOVE = 0;
const ENERGY_COST_LOSS = 50;
const ENERGY_COST_CAT = 20;
function recreateNode(el: HTMLElement, withChildren?: boolean): Node {
  let newNode: Node;
  if (withChildren) {
    newNode = el.cloneNode(true);
    el.parentNode?.replaceChild(newNode, el);
  } else {
    newNode = el.cloneNode(false);
    while (el.hasChildNodes()) {
      if (el.firstChild) {
        newNode.appendChild(el.firstChild);
      }
    }
    el.parentNode?.replaceChild(newNode, el);
  }
  return newNode;
}
function getPowerUpDescription(powerUpDescription: string): HTMLElement | null {
  if (powerUpDescription !== '') {
    const description = document.createElement('div');
    description.classList.add('description');
    const descriptionContent = document.createElement('div');
    descriptionContent.innerText = powerUpDescription;
    descriptionContent.classList.add('description-content');
    description.appendChild(descriptionContent);
    return description;
  }
  return null;
}

function getActionButton(powerUp: PowerUp): HTMLElement {
  const button = document.createElement('button');
  if (powerUp.cooldownRemaining > 0) {
    button.classList.add('disabled');
  }
  const description = getPowerUpDescription(powerUp.description);
  if (description) {
    button.appendChild(description);
  }
  const title = document.createElement('div');
  title.classList.add('title');
  title.innerHTML = powerUp.displayName;
  const disabledStatus = document.createElement('div');
  disabledStatus.classList.add('disabled-status');
  disabledStatus.innerHTML = `<span class="icon">⏱ </span>${powerUp.cooldownRemaining} left`;
  const cooldown = document.createElement('div');
  cooldown.classList.add('cooldown');
  cooldown.innerHTML = `<span class="icon">⏱ </span>${powerUp.cooldown}`;
  const cost = document.createElement('div');
  cost.classList.add('cost');
  cost.innerHTML = `<span class="icon">⚡︎</span>${powerUp.cost}`;
  button.appendChild(title);
  button.appendChild(disabledStatus);
  button.appendChild(cooldown);
  button.appendChild(cost);
  return button;
}

function getRechargeButton(): HTMLElement {
  const button = document.createElement('button');
  button.classList.add('recharge-button');
  const description = getPowerUpDescription('Refill energy level to 100% of maximum');
  if (description) {
    button.appendChild(description);
  }
  const title = document.createElement('div');
  title.classList.add('title');
  title.innerText = '⚡︎ Recharge ⚡︎';
  button.appendChild(title);
  return button;
}

export class Game {
  level: Level;

  p5: P5;

  stats: Stats;

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
    this.powerUps = [getStartingPowerUp()];
    this.stats = {
      totalMoves: 0,
      totalLosses: 0,
      totalTies: 0,
      totalWins: 0,
      powerUpsActivated: 0,
    };
    if (isDebug('powerups')) {
      this.powerUps = [
        new PowerUp({type: PowerUpType.TELEPORT_RANDOM}),
        new PowerUp({type: PowerUpType.FORCE_RANDOM}),
        new PowerUp({type: PowerUpType.FORCE_SPACE}),
        new PowerUp({type: PowerUpType.BLOCKED_SPACE}),
        // new PowerUp({type: PowerUpType.DECREASE_REQUIRED_WIN}),
        // new PowerUp({type: PowerUpType.INCREASE_REQUIRED_WIN}),
        new PowerUp({type: PowerUpType.EXTRA_TURN}),
        new PowerUp({type: PowerUpType.FLIP_TILE}),
        new PowerUp({type: PowerUpType.RESET_COOLDOWN}),
        new PowerUp({type: PowerUpType.COPY_COLUMN}),
        // new PowerUp({type: PowerUpType.COPY_ROW}),
        // new PowerUp({type: PowerUpType.REMOVE_COLUMN}),
        new PowerUp({type: PowerUpType.REMOVE_ROW}),
        // new PowerUp({type: PowerUpType.INCREASE_ENERGY}),
        // new PowerUp({type: PowerUpType.INCREASE_MAX_ENERGY}),
      ];
    }
    this.activeStatusEffects = [];
    this.currentAction = null;
    this.level = new Level(isDebug('level') ? Number.parseInt(getUrlParams().get('level') || '1', 10) : 1);
    this.gameEndCallback = gameEndCallback;
    const previousMenuButton = document.getElementById('menu-button');
    if (previousMenuButton) {
      const menuButton = recreateNode(previousMenuButton);
      menuButton.addEventListener('click', () => {
        const menu = document.getElementById('menu');
        if (menu) {
          this.loading = true;
          menu.classList.add('visible');
          const menuPromise = new Promise<MenuOption>((resolve) => {
            const previousMenuCancelButton = document.getElementById('menu-cancel-button');
            const previousEndRunButton = document.getElementById('menu-end-run-button');
            if (previousMenuCancelButton && previousEndRunButton) {
              const menuCancelButton = recreateNode(previousMenuCancelButton);
              menuCancelButton.addEventListener('click', () => {
                resolve(MenuOption.CANCEL);
              });
              const endRunButton = recreateNode(previousEndRunButton);
              endRunButton.addEventListener('click', () => {
                resolve(MenuOption.END_RUN);
              });
            }
          });
          menuPromise.then((resolveState: MenuOption) => {
            if (resolveState === MenuOption.CANCEL) {
              this.loading = false;
              this.startTime = Date.now();
              menu.classList.remove('visible');
            }
            if (resolveState === MenuOption.END_RUN) {
              menu.classList.remove('visible');
              this.endGame();
            }
          });
        }
      });

      if (isDebug('gamemenu')) {
        (menuButton as HTMLElement).click();
      }
    }
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

  private removeStatusEffect(position: number): void {
    this.activeStatusEffects.splice(position, 1);
    this.redrawRules();
  }

  private forceSpace(target: NumberCoordinates): void {
    this.activeStatusEffects.push(new StatusEffect({type: StatusEffectType.FORCE_SPACE, target}));
    this.level.board.selections.set(numberCoordsToCoords(target), 'forced');
    this.redrawRules();
  }

  private blockSpace(target: NumberCoordinates): void {
    this.activeStatusEffects.push(new StatusEffect({type: StatusEffectType.BLOCKED_SPACE, target}));
    this.level.board.selections.set(numberCoordsToCoords(target), 'blocked');
    this.redrawRules();
  }

  private isTimeForClick(): boolean {
    return !this.loading && this.startTime + 100 < Date.now();
  }

  private handleClick(): void {
    if (!this.isTimeForClick()) {
      return;
    }
    const {x, y} = this.getCellCoordinatesFromClick(this.p5.mouseX, this.p5.mouseY);
    if (!this.level.board.isMoveOnBoard({x, y})) {
      return;
    }
    if (
      this.currentAction?.type === PowerUpType.BLOCKED_SPACE &&
      this.level.board.isAvailableMove({x, y}) &&
      this.level.board.getAvailableMoves().length > 1
    ) {
      this.blockSpace({x, y});
      this.currentAction = null;
      return;
    }
    if (
      this.currentAction?.type === PowerUpType.FORCE_SPACE &&
      this.level.board.isAvailableMove({x, y}) &&
      this.level.board.getAvailableMoves().length > 1
    ) {
      this.forceSpace({x, y});
      this.currentAction = null;
      return;
    }
    if (this.currentAction?.type === PowerUpType.FLIP_TILE && this.level.board.flipTile({x, y})) {
      this.checkWinCondition();
      this.currentAction = null;
      return;
    }
    if (this.currentAction?.type === PowerUpType.REMOVE_COLUMN && this.level.board.isMoveOnBoard({x, y})) {
      this.level.board.removeColumn(x);
      this.checkWinCondition();
      this.currentAction = null;
      return;
    }
    if (this.currentAction?.type === PowerUpType.REMOVE_ROW && this.level.board.isMoveOnBoard({x, y})) {
      this.level.board.removeRow(y);
      this.checkWinCondition();
      this.currentAction = null;
      return;
    }
    if (this.currentAction?.type === PowerUpType.COPY_COLUMN && this.level.board.isMoveOnBoard({x, y})) {
      this.level.board.copyColumn(x);
      this.checkWinCondition();
      this.currentAction = null;
      return;
    }
    if (this.currentAction?.type === PowerUpType.COPY_ROW && this.level.board.isMoveOnBoard({x, y})) {
      this.level.board.copyRow(y);
      this.checkWinCondition();
      this.currentAction = null;
      return;
    }
    if (this.currentAction?.type === PowerUpType.TELEPORT_RANDOM && this.level.board.isTakenMove({x, y})) {
      this.level.board.teleportRandom({x, y});
      this.checkWinCondition();
      this.currentAction = null;
      return;
    }
    if (
      this.currentAction &&
      [
        PowerUpType.RESET_COOLDOWN,
        PowerUpType.FLIP_TILE,
        PowerUpType.BLOCKED_SPACE,
        PowerUpType.FORCE_SPACE,
        PowerUpType.REMOVE_COLUMN,
        PowerUpType.REMOVE_ROW,
        PowerUpType.COPY_COLUMN,
        PowerUpType.COPY_ROW,
        PowerUpType.TELEPORT_RANDOM,
      ].includes(this.currentAction.type)
    ) {
      this.stats.powerUpsActivated--;
      this.resetCurrentAction();
      return;
    }
    if (this.level.board.isAvailableMove({x, y}) && this.level.board.isUnblockedMove({x, y})) {
      // Do our move
      this.energyCurrent -= ENERGY_COST_MOVE;
      this.powerUps.forEach((powerUp) => {
        powerUp.cooldownRemaining -= 1;
      });
      this.redrawActions();
      if (this.level.level === 10 && this.level.board.getAvailableMoves().length < 20) {
        this.level.maxDepth = 6;
        if (this.level.board.getAvailableMoves().length < 15) {
          this.level.maxDepth = 8;
        }
        if (this.level.board.getAvailableMoves().length < 12) {
          this.level.maxDepth = 3000;
        }
      }
      if (this.level.board.getAvailableMoves().length < 12) {
        this.level.maxDepth = 3000;
      }
      // Bail if we won
      this.stats.totalMoves++;
      if (this.makePlay(`${x},${y}`, 'x')) {
        return;
      }
      // Handle extra turn
      const extraTurnPosition = this.getStatusEffectPosition(StatusEffectType.EXTRA_TURN);
      if (extraTurnPosition !== -1) {
        this.removeStatusEffect(extraTurnPosition);
        return;
      }
      // Do their move
      this.loading = true;
      document.getElementById('loading')?.classList.add('loading');
      setTimeout(() => this.takeTheirMove(this.level.isTwoToOne()), 50);
    }
  }

  private takeTheirMove(takeExtraTurn: boolean): void {
    let move;
    const forceRandomPosition = this.getStatusEffectPosition(StatusEffectType.FORCE_RANDOM);
    const forceSpacePosition = this.getStatusEffectPosition(StatusEffectType.FORCE_SPACE);
    if (forceSpacePosition !== -1) {
      const {target} = this.activeStatusEffects[forceSpacePosition];

      const isStillValidMove =
        this.level.board.isMoveOnBoard(target!) &&
        this.level.board.selections.get(numberCoordsToCoords(target!)) === 'forced';
      move = isStillValidMove ? target : this.level.board.getRandomMove();
    } else if (forceRandomPosition !== -1) {
      move = this.level.board.getRandomMove();
    } else {
      move = getBestMove(
        {
          board: this.level.board,
          maxDepth: this.level.maxDepth,
          requiredWin: this.level.requiredWin,
          currentPlayer: 'o',
        },
        this.level.board.getAvailableMoves().length > 12,
      ).bestMove;
    }
    if (!takeExtraTurn) {
      document.getElementById('loading')?.classList.remove('loading');
      this.loading = false;
    }
    if (move) {
      this.makePlay(`${move.x},${move.y}`, 'o');
    }
    this.activeStatusEffects = this.activeStatusEffects
      .map((activeStatusEffect) => {
        activeStatusEffect.turnsRemaining -= 1;
        // Clean up the finished active status effects on the board
        if (
          activeStatusEffect.target &&
          activeStatusEffect.turnsRemaining === 0 &&
          [StatusEffectType.FORCE_SPACE, StatusEffectType.BLOCKED_SPACE].includes(activeStatusEffect.type)
        ) {
          if (!this.level.board.isPlayerMove(activeStatusEffect.target)) {
            this.level.board.selections.delete(numberCoordsToCoords(activeStatusEffect.target));
          }
        }
        return activeStatusEffect;
      })
      .filter((activeStatusEffect) => activeStatusEffect.turnsRemaining > 0);
    this.redrawRules();
    if (takeExtraTurn) {
      setTimeout(() => {
        this.takeTheirMove(false);
      }, 50);
    }
  }

  private drawWobble({x, y}: NumberCoordinates, cellWidth: number, cellHeight: number, color: string): void {
    this.p5.stroke(color);
    this.p5.strokeWeight(gameAxisWidth * 1.5);
    this.p5.drawingContext.shadowBlur = 80;
    this.p5.drawingContext.shadowColor = COLORS.statusEffect;

    const radius = Math.max(Math.min(cellWidth, cellHeight) * 0.8 - gameAxisWidth * 4, 10);
    const xStart = x * cellWidth + cellWidth * 0.5 - gameAxisWidth;
    const yStart = y * cellHeight + cellHeight * 0.5 - gameAxisWidth;

    const wobble = 100;
    const smoothing = 100;
    const r = radius / 8; // Circle radius
    const vertices = 200; // Number of vertices for drawing the circle
    this.p5.beginShape();
    const t = this.p5.millis() / 1000;
    for (let i = 0; i < vertices; i++) {
      const f = this.p5.noise(
        (50 * this.p5.cos((i / vertices) * 2 * this.p5.PI)) / smoothing + t,
        (50 * this.p5.sin((i / vertices) * 2 * this.p5.PI)) / smoothing + t,
      );
      this.p5.vertex(
        xStart + (r + wobble * f) * this.p5.cos((i / vertices) * 2 * this.p5.PI),
        yStart + (r + wobble * f) * this.p5.sin((i / vertices) * 2 * this.p5.PI),
      );
    }
    this.p5.endShape(this.p5.CLOSE);
  }

  private redrawBoard(): void {
    const cellWidth = this.getCellWidth();
    const cellHeight = this.getCellHeight();
    this.p5.stroke(COLORS.gameAxes);
    this.p5.strokeCap(this.p5.ROUND);
    this.p5.strokeWeight(gameAxisWidth);
    this.p5.drawingContext.shadowBlur = 40;
    this.p5.drawingContext.shadowColor = COLORS.gameAxes;

    // Draw the vertical lines
    for (let col = 1; col < this.level.board.columns; col++) {
      this.p5.line(
        cellWidth * col - gameInnerPadding / 2,
        gameInnerPadding,
        cellWidth * col - gameInnerPadding / 2,
        this.gameHeight - gameInnerPadding * 2,
      );
      // Repeat as needed
      this.p5.line(
        cellWidth * col - gameInnerPadding / 2,
        gameInnerPadding,
        cellWidth * col - gameInnerPadding / 2,
        this.gameHeight - gameInnerPadding * 2,
      );
    }
    // Draw the horizontal lines
    for (let row = 1; row < this.level.board.rows; row++) {
      for (let col = 0; col < this.level.board.columns; col++) {
        const xOffset = gameInnerPadding + cellWidth * col + gameAxisWidth;
        this.p5.line(
          xOffset,
          cellHeight * row - gameInnerPadding / 2,
          xOffset + cellWidth - gameAxisWidth * 4 - gameInnerPadding * 2,
          cellHeight * row - gameInnerPadding / 2,
        );
        // Repeat as needed
        this.p5.line(
          xOffset,
          cellHeight * row - gameInnerPadding / 2,
          xOffset + cellWidth - gameAxisWidth * 4 - gameInnerPadding * 2,
          cellHeight * row - gameInnerPadding / 2,
        );
      }
    }
    this.level.board.blockedSpaces.forEach((blockedSpace) => {
      if (!this.level.board.isTakenMove(blockedSpace)) {
        this.drawWobble(blockedSpace, cellWidth, cellHeight, COLORS.gameAxes);
      }
    });
    this.activeStatusEffects.forEach((activeStatusEffect) => {
      if (activeStatusEffect.target) {
        this.drawWobble(activeStatusEffect.target, cellWidth, cellHeight, COLORS.energy);
      }
    });
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
      } else if (key === 'o') {
        this.drawO(x, y);
      }
    });
    this.level.board.winLines.forEach((winLine) => this.drawWinLines(winLine));
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
    const level = document.getElementById('level-container');
    const rulesContainer = document.getElementById('rules-container');
    const statusesContainer = document.getElementById('statuses-container');
    if (rulesContainer && level && statusesContainer) {
      level.innerHTML = `${this.level.level}`;
      rulesContainer.innerHTML = '';
      this.level.rules.forEach((rule) => {
        const ruleDiv = document.createElement('div');
        ruleDiv.classList.add('rule');
        ruleDiv.innerText = getRuleName(rule);
        rulesContainer.appendChild(ruleDiv);
      });
      statusesContainer.innerHTML = '';
      this.activeStatusEffects.forEach((statusEffect) => {
        const statusDiv = document.createElement('div');
        statusDiv.classList.add('status');
        statusDiv.innerText = statusEffect.name;
        statusesContainer.appendChild(statusDiv);
      });
    }
  }

  private redrawActions(): void {
    const actionsContainer = document.getElementById('actions-container');
    if (actionsContainer) {
      actionsContainer.innerHTML = '';
      this.powerUps.forEach((powerUp) => {
        const button = getActionButton(powerUp);
        button.addEventListener('click', (e: MouseEvent) => {
          if (powerUp.cooldownRemaining < 1) {
            if (this.energyCurrent > powerUp.cost) {
              this.energyCurrent -= powerUp.cost;
              powerUp.cooldownRemaining = powerUp.cooldown;
              this.redrawActions();
              this.checkLossCondition();
              this.activatePowerUp(powerUp);
            } else {
              const clickedButton = (e.target as HTMLElement).closest('button');
              clickedButton?.classList.add('warning');
              setTimeout(() => {
                clickedButton?.classList.remove('warning');
              }, 500);
            }
          } else if (this.currentAction?.type === PowerUpType.RESET_COOLDOWN) {
            powerUp.cooldownRemaining = 0;
            this.currentAction = null;
            this.redrawActions();
          }
        });
        actionsContainer.appendChild(button);
      });
    }
  }

  private activatePowerUp(powerUp: PowerUp): void {
    this.resetCurrentAction();
    switch (powerUp.type) {
      case PowerUpType.EXTRA_TURN:
        this.activeStatusEffects.push(new StatusEffect({type: StatusEffectType.EXTRA_TURN}));
        this.redrawRules();
        break;
      case PowerUpType.FORCE_RANDOM:
        this.activeStatusEffects.push(new StatusEffect({type: StatusEffectType.FORCE_RANDOM}));
        this.redrawRules();
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
        break;
      case PowerUpType.FLIP_TILE:
      case PowerUpType.RESET_COOLDOWN:
      case PowerUpType.COPY_COLUMN:
      case PowerUpType.COPY_ROW:
      case PowerUpType.REMOVE_COLUMN:
      case PowerUpType.REMOVE_ROW:
      case PowerUpType.TELEPORT_RANDOM:
      case PowerUpType.BLOCKED_SPACE:
      case PowerUpType.FORCE_SPACE:
        this.currentAction = powerUp;
        break;

      default:
    }
    this.stats.powerUpsActivated++;
    this.checkWinCondition();
  }

  private getPowerUpOptions(): PowerUp[] {
    const powerUpOptions: PowerUp[] = [];
    let counter = 0;
    while (powerUpOptions.length < 3 && counter++ < 100) {
      const powerUp = randomEnum(PowerUpType);
      if (
        !this.powerUps.some((powerUpOption) => powerUpOption.type === powerUp) &&
        !powerUpOptions.some((powerUpOption) => powerUpOption.type === powerUp)
      ) {
        powerUpOptions.push(new PowerUp({type: powerUp}));
      }
    }
    while (powerUpOptions.length < 3) {
      powerUpOptions.push(new PowerUp({type: randomEnum(PowerUpType)}));
    }

    return powerUpOptions;
  }

  private getEnergyCounter(): Node {
    const energyCounter = document.createElement('div');
    energyCounter.classList.add('energy-counter');
    energyCounter.innerText = `Energy: ${this.energyCurrent}/${this.energyMax}`;
    const previousEnergy = this.energyCurrent;
    const previousEnergyMax = this.energyMax;
    setTimeout(() => {
      const newEnergyChange = document.getElementById('energy-change');
      if (newEnergyChange) {
        newEnergyChange.style.setProperty('--progress', `${(this.energyCurrent / this.energyMax) * 100}%`);
        if (previousEnergy !== this.energyCurrent) {
          energyCounter.innerHTML = `︎︎⚡︎ ${previousEnergy}/${previousEnergyMax} -> <span class="new-energy">${this.energyCurrent}/${this.energyMax}</span>`;
        }
      }
    }, 50);
    return energyCounter;
  }

  private getEnergyChange(): Node {
    const energyChange = document.createElement('div');
    const energyChangeBar = document.createElement('div');
    energyChangeBar.classList.add('bar');
    energyChange.setAttribute('id', 'energy-change');
    energyChange.style.setProperty('--progress', `${(this.energyCurrent / this.energyMax) * 100}%`);
    energyChange.appendChild(energyChangeBar);
    return energyChange;
  }

  private getPowerUpOptionsDisplay(resolve: () => void): Node {
    const powerUpOptions = this.getPowerUpOptions();
    const powerUpOptionsDisplay = document.createElement('div');

    powerUpOptionsDisplay.classList.add('power-up-options');
    powerUpOptions.forEach((powerUpOption) => {
      const button = getActionButton(powerUpOption);
      button.classList.add('power-up-option');
      button.addEventListener('click', () => {
        this.powerUps.push(powerUpOption);
        this.redrawActions();
        resolve();
      });
      const description = getPowerUpDescription(powerUpOption.description);
      if (description) {
        button.appendChild(description);
      }
      powerUpOptionsDisplay.appendChild(button);
    });
    return powerUpOptionsDisplay;
  }

  private getRechargeOption(resolve: () => void): Node {
    const button = getRechargeButton();
    button.addEventListener('click', () => {
      this.energyCurrent = this.energyMax;
      this.redrawEnergy();
      resolve();
    });
    return button;
  }

  private getEndLevelMessage(term: TerminalStatus, resolve: () => void): HTMLElement {
    const message = document.createElement('div');
    message.classList.add('next-level-message');
    const header = document.createElement('h1');
    if (term.winner) {
      if (term.winner === 'x') {
        header.innerText = 'You win';
      } else {
        header.innerText = 'You lose';
      }
    } else if (term.isCat) {
      header.innerText = 'Tie';
    } else {
      header.innerText = 'Done';
    }
    const subheader = document.createElement('h2');
    subheader.innerText = `Moving on to level ${this.level.level + 1}`;
    message.appendChild(header);
    message.appendChild(subheader);
    message.appendChild(this.getEnergyCounter());
    message.appendChild(this.getEnergyChange());
    if (term.winner === 'x') {
      const explanation = document.createElement('h2');
      explanation.innerText = 'Gain a new ability';
      message.appendChild(explanation);
      message.appendChild(this.getPowerUpOptionsDisplay(resolve));
      const or = document.createElement('h2');
      or.innerText = 'OR';
      message.appendChild(or);
      message.appendChild(this.getRechargeOption(resolve));
    } else {
      const nextLevelButton = document.createElement('button');
      nextLevelButton.classList.add('next-level-button');
      nextLevelButton.innerHTML = 'Next Level';

      nextLevelButton.addEventListener('click', () => {
        resolve();
        this.checkLossCondition();
      });
      message.appendChild(nextLevelButton);
    }
    return message;
  }

  private goToNextLevelScreen(term: TerminalStatus): void {
    const nextLevelScreen = document.getElementById('next-level-screen');
    const nextLevelContent = document.getElementById('next-level-content');
    if (nextLevelScreen && nextLevelContent) {
      this.loading = true;
      const nextScreenPromise = new Promise<void>((resolve) => {
        nextLevelScreen.classList.add('visible');
        nextLevelContent.replaceChildren(this.getEndLevelMessage(term, resolve));
        if (term.winner) {
          if (term.winner === 'x') {
            this.stats.totalWins++;
            this.energyMax += 10;
            this.energyCurrent += Math.floor(this.energyMax * 0.25);
            if (this.energyCurrent > this.energyMax) {
              this.energyCurrent = this.energyMax;
            }
          } else {
            this.energyCurrent -= ENERGY_COST_LOSS;
            this.stats.totalLosses++;
          }
        } else if (term.isCat) {
          this.stats.totalTies++;
          this.energyCurrent -= ENERGY_COST_CAT;
        }
        this.checkLossCondition();
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

  private drawWinLines(spaces: NumberCoordinates[]): void {
    this.p5.stroke(COLORS.winLines);
    this.p5.strokeCap(this.p5.ROUND);
    this.p5.strokeWeight(gameAxisWidth * 2);
    this.p5.drawingContext.shadowBlur = 20;
    this.p5.drawingContext.shadowColor = COLORS.winLines;

    const cellWidth = this.getCellWidth();
    const cellHeight = this.getCellHeight();

    for (let iteration = 0; iteration < 2; iteration++) {
      for (let i = 0; i < spaces.length - 1; i++) {
        const xStart = spaces[i].x * cellWidth + cellWidth * 0.5 - gameAxisWidth;
        const yStart = spaces[i].y * cellHeight + cellHeight * 0.5 - gameAxisWidth;
        const xEnd = spaces[i + 1].x * cellWidth + cellWidth * 0.5 - gameAxisWidth;
        const yEnd = spaces[i + 1].y * cellHeight + cellHeight * 0.5 - gameAxisWidth;
        this.p5.line(xStart, yStart, xEnd, yEnd);
      }
    }
  }

  private endLevel(term: TerminalStatus): void {
    if (this.level.level === 10) {
      this.endGame(term.isWinner && term.winner === 'x');
    }
    if (term.isWinner && term.winner) {
      const spaces = this.level.getWinningSpaces(term.winner);
      this.level.board.winLines.push(spaces);
      setTimeout(() => {
        this.goToNextLevelScreen(term);
      }, 2000);
    } else {
      this.goToNextLevelScreen(term);
    }
  }

  private displayStats(win: boolean): void {
    const endGameResult = document.getElementById('end-game-result');
    const endGameStats = document.getElementById('end-game-stats');
    if (endGameStats && endGameResult) {
      const stats = document.createElement('div');
      stats.classList.add('stats-wrapper');
      const wins = document.createElement('p');
      wins.innerText = `Game Wins: ${this.stats.totalWins}`;
      stats.appendChild(wins);
      const losses = document.createElement('p');
      losses.innerText = `Game Losses: ${this.stats.totalLosses}`;
      stats.appendChild(losses);
      const ties = document.createElement('p');
      ties.innerText = `Game Ties: ${this.stats.totalTies}`;
      stats.appendChild(ties);
      const moves = document.createElement('p');
      moves.innerText = `Moves: ${this.stats.totalMoves}`;
      stats.appendChild(moves);
      const powerUps = document.createElement('p');
      powerUps.innerText = `Power-Ups Used: ${this.stats.powerUpsActivated}`;
      stats.appendChild(powerUps);
      endGameStats.replaceChildren(stats);

      const result = document.createElement('div');
      const level = document.createElement('p');
      level.innerText = `${win ? 'Victory' : 'Defeat'} on level ${this.level.level}`;
      result.appendChild(level);
      const powerUpHeader = document.createElement('h2');
      powerUpHeader.innerText = 'Power-Ups';
      result.appendChild(powerUpHeader);
      this.powerUps.forEach((powerUp) => {
        const powerUpElement = document.createElement('p');
        powerUpElement.classList.add('power-up');
        powerUpElement.innerText = powerUp.displayName;
        result.appendChild(powerUpElement);
      });

      endGameResult.replaceChildren(result);
    }
  }

  endGame(win = false): void {
    const canvasContainer = document.getElementById('canvas-container');
    const endScreen = document.getElementById('end-screen');
    const topBar = document.getElementById('top-bar');
    const sidebar = document.getElementById('sidebar');
    if (canvasContainer && endScreen && topBar && sidebar) {
      this.stats.totalLosses++;
      this.p5.remove();
      canvasContainer.innerHTML = '';
      this.displayStats(win);
      this.gameEndCallback();
      endScreen.classList.add('visible');
      sidebar.classList.remove('visible');
      topBar.classList.remove('visible');
    }
  }

  checkLossCondition(): boolean {
    if (this.energyCurrent <= 0) {
      this.endGame();
      return true;
    }
    return false;
  }

  checkWinCondition(): boolean {
    const term = checkTerminal(this.level.board, this.level.requiredWin);
    if (term.isTerminal) {
      this.endLevel(term);
      return true;
    }
    return false;
  }

  makePlay(move: Coordinate, player: Choice): boolean {
    this.level.board.selections.set(move, player);
    const isWin = this.checkWinCondition();
    if (isWin) {
      return true;
    }
    if (this.checkLossCondition()) {
      return true;
    }

    return false;
  }

  start(): void {
    this.resizeP();
    this.redrawBoard();
    this.redrawRules();
    this.redrawActions();
    if (isDebug('endlevel')) {
      this.goToNextLevelScreen({isTerminal: true, winner: 'x', isCat: false, isWinner: true});
    }
  }
}
