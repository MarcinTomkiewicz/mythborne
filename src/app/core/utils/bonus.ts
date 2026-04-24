import { BonusType } from '../types/bonus.types';

export const BONUS_TYPE_OPTIONS = [
  { label: 'flat', value: 'flat' },
  { label: 'percent', value: 'percent' },
  { label: 'per 4 hero levels', value: 'per_4_levels' },
] as const;

export function normalizeBonusType(value: string | null | undefined): BonusType {
  if (value === 'percent' || value === 'per_4_levels') {
    return value;
  }

  return 'flat';
}

export function normalizeBonusTarget(value: string | null | undefined): string {
  const normalized = (value ?? '').trim();

  if (normalized === 'min_dmg') {
    return 'minDmg';
  }

  if (normalized === 'max_dmg') {
    return 'maxDmg';
  }

  return normalized;
}

export function formatBonusValue(
  value: number,
  type: BonusType,
  options?: { includePlus?: boolean }
): string {
  const includePlus = options?.includePlus ?? true;
  const withOptionalPlus = includePlus && value > 0 ? `+${value}` : `${value}`;

  if (type === 'percent') {
    return `${value}%`;
  }

  if (type === 'per_4_levels') {
    return `${withOptionalPlus} / 4 hero lvls`;
  }

  return withOptionalPlus;
}

export function resolveBonusValue(
  value: number,
  type: BonusType,
  context?: { heroLevel?: number }
): number {
  if (type === 'per_4_levels') {
    const heroLevel = Math.max(0, Math.floor(context?.heroLevel ?? 0));
    return value * Math.floor(heroLevel / 4);
  }

  return value;
}
