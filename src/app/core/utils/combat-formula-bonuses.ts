import { CombatFormulaBonusSnapshot } from '../domain/combat/combat.model';

export function defaultCombatFormulaBonusesForOpponent(): CombatFormulaBonusSnapshot {
  return {
    hitBonusFromItems: 0,
    critBonusFromItems: 0,
    evasionBonusFromItems: 0,
    damageBonusFromItems: 0,
  };
}
