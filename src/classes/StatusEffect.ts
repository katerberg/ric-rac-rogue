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

  get name(): string {
    switch (this.type) {
      case StatusEffectType.EXTRA_TURN:
        return 'Extra Turn';
      case StatusEffectType.FORCE_RANDOM:
        return 'Random Move';
      default:
        return 'Status Effect';
    }
  }
}
