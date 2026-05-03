import {
  DERIVED_STAT_CHANCE_TARGETS,
  DERIVED_STAT_DAMAGE_TARGETS,
  DERIVED_STAT_SCOPE_CHAIN,
  BASE_CRITICAL_DAMAGE_PERCENT,
  TRANSITIONAL_BASE_WEAPON_DAMAGE,
} from '../constants/derived-stats.const';
import { DerivedStatKey, HeroDerivedField } from '../enums/derived-stat.enum';
import { IHeroStats } from '../interfaces/hero/i-hero-stats';
import { Bonus, BonusScope, BonusType } from '../types/bonus.types';
import {
  EntityBonusWithTemplateRow,
  RuntimeDerivedStatKey,
  RuntimeDerivedStats,
} from '../types/hero-derived-stats.types';
import { IHeroDerived } from '../types/hero.types';
import { Row } from '../types/supabase.types';
import { normalizeBonusTarget, resolveBonusValue } from './bonus';
import { finalStatValue } from './bonus-calculator';
import { mapResolvedBonus } from './bonus-governance';
import { nonNegativeInteger } from './number';
import { readParamNumber } from './params';

export function mapEntityBonus(row: EntityBonusWithTemplateRow): Bonus | null {
  if (!row.bonus_templates?.is_active) {
    return null;
  }

  const resolved = mapResolvedBonus(row);

  return {
    target: resolved.targetKey,
    value: resolved.value,
    type: resolved.typeKey as BonusType,
    scope: resolved.scopeKey as BonusScope,
    levelsStep: resolved.levelInterval,
    sourceStat: resolved.scalingStatKey,
    scalingFactor: readParamNumber(resolved.paramsJson, 'scalingFactor'),
  };
}

export function filterBonusesForScope(bonuses: Bonus[], scope: BonusScope): Bonus[] {
  return bonuses.filter((bonus) => DERIVED_STAT_SCOPE_CHAIN[scope].includes(bonus.scope));
}

export function resolveEffectiveBaseStatsForDerived(
  baseStats: IHeroStats,
  activeBonuses: Bonus[],
  heroLevel: number,
  scope: BonusScope,
): IHeroStats {
  const source = {
    name: 'derived-base-stats',
    bonuses: activeBonuses,
  };

  return Object.keys(baseStats).reduce((acc, key) => {
    acc[key] = finalStatValue(Number(baseStats[key] ?? 0), key, [source], {
      heroLevel,
      bonusScope: scope,
      sourceStats: baseStats,
    });
    return acc;
  }, {} as IHeroStats);
}

export function resolveAdditiveDerivedStats(
  baseStats: IHeroStats,
  definitions: Row<'derived_stat_definitions'>[],
  bonuses: Bonus[],
  heroLevel: number,
): RuntimeDerivedStats {
  return {
    [DerivedStatKey.Health]: 1,
    [DerivedStatKey.Defense]: resolveDefinitionValue(
      DerivedStatKey.Defense,
      baseStats,
      definitions,
      bonuses,
      heroLevel,
    ),
    [DerivedStatKey.Luck]: resolveDefinitionValue(
      DerivedStatKey.Luck,
      baseStats,
      definitions,
      bonuses,
      heroLevel,
    ),
    [DerivedStatKey.CriticalChance]: resolveDefinitionValue(
      DerivedStatKey.CriticalChance,
      baseStats,
      definitions,
      bonuses,
      heroLevel,
    ),
    [DerivedStatKey.CriticalDamage]: resolveCriticalDamageValue(
      baseStats,
      definitions,
      bonuses,
      heroLevel,
    ),
    [DerivedStatKey.EvasionChance]: resolveDefinitionValue(
      DerivedStatKey.EvasionChance,
      baseStats,
      definitions,
      bonuses,
      heroLevel,
    ),
    [DerivedStatKey.MinDamage]: resolveDamageValue(
      DerivedStatKey.MinDamage,
      baseStats,
      definitions,
      bonuses,
      heroLevel,
    ),
    [DerivedStatKey.MaxDamage]: resolveDamageValue(
      DerivedStatKey.MaxDamage,
      baseStats,
      definitions,
      bonuses,
      heroLevel,
    ),
  };
}

export function resolveDerivedStatHealth(
  baseHealth: number,
  definition: Row<'derived_stat_definitions'> | null,
  baseStats: IHeroStats,
  bonuses: Bonus[],
  heroLevel: number,
): number {
  const bonusValue = sumBonuses(
    derivedBonusTargets(definition, DerivedStatKey.Health),
    bonuses,
    heroLevel,
    baseStats,
  );

  return Math.max(definition?.min_value ?? 1, Math.floor(baseHealth + bonusValue));
}

export function normalizeRuntimeDerivedStats(stats: RuntimeDerivedStats): RuntimeDerivedStats {
  const minDamage = nonNegativeInteger(stats[DerivedStatKey.MinDamage]);
  const maxDamage = Math.max(minDamage, nonNegativeInteger(stats[DerivedStatKey.MaxDamage]));

  return {
    ...stats,
    [DerivedStatKey.MinDamage]: minDamage,
    [DerivedStatKey.MaxDamage]: maxDamage,
  };
}

