import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';
import { RPC } from '../../constants/rpc.const';
import { TABLES } from '../../constants/tables.const';
import { FilterOperator } from '../../enums/filter-operators';
import {
  EstateBuildingJobRow,
  MansionBuildingRow,
} from '../../types/building-service.types';
import { Backend } from '../backend/backend';
import { BuildingJobs } from './building-jobs';
import {
  firstBuildingJobFinalizationRow,
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

  it('reads recent jobs for one estate without using internal finalization helpers', async () => {
    backend.getAll.and.returnValue(of([]));

    await firstValueFrom(service.getRecentJobsForEstate('estate-1'));

    expect(backend.getAll).toHaveBeenCalledWith({
      table: TABLES.estate_building_jobs,
      filters: {
        estateId: { operator: FilterOperator.EQ, value: 'estate-1' },
      },
      orderBy: { column: 'updated_at', ascending: false },
      range: { from: 0, to: 4 },
      camelCase: false,
    });
    expect(backend.rpc).not.toHaveBeenCalledWith(
      'finalize_completed_estate_building_jobs',
      jasmine.anything(),
    );
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
