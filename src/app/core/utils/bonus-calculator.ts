import { BonusSource } from '../domain/bonus/bonus.model';
import { resolveBonusValue } from './bonus';

export function finalStatValue(
  base: number,
  key: string,
  sources: BonusSource[],
  context?: {
    heroLevel?: number;
    bonusContext?: string;
    sourceStats?: Record<string, number>;
  }
): number {
  let flat = 0;
  let percent = 0;
  const activeContext = context?.bonusContext ?? 'global';

  for (const source of sources) {
    for (const bonus of source.bonuses) {
      const matchesTarget = bonus.target === key;
      const matchesContext = bonus.context === 'global' || bonus.context === activeContext;

      if (!matchesTarget || !matchesContext) {
        continue;
      }

      if (bonus.type === 'percent') {
        percent += resolveBonusValue(bonus, context);
        continue;
      }

      if (
        bonus.type === 'flat' ||
        bonus.type === 'per_levels' ||
        bonus.type === 'scaled_stat_bonus'
      ) {
        flat += resolveBonusValue(bonus, context);
      }
    }
  }

  return Math.floor((base + flat) * (1 + percent / 100));
}
