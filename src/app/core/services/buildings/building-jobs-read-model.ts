import {
  MansionBuildingJob,
  MansionBuildingJobFinalization,
  StartBuildingUpgradeResult,
} from '../../domain/building/building.model';
import {
  EstateBuildingJobRow,
  EstateBuildingRow,
  FinalizeHeroEstateBuildingJobsRpcRow,
  GetHeroEstateRuntimeStateRpcRow,
  MansionBuildingRow,
  StartEstateBuildingUpgradeRpcRow,
} from '../../types/building-service.types';
import { Json } from '../../types/database.types';

export interface HeroEstateRuntimeStateReadModel {
  heroId: string;
  serverId: string;
  estateId: string;
  address: string;
  addressNumber: number;
  districtCode: string;
  estateRank: number;
  settledAsOf: string;
  settledCompletedCount: number;
  estateBuildings: EstateBuildingRow[];
  activeJob: EstateBuildingJobRow | null;
  recentJobs: EstateBuildingJobRow[];
}

export function firstBuildingJobFinalizationRow(
  rows: readonly FinalizeHeroEstateBuildingJobsRpcRow[],
): MansionBuildingJobFinalization {
  const row = rows[0];

  if (!row) {
    throw new Error('Building job finalization returned no result.');
  }

  return {
    heroId: row.hero_id,
    serverId: row.server_id,
    estateId: row.estate_id,
    completedCount: row.completed_count,
  };
}

export function mapMansionBuildingJobs(input: {
  rows: readonly EstateBuildingJobRow[];
  buildings: readonly MansionBuildingRow[];
  now?: Date;
}): MansionBuildingJob[] {
  const buildingById = new Map(input.buildings.map((building) => [building.id, building]));
  const now = input.now ?? new Date();

  return input.rows.map((row) => {
    const building = buildingById.get(row.building_id);

    if (!building) {
      throw new Error(`Building job "${row.id}" references an unreadable building.`);
    }

    return mapMansionBuildingJob(row, building, now);
  });
}

export function firstHeroEstateRuntimeStateRow(
  rows: readonly GetHeroEstateRuntimeStateRpcRow[],
): HeroEstateRuntimeStateReadModel {
  const row = rows[0];

  if (!row) {
    throw new Error('Hero estate runtime state returned no result.');
  }

  return {
    heroId: row.hero_id,
    serverId: row.server_id,
    estateId: row.estate_id,
    address: row.address,
    addressNumber: row.address_number,
    districtCode: row.district_code,
    estateRank: row.estate_rank,
    settledAsOf: row.settled_as_of,
    settledCompletedCount: row.settled_completed_count,
    estateBuildings: parseEstateBuildingsJson(row.buildings_json, row.estate_id),
    activeJob: parseOptionalEstateBuildingJobJson(row.active_job_json, row.estate_id),
    recentJobs: parseEstateBuildingJobsJson(row.recent_jobs_json, row.estate_id),
  };
}

export function firstStartBuildingUpgradeRow(
  rows: readonly StartEstateBuildingUpgradeRpcRow[],
): StartBuildingUpgradeResult {
  const row = rows[0];

  if (!row) {
    throw new Error('Building upgrade start returned no result.');
  }

  return {
    auditLogId: row.audit_log_id,
    buildTimeSeconds: row.build_time_seconds,
    buildingId: row.building_id,
    completesAt: row.completes_at,
    estateId: row.estate_id,
    jobId: row.job_id,
    startedAt: row.started_at,
    status: row.status,
    targetLevel: row.target_level,
    resourceCosts: [
      {
        resourceType: 'drachma',
        cost: row.drachma_cost,
        balanceAfter: row.drachma_balance_after,
      },
      {
        resourceType: 'materials',
        cost: row.materials_cost,
        balanceAfter: row.materials_balance_after,
      },
      {
        resourceType: 'workforce',
        cost: row.workforce_cost,
        balanceAfter: row.workforce_balance_after,
      },
    ],
  };
}

