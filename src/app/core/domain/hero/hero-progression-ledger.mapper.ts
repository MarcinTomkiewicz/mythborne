import {
  HeroProgressionHistoryEntryType,
  HeroProgressionHistoryReadModel,
} from '../../types/hero.types';
import { Row } from '../../types/supabase.types';
import { nonNegativeInteger, positiveInteger } from '../../utils/number';

export const HERO_PROGRESSION_EXPERIENCE_GAIN_KIND = 'experience_gain';
export const HERO_PROGRESSION_LEVEL_UP_KIND = 'level_up';

export function mapHeroProgressionLedgerEntry(
  row: Row<'hero_progression_ledger'>,
): HeroProgressionHistoryReadModel {
  return {
    id: row.id,
    heroId: row.hero_id,
    serverId: row.server_id,
    entryKind: row.entry_kind,
    entryType: classifyHeroProgressionEntry(row),
    sourceKind: row.source_kind,
    sourceId: row.source_id,
    experienceDelta: nonNegativeInteger(row.experience_delta),
    experienceBefore: optionalNonNegativeInteger(row.experience_before),
    experienceAfter: optionalNonNegativeInteger(row.experience_after),
    totalExperienceEarnedBefore: optionalNonNegativeInteger(
      row.total_experience_earned_before,
    ),
    totalExperienceEarnedAfter: optionalNonNegativeInteger(
      row.total_experience_earned_after,
    ),
    levelBefore: optionalPositiveInteger(row.level_before),
    levelAfter: optionalPositiveInteger(row.level_after),
    reachedLevel: optionalPositiveInteger(row.reached_level),
    parentLedgerId: row.parent_ledger_id,
    characterPointsGrossDelta: nonNegativeInteger(row.character_points_gross_delta),
    characterPointsBalanceAfter: optionalNonNegativeInteger(
      row.character_points_balance_after,
    ),
    xpThreshold: optionalPositiveInteger(row.xp_threshold),
    statBonusGrants: [],
    createdAt: row.created_at,
    metadataJson: row.metadata_json,
  };
}

function classifyHeroProgressionEntry(
  row: Row<'hero_progression_ledger'>,
): HeroProgressionHistoryEntryType {
  if (row.entry_kind === HERO_PROGRESSION_LEVEL_UP_KIND || row.reached_level !== null) {
    return 'level_up';
  }

  if (row.entry_kind === HERO_PROGRESSION_EXPERIENCE_GAIN_KIND) {
    return 'experience_gain';
  }

  return 'unknown';
}

function optionalNonNegativeInteger(value: number | null): number | null {
  return value === null ? null : nonNegativeInteger(value);
}

function optionalPositiveInteger(value: number | null): number | null {
  return value === null ? null : positiveInteger(value);
}
