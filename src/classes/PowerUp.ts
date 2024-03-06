import {PowerUpType} from '../types';

type PowerUpProps = {
  type: PowerUpType;
  cost?: number;
  displayName?: string;
  cooldown?: number;
  cooldownRemaining?: number;
};

export class PowerUp {
  type: PowerUpType;

  displayName: string;

  cost: number;

  cooldown: number;

  cooldownRemaining: number;

  constructor({type, cost = 20, displayName = 'Power Up', cooldown = 3, cooldownRemaining = 0}: PowerUpProps) {
    this.type = type;
    this.displayName = displayName;
    this.cost = cost;
    this.cooldown = cooldown;
    this.cooldownRemaining = cooldownRemaining;
  }
}
