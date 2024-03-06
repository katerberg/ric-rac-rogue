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
    default:
      return 10;
  }
}

export class PowerUp {
  type: PowerUpType;

  cost: number;

  cooldown: number;

  cooldownRemaining: number;

  constructor({type, cost = 20, cooldown = 3, cooldownRemaining = 0}: PowerUpProps) {
    this.type = type;
    this.cost = cost ?? getDefaultCost(type);
    this.cooldown = cooldown;
    this.cooldownRemaining = cooldownRemaining;
  }

  get displayName(): string {
    switch (this.type) {
      case PowerUpType.EXTRA_TURN:
        return 'Extra Turn';
      case PowerUpType.FLIP_TILE:
        return 'Flip Tile';
      default:
        return 'Power Up';
    }
  }
}
