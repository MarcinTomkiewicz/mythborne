import { BonusSource } from './bonus.model';

export function finalStatValue(
  base: number,
  key: string,
  sources: BonusSource[]
): number {
  let flat = 0;
  let percent = 0;

  for (const source of sources) {
    for (const bonus of source.bonuses) {
      if (bonus.target === key) {
        if (bonus.type === 'flat') {
          flat += bonus.value;
        } else if (bonus.type === 'percent') {
          percent += bonus.value;
        }
        // przyszłe typy można tu dodać np. if (bonus.type === 'conditional') { ... }
      }
    }
  }

  const result = (base + flat) * (1 + percent / 100);
  return Math.floor(result); // zaokrąglanie wg stylu gry
}
