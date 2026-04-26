import { BonusSource } from '../domain/bonus/bonus.model';
import { normalizeBonusScope, resolveBonusValue } from './bonus';

export function finalStatValue(
  base: number,
  key: string,
  sources: BonusSource[],
  options?: {
    heroLevel?: number;
    bonusScope?: string;
    sourceStats?: Record<string, number>;
  }
): number {
  let flat = 0;
  let percent = 0;
  const activeScope = normalizeBonusScope(options?.bonusScope);

  for (const source of sources) {
    for (const bonus of source.bonuses) {
      const matchesTarget = bonus.target === key;
      const bonusScope = normalizeBonusScope(bonus.scope);
      const matchesContext = bonusScope === 'global' || bonusScope === activeScope;

      if (!matchesTarget || !matchesContext) {
        continue;
      }

      if (bonus.type === 'percent') {
        percent += resolveBonusValue(bonus, options);
        continue;
      }

      if (
        bonus.type === 'flat' ||
        bonus.type === 'per_levels' ||
        bonus.type === 'scaled_stat_bonus'
      ) {
        flat += resolveBonusValue(bonus, options);
      }
    }
  }

  return Math.floor((base + flat) * (1 + percent / 100));
}
