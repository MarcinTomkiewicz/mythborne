import {
  GrantHeroExperienceInput,
  GrantHeroExperienceResult,
} from '../types/hero.types';
import { Json } from '../types/database.types';
import {
  GrantHeroExperienceRpcArgs,
  GrantHeroExperienceRpcRow,
} from '../types/hero-progression-rpc.types';
import { nonNegativeInteger, positiveInteger } from './number';
import { trimText } from './normalize-text';

export function toGrantHeroExperienceRpcArgs(input: {
  heroId: string;
  grant: GrantHeroExperienceInput;
}): GrantHeroExperienceRpcArgs {
  const args: GrantHeroExperienceRpcArgs = {
    p_hero_id: requiredText(input.heroId, 'heroId'),
    p_experience_amount: requiredPositiveInteger(
      input.grant.experienceAmount,
      'experienceAmount',
    ),
    p_source_kind: requiredText(input.grant.sourceKind, 'sourceKind'),
    p_source_id: requiredText(input.grant.sourceId, 'sourceId'),
    p_reason: requiredText(input.grant.reason, 'reason'),
  };
  const requestId = trimText(input.grant.requestId);

  if (requestId) {
    args.p_request_id = requestId;
  }

  if (input.grant.metadataJson !== undefined) {
    args.p_metadata_json = input.grant.metadataJson as Json;
  }

  return args;
}

export function mapGrantHeroExperienceResult(
  row: GrantHeroExperienceRpcRow,
): GrantHeroExperienceResult {
  return {
    progressionLedgerId: row.progression_ledger_id,
    heroId: row.hero_id,
    serverId: row.server_id,
    experienceGained: nonNegativeInteger(row.experience_gained),
    levelBefore: positiveInteger(row.level_before),
    levelAfter: positiveInteger(row.level_after),
    experienceBefore: nonNegativeInteger(row.experience_before),
    experienceAfter: nonNegativeInteger(row.experience_after),
    totalExperienceEarnedBefore: nonNegativeInteger(row.total_experience_earned_before),
    totalExperienceEarnedAfter: nonNegativeInteger(row.total_experience_earned_after),
    levelsGained: nonNegativeInteger(row.levels_gained),
    reachedLevels: jsonNumberArray(row.reached_levels_json),
    characterPointsGrossGained: nonNegativeInteger(row.character_points_gross_gained),
    characterPointsBalanceAfter: nonNegativeInteger(row.character_points_balance_after),
  };
}

export function firstGrantHeroExperienceRow(
  rows: readonly GrantHeroExperienceRpcRow[],
): GrantHeroExperienceRpcRow {
  const row = rows[0];

  if (!row) {
    throw new Error('grant_hero_experience returned no result row.');
  }

  return row;
}

function requiredText(value: string | null | undefined, field: string): string {
  const normalized = trimText(value);

  if (!normalized) {
    throw new Error(`${field} is required for XP grant workflow.`);
  }

  return normalized;
}

function requiredPositiveInteger(value: unknown, field: string): number {
  const numeric = Number(value);

  if (!Number.isInteger(numeric) || numeric <= 0) {
    throw new Error(`${field} must be a positive integer for XP grant workflow.`);
  }

  return numeric;
}

function jsonNumberArray(value: Json): number[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((entry) => nonNegativeInteger(entry));
}
