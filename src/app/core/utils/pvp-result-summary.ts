import {
  PvpResultSnapshot,
  PvpResultSummary,
} from '../domain/pvp/pvp-result-snapshot.model';

export function pvpResultSummaryForHero(
  pvpResult: PvpResultSnapshot | null | undefined,
  activeHeroId: string | null,
  allowNeutralFallback = false,
): PvpResultSummary | null {
  if (!pvpResult) {
    return null;
  }

  if (activeHeroId === pvpResult.private.attacker.technicalContext.attackerHeroId) {
    return pvpResult.private.attacker;
  }

  if (activeHeroId === pvpResult.private.defender.technicalContext.defenderHeroId) {
    return pvpResult.private.defender;
  }

  return activeHeroId && allowNeutralFallback
    ? pvpResult.public.neutral
    : null;
}

export function publicPvpResultSummary(
  pvpResult: PvpResultSnapshot | null | undefined,
): PvpResultSummary | null {
  return pvpResult?.public.neutral ?? null;
}
