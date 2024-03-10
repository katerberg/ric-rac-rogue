import {PowerUpType} from '../types';

type PowerUpProps = {
  type: PowerUpType;
  cost?: number;
  displayName?: string;
  cooldown?: number;
  cooldownRemaining?: number;
};

function getDefaultCost(type: PowerUpType): number {
  switch (type) {
    // Lethal
    case PowerUpType.EXTRA_TURN:
      return 50;
    case PowerUpType.COPY_COLUMN:
    case PowerUpType.COPY_ROW:
      return 40;
    case PowerUpType.FLIP_TILE:
      return 20;
    case PowerUpType.INCREASE_ENERGY:
      return -20;
    case PowerUpType.INCREASE_MAX_ENERGY:
      return 30;
    case PowerUpType.FORCE_SPACE:
      return 30;
    // Moderate
    case PowerUpType.INCREASE_REQUIRED_WIN:
    case PowerUpType.DECREASE_REQUIRED_WIN:
      return 30;
    // Risky
    case PowerUpType.TELEPORT_RANDOM:
      return 10;
    case PowerUpType.FORCE_RANDOM:
      return 10;
    // Situational
    case PowerUpType.BLOCKED_SPACE:
      return 20;
    case PowerUpType.REVERSE_COLUMN:
    case PowerUpType.REVERSE_ROW:
      return 20;
    case PowerUpType.REMOVE_COLUMN:
    case PowerUpType.REMOVE_ROW:
      return 20;
    case PowerUpType.RESET_COOLDOWN:
      return 10;
    default:
      return 10;
  }
}

function getDefaultCooldown(type: PowerUpType): number {
  switch (type) {
    case PowerUpType.EXTRA_TURN:
      return 4;
    case PowerUpType.FLIP_TILE:
      return 7;
    case PowerUpType.RESET_COOLDOWN:
      return 8;
    case PowerUpType.COPY_COLUMN:
    case PowerUpType.COPY_ROW:
      return 4;
    case PowerUpType.REVERSE_COLUMN:
    case PowerUpType.REVERSE_ROW:
      return 3;
    case PowerUpType.REMOVE_COLUMN:
    case PowerUpType.REMOVE_ROW:
      return 3;
    case PowerUpType.INCREASE_REQUIRED_WIN:
    case PowerUpType.DECREASE_REQUIRED_WIN:
      return 9;
    case PowerUpType.INCREASE_ENERGY:
      return 8;
    case PowerUpType.INCREASE_MAX_ENERGY:
      return 10;
    case PowerUpType.FORCE_RANDOM:
      return 3;
    case PowerUpType.BLOCKED_SPACE:
      return 7;
    case PowerUpType.FORCE_SPACE:
      return 8;
    case PowerUpType.TELEPORT_RANDOM:
      return 4;
    default:
      return 3;
  }
}

export class PowerUp {
  type: PowerUpType;

  cost: number;

  cooldown: number;

  cooldownRemaining: number;

  constructor({type, cost, cooldown, cooldownRemaining = 0}: PowerUpProps) {
    this.type = type;
    this.cost = cost ?? getDefaultCost(type);
    this.cooldown = cooldown ?? getDefaultCooldown(type);
    this.cooldownRemaining = cooldownRemaining;
  }

  get description(): string {
    switch (this.type) {
      case PowerUpType.EXTRA_TURN:
        return 'Grants an additional turn to make moves beyond their regular turn';
      case PowerUpType.FLIP_TILE:
        return 'Change a tile on the game board, changing an "o" to an "x"';
      case PowerUpType.RESET_COOLDOWN:
        return 'Resets the cooldown timer on another power-up, allowing it to be used again';
      case PowerUpType.COPY_COLUMN:
        return 'Duplicates the contents of an entire column and places the copy after it';
      case PowerUpType.COPY_ROW:
        return 'Duplicates the contents of an entire row and places the copy below it';
      case PowerUpType.INCREASE_ENERGY:
        return 'Acquire additional energy points on each use';
      case PowerUpType.INCREASE_MAX_ENERGY:
        return 'Permanently increase your maximum energy points';
      case PowerUpType.FORCE_RANDOM:
        return 'Forces your opponent to play on a random space on the game board for a turn';
      case PowerUpType.FORCE_SPACE:
        return 'Forces your opponent to play on a designated space on the game board for a turn';
      case PowerUpType.BLOCKED_SPACE:
        return 'Obstructs a designated space on the game board for a turn';
      case PowerUpType.REMOVE_COLUMN:
        return 'Deletes an entire column from the game board';
      case PowerUpType.REMOVE_ROW:
        return 'Deletes an entire row from the game board';
      case PowerUpType.REVERSE_COLUMN:
        // eslint-disable-next-line quotes
        return "Flips a column's contents on the game board";
      case PowerUpType.REVERSE_ROW:
        // eslint-disable-next-line quotes
        return "Flips a row's contents on the game board";
      case PowerUpType.INCREASE_REQUIRED_WIN:
        return 'Increases the threshold for a victory by one';
      case PowerUpType.DECREASE_REQUIRED_WIN:
        return 'Decreases the threshold for a victory by one';
      case PowerUpType.TELEPORT_RANDOM:
        return 'Repositions a move to a random empty space on the game board';
      default:
        return '';
    }
  }

  get displayName(): string {
    switch (this.type) {
      case PowerUpType.EXTRA_TURN:
        return 'Extra Turn';
      case PowerUpType.FLIP_TILE:
        return 'Flip Tile';
      case PowerUpType.RESET_COOLDOWN:
        return 'Reset Cooldown';
      case PowerUpType.COPY_COLUMN:
        return 'Copy Column';
      case PowerUpType.COPY_ROW:
        return 'Copy Row';
      case PowerUpType.INCREASE_ENERGY:
        return 'Gain Energy';
      case PowerUpType.INCREASE_MAX_ENERGY:
        return 'Max Energy';
      case PowerUpType.FORCE_RANDOM:
        return 'Force Random';
      case PowerUpType.FORCE_SPACE:
        return 'Force Play';
      case PowerUpType.BLOCKED_SPACE:
        return 'Block Space';
      case PowerUpType.REMOVE_COLUMN:
        return 'Remove Column';
      case PowerUpType.REMOVE_ROW:
        return 'Remove Row';
      case PowerUpType.REVERSE_COLUMN:
        return 'Reverse Column';
      case PowerUpType.REVERSE_ROW:
        return 'Reverse Row';
      case PowerUpType.INCREASE_REQUIRED_WIN:
        return 'Boost Win Req';
      case PowerUpType.DECREASE_REQUIRED_WIN:
        return 'Trim Win Req';
      case PowerUpType.TELEPORT_RANDOM:
        return 'Random Warp';
      default:
        return 'Power Up';
    }
  }
}

export function getStartingPowerUp(): PowerUp {
  const startingPowerUpOptions = [
    new PowerUp({type: PowerUpType.FLIP_TILE}),
    new PowerUp({type: PowerUpType.COPY_COLUMN}),
    new PowerUp({type: PowerUpType.COPY_ROW}),
    new PowerUp({type: PowerUpType.REVERSE_COLUMN}),
    new PowerUp({type: PowerUpType.REVERSE_ROW}),
    new PowerUp({type: PowerUpType.TELEPORT_RANDOM}),
    new PowerUp({type: PowerUpType.BLOCKED_SPACE}),
  ];

  return startingPowerUpOptions[Math.floor(Math.random() * startingPowerUpOptions.length)];
}
