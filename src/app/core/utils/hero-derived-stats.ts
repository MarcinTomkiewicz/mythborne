import {
  DERIVED_STAT_CHANCE_TARGETS,
  DERIVED_STAT_DAMAGE_TARGETS,
  DERIVED_STAT_SCOPE_CHAIN,
  TRANSITIONAL_BASE_WEAPON_DAMAGE,
} from '../constants/derived-stats.const';
import { DerivedStatKey, HeroDerivedField } from '../enums/derived-stat.enum';
import { IHeroStats } from '../interfaces/hero/i-hero-stats';
import { Bonus, BonusScope } from '../types/bonus.types';
import {
  EntityBonusWithTemplateRow,
  RuntimeDerivedStatKey,
  RuntimeDerivedStats,
} from '../types/hero-derived-stats.types';
import { IHeroDerived } from '../types/hero.types';
import { Row } from '../types/supabase.types';
import {
  normalizeBonusScope,
  normalizeBonusTarget,
  normalizeBonusType,
  resolveBonusValue,
} from './bonus';
import { nonNegativeInteger } from './number';

export function mapEntityBonus(row: EntityBonusWithTemplateRow): Bonus | null {
  const template = row.bonus_templates;

  if (!template?.is_active) {
    return null;
  }

  return {
    target: normalizeBonusTarget(template.target_key ?? template.target),
    value: Number(row.value ?? 0),
    type: normalizeBonusType(template.type_key ?? template.type),
    scope: normalizeBonusScope(row.scope_key_override ?? template.scope_key),
    levelsStep: row.level_interval_override ?? template.level_interval,
    sourceStat: row.scaling_stat_key_override ?? template.scaling_stat_key,
    scalingFactor: readScalingFactor(row.params_json, template.params_json),
  };
}

export function filterBonusesForScope(bonuses: Bonus[], scope: BonusScope): Bonus[] {
  return bonuses.filter((bonus) => DERIVED_STAT_SCOPE_CHAIN[scope].includes(bonus.scope));
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
    [definition?.bonus_target_key, definition?.secondary_bonus_target_key, DerivedStatKey.Health],
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
    [definition?.bonus_target_key, definition?.secondary_bonus_target_key, key],
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
    [
      definition?.bonus_target_key,
      definition?.secondary_bonus_target_key,
      ...DERIVED_STAT_DAMAGE_TARGETS,
    ],
    bonuses,
    heroLevel,
    baseStats,
  );

  return Math.max(definition?.min_value ?? 0, Math.floor(baseValue + bonusValue));
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

function readScalingFactor(overrideParams: unknown, templateParams: unknown): number | null {
  const overrideValue = readParamNumber(overrideParams, 'scalingFactor');

  if (overrideValue !== null) {
    return overrideValue;
  }

  return readParamNumber(templateParams, 'scalingFactor');
}

function readParamNumber(params: unknown, key: string): number | null {
  if (!params || typeof params !== 'object' || Array.isArray(params)) {
    return null;
  }

  const value = (params as Record<string, unknown>)[key];
  const numericValue = Number(value);

  return Number.isFinite(numericValue) ? numericValue : null;
}
