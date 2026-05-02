import {
  EXPLORATION_PAYLOAD_FORMULA_SCOPE_PARTS,
} from '../constants/encounter-runtime-keys.const';
import { REWARD_AMOUNT_FORMULA_SCOPE_PARTS } from '../constants/reward-runtime-keys.const';

export function isRewardAmountFormulaScope(scopeKey: string): boolean {
  return includesScopePart(scopeKey, REWARD_AMOUNT_FORMULA_SCOPE_PARTS);
}

export function isExplorationPayloadFormulaScope(scopeKey: string): boolean {
  return includesScopePart(scopeKey, EXPLORATION_PAYLOAD_FORMULA_SCOPE_PARTS);
}

function includesScopePart(scopeKey: string, parts: readonly string[]): boolean {
  const normalized = scopeKey.toLowerCase();

  return parts.some((part) => normalized.includes(part));
}
