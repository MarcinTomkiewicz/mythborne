import { Json } from '../types/database.types';
import {
  SaveStatAllocationRpcArgs,
  SaveStatAllocationRpcRow,
} from '../types/stat-allocation-rpc.types';
import { nonNegativeInteger } from './number';
import { trimText } from './normalize-text';

export interface SaveStatAllocationInput {
  heroId: string;
  stats: Record<string, number>;
  previousCharacterPoints: number;
  nextCharacterPoints: number;
  reason?: string | null;
  requestId?: string | null;
}

export interface SaveStatAllocationResult {
  auditLogId: string;
  characterPointsAfter: number;
  heroId: string;
  serverId: string;
  stats: Record<string, number>;
}

export function toSaveStatAllocationRpcArgs(
  input: SaveStatAllocationInput,
): SaveStatAllocationRpcArgs {
  const previousCharacterPoints = nonNegativeInteger(input.previousCharacterPoints);
  const nextCharacterPoints = nonNegativeInteger(input.nextCharacterPoints);

  const args: SaveStatAllocationRpcArgs = {
    p_hero_id: requiredHeroId(input.heroId),
    p_stat_values_json: normalizeStats(input.stats) as Json,
    p_character_points_spent: Math.max(0, previousCharacterPoints - nextCharacterPoints),
    p_reason: input.reason ?? 'Stat allocation saved.',
  };

  const requestId = trimText(input.requestId);

  if (requestId) {
    args.p_request_id = requestId;
  }

  return args;
}

export function mapSaveStatAllocationResult(
  row: SaveStatAllocationRpcRow,
): SaveStatAllocationResult {
  return {
    auditLogId: row.audit_log_id,
    characterPointsAfter: nonNegativeInteger(row.character_points_after),
    heroId: row.hero_id,
    serverId: row.server_id,
    stats: jsonStatsToRecord(row.stats_json),
  };
}

export function normalizeStats(stats: Record<string, number>): Record<string, number> {
  return Object.entries(stats).reduce<Record<string, number>>(
    (normalized, [statKey, value]) => {
      normalized[statKey] = nonNegativeInteger(value);
      return normalized;
    },
    {},
  );
}

function requiredHeroId(value: string): string {
  const normalized = trimText(value);

  if (!normalized) {
    throw new Error('heroId is required for stat allocation save.');
  }

  return normalized;
}

function jsonStatsToRecord(value: Json): Record<string, number> {
  if (!value || Array.isArray(value) || typeof value !== 'object') {
    return {};
  }

  return Object.entries(value).reduce<Record<string, number>>((stats, [key, statValue]) => {
    stats[key] = nonNegativeInteger(statValue);
    return stats;
  }, {});
}
