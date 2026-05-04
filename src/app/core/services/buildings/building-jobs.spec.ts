import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';
import { RPC } from '../../constants/rpc.const';
import {
  EstateBuildingJobRow,
  MansionBuildingRow,
} from '../../types/building-service.types';
import { Backend } from '../backend/backend';
import { BuildingJobs } from './building-jobs';
import {
  firstBuildingJobFinalizationRow,
  firstHeroEstateRuntimeStateRow,
  firstStartBuildingUpgradeRow,
  mapMansionBuildingJobs,
} from './building-jobs-read-model';

describe('BuildingJobs', () => {
  let service: BuildingJobs;
  let backend: jasmine.SpyObj<Backend>;

  beforeEach(() => {
    backend = jasmine.createSpyObj<Backend>('Backend', ['getAll', 'rpc']);

    TestBed.configureTestingModule({
      providers: [
        BuildingJobs,
        { provide: Backend, useValue: backend },
      ],
    });
    service = TestBed.inject(BuildingJobs);
  });

  it('finalizes building jobs through the owner-safe hero RPC', async () => {
    backend.rpc.and.returnValue(of([{
      hero_id: 'hero-1',
      server_id: 'server-1',
      estate_id: 'estate-1',
      completed_count: 0,
    }]));

    const result = await firstValueFrom(
      service.finalizeHeroEstateBuildingJobs('hero-1'),
    );

    expect(backend.rpc).toHaveBeenCalledWith(
      RPC.finalize_hero_estate_building_jobs,
      { p_hero_id: 'hero-1' },
    );
    expect(result.completedCount).toBe(0);
  });

  it('reads settled hero estate runtime state through the owner-safe runtime RPC', async () => {
    backend.rpc.and.returnValue(of([heroEstateRuntimeStateRow()]));

    const result = await firstValueFrom(service.getHeroEstateRuntimeState('hero-1'));

    expect(backend.rpc).toHaveBeenCalledWith(
      RPC.get_hero_estate_runtime_state,
      { p_hero_id: 'hero-1' },
    );
    expect(result.activeJob).toEqual(jasmine.objectContaining({
      id: 'job-1',
      status: 'active',
    }));
    expect(result.estateBuildings).toEqual([
      jasmine.objectContaining({
        estate_id: 'estate-1',
        building_id: 'building-1',
        level: 0,
      }),
    ]);
  });

  it('starts building upgrades through the canonical owner-safe RPC', async () => {
    backend.rpc.and.returnValue(of([startUpgradeRow()]));

    const result = await firstValueFrom(
      service.startHeroEstateBuildingUpgrade({
        heroId: 'hero-1',
        buildingId: 'building-1',
        reason: 'Player started estate building construction or upgrade.',
      }),
    );

    expect(backend.rpc).toHaveBeenCalledWith(
      RPC.start_estate_building_upgrade,
      {
        p_hero_id: 'hero-1',
        p_building_id: 'building-1',
        p_reason: 'Player started estate building construction or upgrade.',
      },
    );
    expect(result).toEqual(jasmine.objectContaining({
      jobId: 'job-1',
      estateId: 'estate-1',
      buildingId: 'building-1',
      targetLevel: 1,
      buildTimeSeconds: 120,
      status: 'active',
    }));
    expect(result.resourceCosts).toEqual([
      { resourceType: 'drachma', cost: 100, balanceAfter: 900 },
      { resourceType: 'materials', cost: 50, balanceAfter: 450 },
      { resourceType: 'workforce', cost: 0, balanceAfter: 100 },
    ]);
  });
});

