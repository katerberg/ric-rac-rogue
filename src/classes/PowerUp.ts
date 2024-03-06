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
      return 20;
    case PowerUpType.COPY_ROW:
      return 20;
    case PowerUpType.INCREASE_ENERGY:
      return -30;
    case PowerUpType.INCREASE_MAX_ENERGY:
      return 30;
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
    case PowerUpType.INCREASE_ENERGY:
      return 8;
    case PowerUpType.INCREASE_MAX_ENERGY:
      return 8;
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
      default:
        return 'Power Up';
    }
  }
}