function parseEstateBuildingsJson(
  value: Json,
  estateId: string,
): EstateBuildingRow[] {
  return requiredJsonArray(value, 'buildings_json').map((entry) => {
    const record = requiredJsonRecord(entry, 'buildings_json entry');
    const buildingId = requiredJsonString(record['buildingId'], 'buildingId');

    return {
      estate_id: optionalJsonString(record['estateId']) ?? estateId,
      building_id: buildingId,
      level: requiredJsonNumber(record['level'], 'level'),
    };
  });
}

function parseOptionalEstateBuildingJobJson(
  value: Json,
  estateId: string,
): EstateBuildingJobRow | null {
  if (value === null) {
    return null;
  }

  return parseEstateBuildingJobJson(value, estateId, 'active_job_json');
}

function parseEstateBuildingJobsJson(
  value: Json,
  estateId: string,
): EstateBuildingJobRow[] {
  return requiredJsonArray(value, 'recent_jobs_json').map((entry) =>
    parseEstateBuildingJobJson(entry, estateId, 'recent_jobs_json entry'),
  );
}

function parseEstateBuildingJobJson(
  value: Json,
  estateId: string,
  fieldName: string,
): EstateBuildingJobRow {
  const record = requiredJsonRecord(value, fieldName);

  return {
    id: requiredJsonString(record['jobId'], 'jobId'),
    estate_id: optionalJsonString(record['estateId']) ?? estateId,
    building_id: requiredJsonString(record['buildingId'], 'buildingId'),
    target_level: requiredJsonNumber(record['targetLevel'], 'targetLevel'),
    status: requiredJsonString(record['status'], 'status') as EstateBuildingJobRow['status'],
    started_at: requiredJsonString(record['startedAt'], 'startedAt'),
    completes_at: requiredJsonString(record['completesAt'], 'completesAt'),
    created_at: requiredJsonString(record['createdAt'], 'createdAt'),
    updated_at: requiredJsonString(record['updatedAt'], 'updatedAt'),
  };
}

function requiredJsonArray(value: Json, fieldName: string): Json[] {
  if (!Array.isArray(value)) {
    throw new Error(`${fieldName} must be a JSON array.`);
  }

  return value;
}

function requiredJsonRecord(
  value: Json,
  fieldName: string,
): { [key: string]: Json | undefined } {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`${fieldName} must be a JSON object.`);
  }

  return value;
}

function requiredJsonString(value: Json | undefined, fieldName: string): string {
  if (typeof value !== 'string' || value.length === 0) {
    throw new Error(`${fieldName} must be a non-empty string.`);
  }

  return value;
}

function optionalJsonString(value: Json | undefined): string | null {
  return typeof value === 'string' && value.length > 0 ? value : null;
}

function requiredJsonNumber(value: Json | undefined, fieldName: string): number {
  if (typeof value !== 'number') {
    throw new Error(`${fieldName} must be a number.`);
  }

  return value;
}

function mapMansionBuildingJob(
  row: EstateBuildingJobRow,
  building: MansionBuildingRow,
  now: Date,
): MansionBuildingJob {
  const startedAtMs = Date.parse(row.started_at);
  const completesAtMs = Date.parse(row.completes_at);
  const nowMs = now.getTime();
  const durationSeconds = Math.max(0, Math.round((completesAtMs - startedAtMs) / 1000));
  const remainingSeconds = Math.max(0, Math.round((completesAtMs - nowMs) / 1000));
  const elapsedSeconds = Math.max(0, Math.round((nowMs - startedAtMs) / 1000));

  return {
    id: row.id,
    estateId: row.estate_id,
    buildingId: row.building_id,
    buildingKey: building.key,
    buildingName: building.name,
    targetLevel: row.target_level,
    status: row.status,
    startedAt: row.started_at,
    completesAt: row.completes_at,
    durationSeconds,
    remainingSeconds,
    progressPercent: toProgressPercent(elapsedSeconds, durationSeconds, row.status),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toProgressPercent(
  elapsedSeconds: number,
  durationSeconds: number,
  status: EstateBuildingJobRow['status'],
): number {
  if (status !== 'active') {
    return 100;
  }

  if (durationSeconds <= 0) {
    return 100;
  }

  return Math.min(100, Math.max(0, Math.round((elapsedSeconds / durationSeconds) * 100)));
}
