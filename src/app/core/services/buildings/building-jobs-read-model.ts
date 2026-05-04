import {
  MansionBuildingJob,
  MansionBuildingJobFinalization,
} from '../../domain/building/building.model';
import {
  EstateBuildingJobRow,
  FinalizeHeroEstateBuildingJobsRpcRow,
  MansionBuildingRow,
} from '../../types/building-service.types';

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
