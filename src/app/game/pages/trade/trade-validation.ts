import { DirectTradeItemTarget } from '../../../core/domain/trade/direct-trade.model';

export function normalizeCharacterPoints(value: number | null): number | null {
  if (value === null || value === undefined) {
    return null;
  }

  return Number(value);
}

export function validateTradeValue(
  characterPoints: number | null,
  items: readonly DirectTradeItemTarget[],
): string | null {
  if (characterPoints !== null && (!Number.isInteger(characterPoints) || characterPoints < 0)) {
    return 'Character Points must be a non-negative integer.';
  }

  if ((characterPoints ?? 0) <= 0 && items.length === 0) {
    return 'Add Character Points or at least one active item.';
  }

  return null;
}
