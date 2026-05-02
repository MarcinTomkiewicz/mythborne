import {
  CombatCoreStatsSnapshot,
  CombatParticipantStatSnapshot,
} from '../domain/combat/combat.model';
import {
  CombatOpponentAttackSourceReadModel,
  ResolveCombatOpponentInput,
  ResolvedCombatOpponentStat,
} from '../domain/combat/combat-opponent.model';
import { opponentLevel } from './combat-opponent-range';

export function scalingContext(baseValue: number, input: ResolveCombatOpponentInput) {
  const level = opponentLevel(input);

  return {
    baseValue,
    baselineValue: baseValue,
    statBaseValue: baseValue,
    heroLevel: input.heroLevel,
    opponentLevel: level,
    level,
    difficultyMultiplier: input.difficultyMultiplier,
  };
}

export function coreStatsFrom(
  stats: ResolvedCombatOpponentStat[],
  naturalAttacks: CombatOpponentAttackSourceReadModel[],
): CombatCoreStatsSnapshot {
  const statMap = new Map(stats.map((entry) => [entry.statKey, entry.scaledValue]));
  const fallbackMinDamage = Math.min(...naturalAttacks.map((entry) => entry.minDamage));
  const fallbackMaxDamage = Math.max(...naturalAttacks.map((entry) => entry.maxDamage));

  return {
    maxHealth: Math.max(1, firstStat(statMap, ['health', 'max_health'], 1)),
    defense: firstStat(statMap, ['defense', 'def'], 0),
    minDamage: firstStat(
      statMap,
      ['min_damage', 'min_dmg'],
      Number.isFinite(fallbackMinDamage) ? fallbackMinDamage : 1,
    ),
    maxDamage: firstStat(
      statMap,
      ['max_damage', 'max_dmg'],
      Number.isFinite(fallbackMaxDamage) ? fallbackMaxDamage : 1,
    ),
    luck: firstStat(statMap, ['luck'], 0),
    criticalChance: firstStat(statMap, ['critical_chance', 'critical'], 0),
    criticalDamage: firstStat(statMap, ['critical_damage'], 150),
    evasionChance: firstStat(statMap, ['evasion_chance', 'evasion'], 0),
  };
}

export function participantStats(
  side: ResolveCombatOpponentInput['side'],
  stats: ResolvedCombatOpponentStat[],
): CombatParticipantStatSnapshot[] {
  return stats.map((entry) => ({
    side,
    statKey: entry.statKey,
    statValue: entry.scaledValue,
  }));
}

function firstStat(
  stats: ReadonlyMap<string, number>,
  keys: readonly string[],
  fallback: number,
): number {
  for (const key of keys) {
    const value = stats.get(key);

    if (value !== undefined) {
      return value;
    }
  }

  return fallback;
}