describe('building job read model', () => {
  it('maps active job progress from started and completes timestamps', () => {
    const jobs = mapMansionBuildingJobs({
      rows: [
        jobRow({
          startedAt: '2026-05-04T10:00:00.000Z',
          completesAt: '2026-05-04T10:10:00.000Z',
          status: 'active',
        }),
      ],
      buildings: [buildingRow()],
      now: new Date('2026-05-04T10:05:00.000Z'),
    });

    expect(jobs[0]).toEqual(jasmine.objectContaining({
      buildingName: 'Agora',
      durationSeconds: 600,
      remainingSeconds: 300,
      progressPercent: 50,
    }));
  });

  it('treats completed_count 0 as a normal finalization result', () => {
    expect(firstBuildingJobFinalizationRow([{
      hero_id: 'hero-1',
      server_id: 'server-1',
      estate_id: 'estate-1',
      completed_count: 0,
    }])).toEqual({
      heroId: 'hero-1',
      serverId: 'server-1',
      estateId: 'estate-1',
      completedCount: 0,
    });
  });

  it('maps canonical start upgrade result rows from generated RPC shape', () => {
    expect(firstStartBuildingUpgradeRow([startUpgradeRow()])).toEqual(
      jasmine.objectContaining({
        auditLogId: 'audit-1',
        jobId: 'job-1',
        buildTimeSeconds: 120,
        targetLevel: 1,
      }),
    );
  });

  it('maps settled runtime state rows from generated RPC shape', () => {
    expect(firstHeroEstateRuntimeStateRow([heroEstateRuntimeStateRow()]))
      .toEqual(jasmine.objectContaining({
        heroId: 'hero-1',
        serverId: 'server-1',
        estateId: 'estate-1',
        activeJob: jasmine.objectContaining({
          id: 'job-1',
          building_id: 'building-1',
        }),
        settledCompletedCount: 0,
      }));
  });

  it('requires camelCase keys inside settled runtime JSON payloads', () => {
    expect(() =>
      firstHeroEstateRuntimeStateRow([{
        ...heroEstateRuntimeStateRow(),
        buildings_json: [
          {
            estate_id: 'estate-1',
            building_id: 'building-1',
            level: 0,
          },
        ],
      }]),
    ).toThrowError('buildingId must be a non-empty string.');
  });
});

function jobRow(input: {
  startedAt: string;
  completesAt: string;
  status: EstateBuildingJobRow['status'];
}): EstateBuildingJobRow {
  return {
    id: 'job-1',
    estate_id: 'estate-1',
    building_id: 'building-1',
    target_level: 2,
    status: input.status,
    started_at: input.startedAt,
    completes_at: input.completesAt,
    created_at: input.startedAt,
    updated_at: input.completesAt,
  };
}

function buildingRow(): MansionBuildingRow {
  return {
    id: 'building-1',
    key: 'agora',
    name: 'Agora',
  } as MansionBuildingRow;
}

function startUpgradeRow() {
  return {
    audit_log_id: 'audit-1',
    build_time_seconds: 120,
    building_id: 'building-1',
    completes_at: '2026-05-04T10:02:00.000Z',
    drachma_balance_after: 900,
    drachma_cost: 100,
    estate_id: 'estate-1',
    job_id: 'job-1',
    materials_balance_after: 450,
    materials_cost: 50,
    started_at: '2026-05-04T10:00:00.000Z',
    status: 'active' as const,
    target_level: 1,
    workforce_balance_after: 100,
    workforce_cost: 0,
  };
}

function heroEstateRuntimeStateRow() {
  return {
    hero_id: 'hero-1',
    server_id: 'server-1',
    estate_id: 'estate-1',
    address: 'A-3301',
    address_number: 3301,
    district_code: 'A',
    estate_rank: 1,
    settled_as_of: '2026-05-04T10:00:00.000Z',
    settled_completed_count: 0,
    buildings_json: [
      {
        estateId: 'estate-1',
        buildingId: 'building-1',
        level: 0,
      },
    ],
    active_job_json: {
      jobId: 'job-1',
      estateId: 'estate-1',
      buildingId: 'building-1',
      targetLevel: 1,
      status: 'active',
      startedAt: '2026-05-04T10:00:00.000Z',
      completesAt: '2026-05-04T10:02:00.000Z',
      createdAt: '2026-05-04T10:00:00.000Z',
      updatedAt: '2026-05-04T10:00:00.000Z',
      secondsUntilCompletion: 120,
      isDue: false,
    },
    recent_jobs_json: [],
    resources_json: [
      {
        resource_type: 'drachma',
        amount: 900,
      },
    ],
  };
}
