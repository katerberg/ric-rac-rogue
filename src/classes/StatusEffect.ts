import {NumberCoordinates, StatusEffectType} from '../types';

type StatusEffectProps = {
  type: StatusEffectType;
  turnsRemaining?: number;
  target?: NumberCoordinates;
};

export class StatusEffect {
  type: StatusEffectType;

  turnsRemaining: number;

  target: NumberCoordinates | undefined;

  constructor({type, turnsRemaining = 1, target}: StatusEffectProps) {
    this.type = type;
    this.turnsRemaining = turnsRemaining;
    this.target = target;
  }

  get name(): string {
    switch (this.type) {
      case StatusEffectType.EXTRA_TURN:
        return 'Extra Turn';
      case StatusEffectType.FORCE_RANDOM:
        return 'Random Move';
      case StatusEffectType.BLOCKED_SPACE:
        return 'Blocked Space';
      case StatusEffectType.FORCE_SPACE:
        return 'Forced Play';
      default:
        return 'Status Effect';
    }
  }
}
