import { BonusSource } from '../domain/bonus/bonus.model';
import { resolveBonusValue } from './bonus';

export function finalStatValue(
  base: number,
  key: string,
  sources: BonusSource[],
  context?: { heroLevel?: number }
): number {
  let flat = 0;
  let percent = 0;

  for (const source of sources) {
    for (const bonus of source.bonuses) {
      if (bonus.target !== key) {
        continue;
      }

      if (bonus.type === 'percent') {
        percent += resolveBonusValue(bonus.value, bonus.type, context);
        continue;
      }

      flat += resolveBonusValue(bonus.value, bonus.type, context);
    }
  }

  return Math.floor((base + flat) * (1 + percent / 100));
}
