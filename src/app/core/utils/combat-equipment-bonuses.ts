import { BONUS_SCOPES } from '../constants/bonus-scopes.const';
import { COMBAT_ITEM_BONUS_TARGETS } from '../constants/bonus-targets.const';
import { CombatBonusSnapshot } from '../domain/combat/combat-sandbox.model';
import { IHeroStats } from '../interfaces/hero/i-hero-stats';
import { Bonus } from '../types/bonus.types';
import { normalizeBonusTarget, resolveBonusValue } from './bonus';
import { filterBonusesForScope } from './hero-derived-stats';

export function emptyCombatBonusSnapshot(): CombatBonusSnapshot {
  return {
    hitBonusFromItems: 0,
    critBonusFromItems: 0,
    criticalDamageBonusFromItems: 0,
    evasionBonusFromItems: 0,
    damageBonusFromItems: 0,
  };
}

export function toCombatBonusSnapshotFromEquipment(
  bonuses: readonly Bonus[],
  heroLevel: number,
  sourceStats: IHeroStats
): CombatBonusSnapshot {
  const scopedBonuses = filterBonusesForScope([...bonuses], BONUS_SCOPES.Combat);

  return {
    hitBonusFromItems: sumCombatBonusTargets(
      scopedBonuses,
      COMBAT_ITEM_BONUS_TARGETS.Hit,
      heroLevel,
      sourceStats
    ),
    critBonusFromItems: sumCombatBonusTargets(
      scopedBonuses,
      COMBAT_ITEM_BONUS_TARGETS.Critical,
      heroLevel,
      sourceStats
    ),
    criticalDamageBonusFromItems: sumCombatBonusTargets(
      scopedBonuses,
      COMBAT_ITEM_BONUS_TARGETS.CriticalDamage,
      heroLevel,
      sourceStats
    ),
    evasionBonusFromItems: sumCombatBonusTargets(
      scopedBonuses,
      COMBAT_ITEM_BONUS_TARGETS.Evasion,
      heroLevel,
      sourceStats
    ),
    damageBonusFromItems: sumCombatBonusTargets(
      scopedBonuses,
      COMBAT_ITEM_BONUS_TARGETS.Damage,
      heroLevel,
      sourceStats
    ),
  };
}

function sumCombatBonusTargets(
  bonuses: readonly Bonus[],
  targets: readonly string[],
  heroLevel: number,
  sourceStats: Record<string, number>
): number {
  const normalizedTargets = new Set(targets.map((target) => normalizeBonusTarget(target)));

  return bonuses.reduce((sum, bonus) => {
    const target = normalizeBonusTarget(bonus.target);

    if (!normalizedTargets.has(target)) {
      return sum;
    }

    return sum + resolveBonusValue(bonus, { heroLevel, sourceStats });
  }, 0);
}
