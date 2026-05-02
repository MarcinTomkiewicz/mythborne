import { AbstractControl } from '@angular/forms';
import { REWARD_ASSIGNMENT_MATCH_KIND } from '../../../core/constants/reward-runtime-keys.const';
import { ExplorationEncounterAdminData } from '../../../core/domain/exploration/exploration-encounter-admin.model';

export interface RangeValidationResult {
  valid: boolean;
  message: string | null;
}

export function validateDifficultyRange(
  data: ExplorationEncounterAdminData | null,
  minKey: string | null,
  maxKey: string | null,
): RangeValidationResult {
  return validateOrderedKeys(
    minKey,
    maxKey,
    (key) => data?.difficulties.find((entry) => entry.key === key)?.sortOrder ?? null,
    'Maximum difficulty cannot be lower than minimum difficulty.',
  );
}

export function validateDistrictRange(
  data: ExplorationEncounterAdminData | null,
  minCode: string | null,
  maxCode: string | null,
): RangeValidationResult {
  return validateOrderedKeys(
    minCode,
    maxCode,
    (code) => data?.districts.find((entry) => entry.code === code)?.rank ?? null,
    'Maximum district cannot be lower than minimum district.',
  );
}

export function shouldShowMatchValue(matchKind: string | null): boolean {
  return matchKind === REWARD_ASSIGNMENT_MATCH_KIND.exact ||
    matchKind === REWARD_ASSIGNMENT_MATCH_KIND.minimum ||
    matchKind === REWARD_ASSIGNMENT_MATCH_KIND.range;
}

export function shouldShowMatchMaximum(matchKind: string | null): boolean {
  return matchKind === REWARD_ASSIGNMENT_MATCH_KIND.range;
}

export function clearHiddenMatchControls(
  matchKind: string | null,
  valueControl: AbstractControl<string | null>,
  maximumControl: AbstractControl<string | null>,
): void {
  if (!shouldShowMatchValue(matchKind)) {
    valueControl.setValue(null);
  }

  if (!shouldShowMatchMaximum(matchKind)) {
    maximumControl.setValue(null);
  }
}

function validateOrderedKeys(
  minKey: string | null,
  maxKey: string | null,
  orderFor: (key: string) => number | null,
  message: string,
): RangeValidationResult {
  if (!minKey || !maxKey) {
    return { valid: true, message: null };
  }

  const minOrder = orderFor(minKey);
  const maxOrder = orderFor(maxKey);

  if (minOrder === null || maxOrder === null || maxOrder >= minOrder) {
    return { valid: true, message: null };
  }

  return { valid: false, message };
}
