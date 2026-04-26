import {
  Bonus,
  BonusScope,
  BonusTargetDefinition,
  BonusTemplate,
  BonusType,
  EditableAppliedBonus,
} from '../types/bonus.types';

export const FALLBACK_BONUS_TYPE_OPTIONS = [
  { label: 'flat', value: 'flat' },
  { label: 'percent', value: 'percent' },
  { label: 'per levels', value: 'per_levels' },
  { label: 'scaled stat bonus', value: 'scaled_stat_bonus' },
  { label: 'resource flat', value: 'resource_flat' },
  { label: 'resource percent', value: 'resource_percent' },
  { label: 'capacity flat', value: 'capacity_flat' },
  { label: 'unlock feature', value: 'unlock_feature' },
] as const;

export const FALLBACK_BONUS_SCOPE_OPTIONS = [
  { label: 'global', value: 'global' },
  { label: 'combat', value: 'combat' },
  { label: 'pvp attack', value: 'pvp_attack' },
  { label: 'pvp defense', value: 'pvp_defense' },
  { label: 'trial', value: 'trial' },
  { label: 'exploration', value: 'exploration' },
  { label: 'requirements', value: 'requirements' },
  { label: 'trade', value: 'trade' },
  { label: 'auction', value: 'auction' },
  { label: 'economy', value: 'economy' },
  { label: 'building management', value: 'building_management' },
] as const;

// Temporary UI fallback. Runtime/admin data should read dictionary tables.
export const BONUS_TYPE_OPTIONS = FALLBACK_BONUS_TYPE_OPTIONS;
export const BONUS_SCOPE_OPTIONS = FALLBACK_BONUS_SCOPE_OPTIONS;

const BONUS_TYPES = new Set<BonusType>(FALLBACK_BONUS_TYPE_OPTIONS.map((option) => option.value));
const BONUS_SCOPES = new Set<BonusScope>(FALLBACK_BONUS_SCOPE_OPTIONS.map((option) => option.value));

export function normalizeBonusType(value: string | null | undefined): BonusType {
  if (value === 'per_4_levels') {
    return 'per_levels';
  }

  return BONUS_TYPES.has(value as BonusType) ? (value as BonusType) : 'flat';
}

export function normalizeBonusScope(value: string | null | undefined): BonusScope {
  return BONUS_SCOPES.has(value as BonusScope) ? (value as BonusScope) : 'global';
}

export function normalizeBonusTarget(value: string | null | undefined): string {
  const normalized = (value ?? '').trim();

  if (normalized === 'min_dmg') {
    return 'min_damage';
  }

  if (normalized === 'max_dmg') {
    return 'max_damage';
  }

  if (normalized === 'defense') {
    return 'defense';
  }

  if (normalized === 'min_damage') {
    return 'min_damage';
  }

  if (normalized === 'max_damage') {
    return 'max_damage';
  }

  if (normalized === 'critical_chance') {
    return 'critical_chance';
  }

  if (normalized === 'evasion_chance') {
    return 'evasion_chance';
  }

  if (normalized === 'def') {
    return 'defense';
  }

  if (normalized === 'minDmg') {
    return 'min_damage';
  }

  if (normalized === 'maxDmg') {
    return 'max_damage';
  }

  if (normalized === 'critical') {
    return 'critical_chance';
  }

  if (normalized === 'evasion') {
    return 'evasion_chance';
  }

  return normalized;
}

export function normalizeBonusTemplate(row: {
  id: string;
  key?: string | null;
  label?: string | null;
  category?: string | null;
  target?: string | null;
  target_key?: string | null;
    type?: string | null;
    type_key?: string | null;
  scope?: string | null;
  scope_key?: string | null;
  description?: string | null;
  base_value?: number | null;
  value?: number | null;
  levels_step?: number | null;
  level_interval?: number | null;
  source_stat?: string | null;
  scaling_stat_key?: string | null;
  scaling_factor?: number | null;
  params_json?: unknown;
  sort_order?: number | null;
  is_active?: boolean | null;
}): BonusTemplate {
  const scope = normalizeBonusScope(row.scope_key ?? row.scope);
  const scalingFactor =
    row.scaling_factor ?? readParamNumber(row.params_json, 'scalingFactor');

  return {
    id: row.id,
    key: row.key ?? '',
    label: row.label ?? row.key ?? '',
    category: (row.category ?? 'general').trim() || 'general',
    target: normalizeBonusTarget(row.target_key ?? row.target),
    type: normalizeBonusType(row.type_key ?? row.type),
    scope,
    description: row.description ?? '',
    baseValue: Number(row.value ?? row.base_value ?? 0),
    levelsStep: row.level_interval ?? row.levels_step ?? null,
    sourceStat: row.scaling_stat_key ?? row.source_stat ?? null,
    scalingFactor,
    sortOrder: Number(row.sort_order ?? 0),
    isActive: row.is_active ?? true,
  };
}

export function toEditableAppliedBonus(
  template: BonusTemplate | null,
  overrides?: Partial<EditableAppliedBonus> & {
    baseValue?: number | null;
    levelsStep?: number | null;
    sourceStat?: string | null;
    scalingFactor?: number | null;
  }
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

function readParamNumber(params: unknown, key: string): number | null {
  if (!params || typeof params !== 'object' || Array.isArray(params)) {
    return null;
  }

  const value = (params as Record<string, unknown>)[key];
  const numericValue = Number(value);

  return Number.isFinite(numericValue) ? numericValue : null;
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
  maybeOptions?: { includePlus?: boolean }
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
    typeof bonusOrValue === 'number' ? maybeOptions : (typeOrOptions as { includePlus?: boolean } | undefined);
  const includePlus = options?.includePlus ?? true;
  const rawValue = Number(bonus.baseValue ?? 0);
  const signedValue = includePlus && rawValue > 0 ? `+${rawValue}` : `${rawValue}`;

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
    | Pick<Bonus, 'value' | 'type' | 'levelsStep' | 'sourceStat' | 'scalingFactor'>,
  options?: {
    heroLevel?: number;
    sourceStats?: Record<string, number>;
  }
): number {
  const baseValue = Number('baseValue' in bonus ? bonus.baseValue : bonus.value ?? 0);

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
  category: string
): BonusTemplate[] {
  return templates.filter((template) => template.category === category);
}

export function uniqueBonusCategories(
  templates: readonly Pick<BonusTemplate, 'category'>[]
): string[] {
  return Array.from(
    new Set(templates.map((template) => template.category).filter((category) => !!category))
  ).sort((left, right) => left.localeCompare(right));
}

export function statLikeBonusTargets(
  targets: readonly BonusTargetDefinition[]
): BonusTargetDefinition[] {
  return targets.filter((target) => target.kind === 'stat' || target.kind === 'derived_stat');
}
