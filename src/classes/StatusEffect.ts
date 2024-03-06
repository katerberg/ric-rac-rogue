import {StatusEffectType} from '../types';

type StatusEffectProps = {
  type: StatusEffectType;
  turnsRemaining?: number;
};

export class StatusEffect {
  type: StatusEffectType;

  turnsRemaining: number;

  constructor({type, turnsRemaining = 1}: StatusEffectProps) {
    this.type = type;
    this.turnsRemaining = turnsRemaining;
  }
}
