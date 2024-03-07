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
    case PowerUpType.EXTRA_TURN:
      return 20;
    case PowerUpType.FLIP_TILE:
      return 20;
    case PowerUpType.RESET_COOLDOWN:
      return 10;
    case PowerUpType.COPY_COLUMN:
    case PowerUpType.COPY_ROW:
      return 20;
    case PowerUpType.REMOVE_COLUMN:
    case PowerUpType.REMOVE_ROW:
      return 20;
    case PowerUpType.INCREASE_ENERGY:
      return -30;
    case PowerUpType.INCREASE_MAX_ENERGY:
      return 30;
    case PowerUpType.FORCE_RANDOM:
      return 30;
    case PowerUpType.BLOCKED_SPACE:
      return 20;
    case PowerUpType.FORCE_SPACE:
      return 30;
    case PowerUpType.INCREASE_REQUIRED_WIN:
    case PowerUpType.DECREASE_REQUIRED_WIN:
      return 30;
    case PowerUpType.TELEPORT_RANDOM:
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
      return 3;
    case PowerUpType.RESET_COOLDOWN:
      return 8;
    case PowerUpType.COPY_COLUMN:
    case PowerUpType.COPY_ROW:
      return 3;
    case PowerUpType.REMOVE_COLUMN:
    case PowerUpType.REMOVE_ROW:
      return 3;
    case PowerUpType.INCREASE_REQUIRED_WIN:
    case PowerUpType.DECREASE_REQUIRED_WIN:
      return 5;
    case PowerUpType.INCREASE_ENERGY:
      return 8;
    case PowerUpType.INCREASE_MAX_ENERGY:
      return 8;
    case PowerUpType.FORCE_RANDOM:
      return 2;
    case PowerUpType.BLOCKED_SPACE:
      return 4;
    case PowerUpType.FORCE_SPACE:
      return 5;
    case PowerUpType.TELEPORT_RANDOM:
      return 1;
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
    new PowerUp({type: PowerUpType.EXTRA_TURN}),
    new PowerUp({type: PowerUpType.TELEPORT_RANDOM}),
    new PowerUp({type: PowerUpType.FORCE_RANDOM}),
    new PowerUp({type: PowerUpType.BLOCKED_SPACE}),
  ];

  return startingPowerUpOptions[Math.floor(Math.random() * startingPowerUpOptions.length)];
}
