import {
  PvpResultSnapshotV1,
  PvpResultSummaryV1,
} from '../domain/pvp/pvp-result-snapshot.model';

export function pvpResultSummaryForHero(
  pvpResult: PvpResultSnapshotV1 | null | undefined,
  activeHeroId: string | null,
  allowNeutralFallback = false,
): PvpResultSummaryV1 | null {
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
  pvpResult: PvpResultSnapshotV1 | null | undefined,
): PvpResultSummaryV1 | null {
  return pvpResult?.public.neutral ?? null;
}