export function toHeroDerived(stats: RuntimeDerivedStats): IHeroDerived {
  return {
    [HeroDerivedField.Health]: stats[DerivedStatKey.Health],
    [HeroDerivedField.Defense]: stats[DerivedStatKey.Defense],
    [HeroDerivedField.Luck]: stats[DerivedStatKey.Luck],
    [HeroDerivedField.MinDamage]: stats[DerivedStatKey.MinDamage],
    [HeroDerivedField.MaxDamage]: stats[DerivedStatKey.MaxDamage],
    [HeroDerivedField.CriticalChance]: stats[DerivedStatKey.CriticalChance],
    [HeroDerivedField.CriticalDamage]: stats[DerivedStatKey.CriticalDamage],
    [HeroDerivedField.EvasionChance]: stats[DerivedStatKey.EvasionChance],
  };
}

export function findDerivedDefinition(
  key: RuntimeDerivedStatKey,
  definitions: Row<'derived_stat_definitions'>[],
): Row<'derived_stat_definitions'> | null {
  return (
    definitions.find((definition) => definition.key === key) ??
    definitions.find((definition) => normalizeBonusTarget(definition.key) === key) ??
    null
  );
}

function resolveDefinitionValue(
  key: RuntimeDerivedStatKey,
  baseStats: IHeroStats,
  definitions: Row<'derived_stat_definitions'>[],
  bonuses: Bonus[],
  heroLevel: number,
): number {
  const definition = findDerivedDefinition(key, definitions);
  const baseValue = resolveBaseValue(definition, baseStats, key);
  const bonusValue = sumBonuses(
    derivedBonusTargets(definition, key),
    bonuses,
    heroLevel,
    baseStats,
  );

  return Math.max(definition?.min_value ?? 0, Math.floor(baseValue + bonusValue));
}

function resolveDamageValue(
  key: DerivedStatKey.MinDamage | DerivedStatKey.MaxDamage,
  baseStats: IHeroStats,
  definitions: Row<'derived_stat_definitions'>[],
  bonuses: Bonus[],
  heroLevel: number,
): number {
  const definition = findDerivedDefinition(key, definitions);
  const fallbackWeaponDamage =
    key === DerivedStatKey.MinDamage
      ? TRANSITIONAL_BASE_WEAPON_DAMAGE.min
      : TRANSITIONAL_BASE_WEAPON_DAMAGE.max;
  const baseValue = resolveBaseValue(definition, baseStats, key) + fallbackWeaponDamage;
  const bonusValue = sumBonuses(
    derivedBonusTargets(definition, key, DERIVED_STAT_DAMAGE_TARGETS),
    bonuses,
    heroLevel,
    baseStats,
  );

  return Math.max(definition?.min_value ?? 0, Math.floor(baseValue + bonusValue));
}

function resolveCriticalDamageValue(
  baseStats: IHeroStats,
  definitions: Row<'derived_stat_definitions'>[],
  bonuses: Bonus[],
  heroLevel: number,
): number {
  const definition = findDerivedDefinition(DerivedStatKey.CriticalDamage, definitions);
  const bonusValue = sumBonuses(
    derivedBonusTargets(definition, DerivedStatKey.CriticalDamage),
    bonuses,
    heroLevel,
    baseStats,
  );

  return Math.max(
    definition?.min_value ?? 0,
    Math.floor(BASE_CRITICAL_DAMAGE_PERCENT + bonusValue),
  );
}

function resolveBaseValue(
  definition: Row<'derived_stat_definitions'> | null,
  baseStats: IHeroStats,
  key: RuntimeDerivedStatKey,
): number {
  if (definition?.base_stat_key) {
    return Number(baseStats[definition.base_stat_key] ?? 0);
  }

  if (key === DerivedStatKey.Defense) {
    return Number(baseStats.endurance ?? 0);
  }

  if (key === DerivedStatKey.MinDamage || key === DerivedStatKey.MaxDamage) {
    return Number(baseStats.strength ?? 0);
  }

  return 0;
}

function derivedBonusTargets(
  definition: Row<'derived_stat_definitions'> | null,
  key: RuntimeDerivedStatKey,
  extraTargets: readonly string[] = [key],
): Array<string | null | undefined> {
  const baseStatKey = normalizeBonusTarget(definition?.base_stat_key);

  return [
    definition?.bonus_target_key,
    definition?.secondary_bonus_target_key,
    ...extraTargets,
  ].filter((target) => normalizeBonusTarget(target) !== baseStatKey);
}

function sumBonuses(
  targets: Array<string | null | undefined>,
  bonuses: Bonus[],
  heroLevel: number,
  sourceStats: Record<string, number>,
): number {
  const normalizedTargets = new Set(
    targets
      .filter((target): target is string => !!target)
      .map((target) => normalizeBonusTarget(target)),
  );

  return bonuses.reduce((sum, bonus) => {
    const target = normalizeBonusTarget(bonus.target);

    if (!normalizedTargets.has(target)) {
      return sum;
    }

    return sum + resolveRuntimeBonusValue(bonus, target, heroLevel, sourceStats);
  }, 0);
}

function resolveRuntimeBonusValue(
  bonus: Bonus,
  target: string,
  heroLevel: number,
  sourceStats: Record<string, number>,
): number {
  if (bonus.type === 'percent' && !DERIVED_STAT_CHANCE_TARGETS.includes(target as DerivedStatKey)) {
    return 0;
  }

  if (bonus.type === 'resource_percent') {
    return 0;
  }

  return resolveBonusValue(bonus, { heroLevel, sourceStats });
}
