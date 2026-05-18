import {
  Bonus,
  BonusScope,
  BonusTargetDefinition,
  BonusTemplate,
  BonusType,
  EditableAppliedBonus,
} from '../types/bonus.types';
import { BONUS_SCOPES } from '../constants/bonus-scopes.const';
import { uniqueSorted } from './collection';
import { normalizeKeyText, trimText } from './normalize-text';

const BONUS_SCOPE_VALUES = new Set<BonusScope>(Object.values(BONUS_SCOPES));

export function normalizeBonusType(
  value: string | null | undefined,
): BonusType {
  switch (value) {
    case 'flat':
    case 'percent':
    case 'per_levels':
    case 'scaled_stat_bonus':
    case 'resource_flat':
    case 'resource_percent':
    case 'capacity_flat':
    case 'unlock_feature':
      return value;
    default:
      return 'flat';
  }
}

export function normalizeBonusScope(
  value: string | null | undefined,
): BonusScope {
  return BONUS_SCOPE_VALUES.has(value as BonusScope)
    ? (value as BonusScope)
    : 'global';
}

export function normalizeBonusTarget(value: string | null | undefined): string {
  return trimText(value);
}

export function normalizeBonusTargetKey(value: string | null | undefined): string | null {
  const normalized = normalizeKeyText(normalizeBonusTarget(value))
    .replace(/_flat$/i, '')
    .replace(/_percent$/i, '')
    .replace(/^maximum_/, 'max_')
    .replace(/^minimum_/, 'min_');

  return normalized || null;
}

export function toEditableAppliedBonus(
  template: BonusTemplate | null,
  overrides?: Partial<EditableAppliedBonus> & {
    baseValue?: number | null;
    levelsStep?: number | null;
    sourceStat?: string | null;
    scalingFactor?: number | null;
  },
): EditableAppliedBonus {
  const scope = overrides?.scope ?? template?.scope ?? 'global';

  return {
    id: overrides?.id ?? null,
    templateId: overrides?.templateId ?? template?.id ?? null,
    category: overrides?.category ?? template?.category ?? 'general',
    templateLabel: overrides?.templateLabel ?? template?.label ?? '',
    target: overrides?.target ?? template?.target ?? '',
    type: overrides?.type ?? template?.type ?? 'flat',
    scope,
    description: overrides?.description ?? template?.description ?? '',
    baseValue: Number(overrides?.baseValue ?? template?.baseValue ?? 0),
    levelsStep: overrides?.levelsStep ?? template?.levelsStep ?? null,
    sourceStat: overrides?.sourceStat ?? template?.sourceStat ?? null,
    scalingFactor: overrides?.scalingFactor ?? template?.scalingFactor ?? null,
  };
}

export function bonusTypeUsesBaseValue(type: BonusType): boolean {
  return type !== 'unlock_feature';
}

export function bonusTypeUsesLevelsStep(type: BonusType): boolean {
  return type === 'per_levels';
}

export function bonusTypeUsesSourceStat(type: BonusType): boolean {
  return type === 'scaled_stat_bonus';
}

export function bonusTypeUsesScalingFactor(type: BonusType): boolean {
  return type === 'scaled_stat_bonus';
}

export function formatBonusValue(
  bonusOrValue:
    | number
    | Pick<
        EditableAppliedBonus,
        'baseValue' | 'type' | 'levelsStep' | 'sourceStat' | 'scalingFactor'
      >,
  typeOrOptions?: BonusType | { includePlus?: boolean },
  maybeOptions?: { includePlus?: boolean },
): string {
  const bonus =
    typeof bonusOrValue === 'number'
      ? {
          baseValue: bonusOrValue,
          type: (typeOrOptions as BonusType) ?? 'flat',
          levelsStep: null,
          sourceStat: null,
          scalingFactor: null,
        }
      : bonusOrValue;
  const options =
    typeof bonusOrValue === 'number'
      ? maybeOptions
      : (typeOrOptions as { includePlus?: boolean } | undefined);
  const includePlus = options?.includePlus ?? true;
  const rawValue = Number(bonus.baseValue ?? 0);
  const signedValue =
    includePlus && rawValue > 0 ? `+${rawValue}` : `${rawValue}`;

  switch (bonus.type) {
    case 'percent':
    case 'resource_percent':
      return `${rawValue}%`;
    case 'per_levels':
      return `${signedValue} / ${bonus.levelsStep ?? 1} lvls`;
    case 'scaled_stat_bonus':
      return `${signedValue} + ${bonus.scalingFactor ?? 0} * ${bonus.sourceStat ?? 'stat'}`;
    case 'unlock_feature':
      return 'Unlock';
    default:
      return signedValue;
  }
}

export function resolveBonusValue(
  bonus:
    | Pick<
        EditableAppliedBonus,
        'baseValue' | 'type' | 'levelsStep' | 'sourceStat' | 'scalingFactor'
      >
    | Pick<
        Bonus,
        'value' | 'type' | 'levelsStep' | 'sourceStat' | 'scalingFactor'
      >,
  options?: {
    heroLevel?: number;
    sourceStats?: Record<string, number>;
  },
): number {
  const baseValue = Number(
    'baseValue' in bonus ? bonus.baseValue : (bonus.value ?? 0),
  );

  switch (bonus.type) {
    case 'per_levels': {
      const heroLevel = Math.max(0, Math.floor(options?.heroLevel ?? 0));
      const step = Math.max(1, Math.floor(bonus.levelsStep ?? 1));
      return baseValue * Math.floor(heroLevel / step);
    }
    case 'scaled_stat_bonus': {
      const sourceStat = bonus.sourceStat ?? '';
      const sourceValue = Number(options?.sourceStats?.[sourceStat] ?? 0);
      return baseValue + sourceValue * Number(bonus.scalingFactor ?? 0);
    }
    case 'unlock_feature':
      return 0;
    default:
      return baseValue;
  }
}

export function filterBonusTemplatesByCategory(
  templates: readonly BonusTemplate[],
  category: string,
): BonusTemplate[] {
  return templates.filter((template) => template.category === category);
}

export function uniqueBonusCategories(
  templates: readonly Pick<BonusTemplate, 'category'>[],
): string[] {
  return uniqueSorted(
    templates
      .map((template) => template.category)
      .filter((category) => !!category),
  );
}

export function statLikeBonusTargets(
  targets: readonly BonusTargetDefinition[],
): BonusTargetDefinition[] {
  return targets.filter(
    (target) => target.kind === 'stat' || target.kind === 'derived_stat',
  );
}
