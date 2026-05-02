import { ResolveCombatOpponentInput } from '../domain/combat/combat-opponent.model';

export function opponentLevel(input: ResolveCombatOpponentInput): number {
  return Math.max(1, Math.floor(input.opponentLevel ?? input.heroLevel));
}

export function isLevelInRange(level: number, min: number | null, max: number | null): boolean {
  return (min === null || level >= min) && (max === null || level <= max);
}
