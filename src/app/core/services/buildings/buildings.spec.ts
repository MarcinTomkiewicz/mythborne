import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';
import { TABLES } from '../../constants/tables.const';
import { FormulaAdminData } from '../../domain/formula/formula.model';
import { FilterOperator } from '../../enums/filter-operators';
import {
  BuildingDistrictLevelCapRow,
  EstateBuildingJobRow,
  DistrictRow,
  EstateBuildingRow,
  GetHeroEstateRuntimeStateRpcRow,
  MansionBuildingRequirementRow,
  MansionBuildingResourceCostRow,
  MansionBuildingRow,
  StatLabelRow,
} from '../../types/building-service.types';
import { Row } from '../../types/supabase.types';
import { Backend } from '../backend/backend';
import { FormulaService } from '../formula/formula';
import { Hero } from '../hero/hero';
import { BuildingProgressionService } from '../progression/building-progression';
import { BuildingJobs } from './building-jobs';
import { firstHeroEstateRuntimeStateRow } from './building-jobs-read-model';
import { BuildingsService } from './buildings';

describe('BuildingsService', () => {
  let service: BuildingsService;
  let heroService: jasmine.SpyObj<Hero>;
  let backend: jasmine.SpyObj<Backend>;
  let formulaService: jasmine.SpyObj<FormulaService>;
  let progression: jasmine.SpyObj<BuildingProgressionService>;
  let buildingJobs: jasmine.SpyObj<BuildingJobs>;

  beforeEach(() => {
    heroService = jasmine.createSpyObj<Hero>('Hero', ['getHeroData']);
    backend = jasmine.createSpyObj<Backend>('Backend', ['getAll']);
    formulaService = jasmine.createSpyObj<FormulaService>('FormulaService', ['getAdminData']);
    progression = jasmine.createSpyObj<BuildingProgressionService>(
      'BuildingProgressionService',
      ['resolveRulesForBuilding', 'getUpgradeTimeSeconds', 'getUpgradeCost', 'getBonusValue'],
    );
    buildingJobs = jasmine.createSpyObj<BuildingJobs>('BuildingJobs', [
      'getHeroEstateRuntimeState',
      'startHeroEstateBuildingUpgrade',
    ]);

    formulaService.getAdminData.and.returnValue(
      of({} as unknown as FormulaAdminData),
    );
    backend.getAll.and.returnValue(of([]));
    progression.resolveRulesForBuilding.and.returnValue({} as never);
    progression.getUpgradeTimeSeconds.and.returnValue(120);
    progression.getUpgradeCost.and.callFake((_level, baseValue) => baseValue);
    progression.getBonusValue.and.returnValue(0);
    buildingJobs.getHeroEstateRuntimeState.and.returnValue(of(runtimeReadModel()));
    buildingJobs.startHeroEstateBuildingUpgrade.and.returnValue(of({
      auditLogId: 'audit-1',
      buildTimeSeconds: 120,
      buildingId: 'building-a',
      completesAt: '2026-05-04T10:02:00.000Z',
      estateId: 'estate-1',
      jobId: 'job-1',
      startedAt: '2026-05-04T10:00:00.000Z',
      status: 'active',
      targetLevel: 1,
      resourceCosts: [],
    }));

    TestBed.configureTestingModule({
      providers: [
        BuildingsService,
        { provide: Hero, useValue: heroService },
        { provide: Backend, useValue: backend },
        { provide: FormulaService, useValue: formulaService },
        { provide: BuildingProgressionService, useValue: progression },
        { provide: BuildingJobs, useValue: buildingJobs },
      ],
    });
    service = TestBed.inject(BuildingsService);
  });

  it('does not render a normal mansion view when active hero has no estate', async () => {
    heroService.getHeroData.and.returnValue(of(heroRow(null)));

    await expectAsync(firstValueFrom(service.getMansionEstateView()))
      .toBeRejectedWithError('Active hero does not have an estate address.');

    expect(backend.getAll).not.toHaveBeenCalled();
    expect(buildingJobs.getHeroEstateRuntimeState).not.toHaveBeenCalled();
  });

  it('rejects stale runtime state for a different hero estate', async () => {
    heroService.getHeroData.and.returnValue(of(heroRow('estate-1')));
    buildingJobs.getHeroEstateRuntimeState.and.returnValue(of(runtimeReadModel({
      estateId: 'other-estate',
    })));

    await expectAsync(firstValueFrom(service.getMansionEstateView()))
      .toBeRejectedWithError('Hero estate runtime state returned a stale hero estate result.');

    expect(buildingJobs.getHeroEstateRuntimeState).toHaveBeenCalledWith('hero-1');
    expect(backend.getAll).toHaveBeenCalledWith(jasmine.objectContaining({
      table: TABLES.buildings,
    }));
  });

  it('loads district-inherited buildings with explicit level 0 baseline rows', async () => {
    heroService.getHeroData.and.returnValue(of(heroRow('estate-1')));
    buildingJobs.getHeroEstateRuntimeState.and.returnValue(of(runtimeReadModel({
      districtCode: 'C',
      address: 'C-3301',
      estateBuildings: [
        estateBuildingRow('building-a', 2),
        estateBuildingRow('building-b', 1),
        estateBuildingRow('building-c', 0),
      ],
    })));
    backend.getAll.and.callFake(<T extends object>(opts: { table: string }) => {
      const rowsByTable: Record<string, readonly object[]> = {
        [TABLES.buildings]: [
          buildingRow('building-a', 'well', 'A'),
          buildingRow('building-b', 'workshop', 'B'),
          buildingRow('building-c', 'library', 'C'),
          buildingRow('building-d', 'observatory', 'D'),
        ],
        [TABLES.building_district_level_caps]: [
          levelCapRow('building-c', 'C', 0),
        ],
        [TABLES.entity_requirements]: [
          requirementRow('building-c'),
          statRequirementRow('building-c'),
        ],
        [TABLES.stats]: [
          statRow('strength', 'Strength'),
        ],
        [TABLES.entity_bonuses]: [],
        [TABLES.estate_districts]: districtRows(),
      };

      return of((rowsByTable[opts.table] ?? []) as T[]);
    });

    const view = await firstValueFrom(service.getMansionEstateView());

    expect(buildingJobs.getHeroEstateRuntimeState).toHaveBeenCalledWith('hero-1');
    expect(view.currentDistrictCode).toBe('C');
    expect(view.activeBuildingJob).toBeNull();
    expect(view.recentBuildingJobs).toEqual([]);
    expect(view.finalizedBuildingJobsCount).toBe(0);
    expect(view.buildings.map((building) => building.key)).toEqual([
      'well',
      'workshop',
      'library',
    ]);
    expect(view.buildings.find((building) => building.key === 'library'))
      .toEqual(jasmine.objectContaining({
        currentLevel: 0,
        isOwned: false,
        isUnlocked: true,
        startingLevel: 1,
        baseCost: 50,
        maxLevel: 10,
        effectiveMaxLevel: 0,
        isUnlimited: true,
      }));
    expect(view.buildings.find((building) => building.key === 'library')?.activeRequirements)
      .toEqual([
        jasmine.objectContaining({
          requirementDefinitionKey: 'hero_level',
          label: 'Hero level',
          valueLabel: '5',
          appliesFromLevel: 1,
        }),
        jasmine.objectContaining({
          requirementDefinitionKey: 'hero_stat',
          label: 'Strength',
          valueLabel: '2',
          appliesFromLevel: 1,
        }),
      ]);
    const unbuiltTimeArgs = progression.getUpgradeTimeSeconds.calls
      .allArgs()
      .find((args) => args[0] === 0);
    expect(unbuiltTimeArgs?.slice(0, 3)).toEqual([0, 120, 3]);
  });

  it('surfaces active and recent building job state from settled runtime RPC', async () => {
    heroService.getHeroData.and.returnValue(of(heroRow('estate-1')));
    buildingJobs.getHeroEstateRuntimeState.and.returnValue(of(runtimeReadModel({
      settledCompletedCount: 1,
      activeJob: estateBuildingJobRow('active-job', 'building-a', 'active'),
      recentJobs: [
        estateBuildingJobRow('completed-job', 'building-a', 'completed'),
      ],
      estateBuildings: [estateBuildingRow('building-a', 1)],
    })));
    backend.getAll.and.callFake(<T extends object>(opts: { table: string }) => {
      const rowsByTable: Record<string, readonly object[]> = {
        [TABLES.buildings]: [buildingRow('building-a', 'well', 'A')],
        [TABLES.building_district_level_caps]: [],
        [TABLES.entity_requirements]: [],
        [TABLES.stats]: [],
        [TABLES.entity_bonuses]: [],
        [TABLES.estate_districts]: districtRows(),
      };

      return of((rowsByTable[opts.table] ?? []) as T[]);
    });

    const view = await firstValueFrom(service.getMansionEstateView());

    expect(view.finalizedBuildingJobsCount).toBe(1);
    expect(view.activeBuildingJob).toEqual(jasmine.objectContaining({
      id: 'active-job',
      buildingName: 'well',
      status: 'active',
      targetLevel: 2,
    }));
    expect(view.recentBuildingJobs).toEqual([
      jasmine.objectContaining({
        id: 'completed-job',
        status: 'completed',
      }),
    ]);
  });

  it('blocks fresh mansion state from active job returned by runtime RPC', async () => {
    heroService.getHeroData.and.returnValue(of(heroRow('estate-1')));
    buildingJobs.getHeroEstateRuntimeState.and.returnValue(of(runtimeReadModel({
      activeJob: estateBuildingJobRow('active-job', 'building-a', 'active'),
      recentJobs: [
        estateBuildingJobRow('completed-job-1', 'building-a', 'completed'),
        estateBuildingJobRow('completed-job-2', 'building-a', 'completed'),
      ],
      estateBuildings: [estateBuildingRow('building-a', 1)],
    })));
    backend.getAll.and.callFake(<T extends object>(opts: { table: string }) => {
      const rowsByTable: Record<string, readonly object[]> = {
        [TABLES.buildings]: [buildingRow('building-a', 'well', 'A')],
        [TABLES.building_district_level_caps]: [],
        [TABLES.entity_requirements]: [],
        [TABLES.stats]: [],
        [TABLES.entity_bonuses]: [],
        [TABLES.estate_districts]: districtRows(),
      };

      return of((rowsByTable[opts.table] ?? []) as T[]);
    });

    const view = await firstValueFrom(service.getMansionEstateView());

    expect(view.activeBuildingJob).toEqual(jasmine.objectContaining({
      id: 'active-job',
      status: 'active',
    }));
    expect(view.recentBuildingJobs.map((job) => job.id)).toEqual([
      'completed-job-1',
      'completed-job-2',
    ]);
  });

  it('does not show an active job when runtime RPC has already settled completed work', async () => {
    heroService.getHeroData.and.returnValue(of(heroRow('estate-1')));
    buildingJobs.getHeroEstateRuntimeState.and.returnValue(of(runtimeReadModel({
      settledCompletedCount: 1,
      activeJob: null,
      recentJobs: [
        estateBuildingJobRow('completed-job', 'building-a', 'completed'),
      ],
      estateBuildings: [estateBuildingRow('building-a', 2)],
    })));
    backend.getAll.and.callFake(<T extends object>(opts: { table: string }) => {
      const rowsByTable: Record<string, readonly object[]> = {
        [TABLES.buildings]: [buildingRow('building-a', 'well', 'A')],
        [TABLES.building_district_level_caps]: [],
        [TABLES.entity_requirements]: [],
        [TABLES.stats]: [],
        [TABLES.entity_bonuses]: [],
        [TABLES.estate_districts]: districtRows(),
      };

      return of((rowsByTable[opts.table] ?? []) as T[]);
    });

    const view = await firstValueFrom(service.getMansionEstateView());

    expect(view.activeBuildingJob).toBeNull();
    expect(view.finalizedBuildingJobsCount).toBe(1);
    expect(view.buildings[0].currentLevel).toBe(2);
  });

  it('preserves duplicate active central requirements for data/admin visibility', async () => {
    heroService.getHeroData.and.returnValue(of(heroRow('estate-1')));
    buildingJobs.getHeroEstateRuntimeState.and.returnValue(of(runtimeReadModel({
      estateBuildings: [estateBuildingRow('building-a', 0)],
    })));
    backend.getAll.and.callFake(<T extends object>(opts: { table: string }) => {
      const rowsByTable: Record<string, readonly object[]> = {
        [TABLES.buildings]: [buildingRow('building-a', 'well', 'A')],
        [TABLES.building_district_level_caps]: [],
        [TABLES.entity_requirements]: [
          requirementRow('building-a', 'hero-level-1'),
          requirementRow('building-a', 'hero-level-2'),
        ],
        [TABLES.stats]: [],
        [TABLES.entity_bonuses]: [],
        [TABLES.estate_districts]: districtRows(),
      };

      return of((rowsByTable[opts.table] ?? []) as T[]);
    });

    const view = await firstValueFrom(service.getMansionEstateView());

    expect(view.buildings[0].activeRequirements.map((row) => row.label)).toEqual([
      'Hero level',
      'Hero level',
    ]);
  });

  it('fails instead of inferring level 0 when an available baseline row is missing', async () => {
    heroService.getHeroData.and.returnValue(of(heroRow('estate-1')));
    buildingJobs.getHeroEstateRuntimeState.and.returnValue(of(runtimeReadModel({
      estateBuildings: [],
    })));
    backend.getAll.and.callFake(<T extends object>(opts: { table: string }) => {
      const rowsByTable: Record<string, readonly object[]> = {
        [TABLES.buildings]: [buildingRow('building-a', 'well', 'A')],
        [TABLES.estate_districts]: districtRows(),
      };

      return of((rowsByTable[opts.table] ?? []) as T[]);
    });

    await expectAsync(firstValueFrom(service.getMansionEstateView()))
      .toBeRejectedWithError('Estate building baseline row is missing for building "well".');
  });

  it('queries central requirements and district caps, not legacy building requirements', async () => {
    heroService.getHeroData.and.returnValue(of(heroRow('estate-1')));
    buildingJobs.getHeroEstateRuntimeState.and.returnValue(of(runtimeReadModel()));

    await expectAsync(firstValueFrom(service.getMansionEstateView()))
      .toBeRejectedWithError('Estate district "A" is not configured.');

    expect(backend.getAll).toHaveBeenCalledWith(jasmine.objectContaining({
      table: TABLES.building_district_level_caps,
    }));
    expect(backend.getAll).toHaveBeenCalledWith(jasmine.objectContaining({
      table: TABLES.stats,
      select: 'key, label',
      orderBy: { column: 'order' },
    }));
    expect(backend.getAll).toHaveBeenCalledWith(jasmine.objectContaining({
      table: TABLES.entity_requirements,
      select: '*, requirement_definitions(*)',
      filters: {
        entityType: {
          operator: FilterOperator.EQ,
          value: 'building_definition',
        },
        isActive: {
          operator: FilterOperator.EQ,
          value: true,
        },
      },
    }));
  });

  it('starts a building upgrade with active hero id through the building job boundary', async () => {
    heroService.getHeroData.and.returnValue(of(heroRow('estate-1')));

    const result = await firstValueFrom(service.startBuildingUpgrade('building-a'));

    expect(buildingJobs.startHeroEstateBuildingUpgrade).toHaveBeenCalledWith({
      heroId: 'hero-1',
      buildingId: 'building-a',
      reason: 'Player started estate building construction or upgrade.',
    });
    expect(result).toEqual(jasmine.objectContaining({
      jobId: 'job-1',
      targetLevel: 1,
    }));
  });

  it('rejects stale building upgrade start results for another estate', async () => {
    heroService.getHeroData.and.returnValue(of(heroRow('estate-1')));
    buildingJobs.startHeroEstateBuildingUpgrade.and.returnValue(of({
      auditLogId: 'audit-1',
      buildTimeSeconds: 120,
      buildingId: 'building-a',
      completesAt: '2026-05-04T10:02:00.000Z',
      estateId: 'other-estate',
      jobId: 'job-1',
      startedAt: '2026-05-04T10:00:00.000Z',
      status: 'active',
      targetLevel: 1,
      resourceCosts: [],
    }));

    await expectAsync(firstValueFrom(service.startBuildingUpgrade('building-a')))
      .toBeRejectedWithError('Building upgrade start returned a stale hero estate result.');
  });

  it('rejects stale building upgrade start results for another building', async () => {
    heroService.getHeroData.and.returnValue(of(heroRow('estate-1')));
    buildingJobs.startHeroEstateBuildingUpgrade.and.returnValue(of({
      auditLogId: 'audit-1',
      buildTimeSeconds: 120,
      buildingId: 'other-building',
      completesAt: '2026-05-04T10:02:00.000Z',
      estateId: 'estate-1',
      jobId: 'job-1',
      startedAt: '2026-05-04T10:00:00.000Z',
      status: 'active',
      targetLevel: 1,
      resourceCosts: [],
    }));

    await expectAsync(firstValueFrom(service.startBuildingUpgrade('building-a')))
      .toBeRejectedWithError('Building upgrade start returned a stale hero estate result.');
  });
});

function heroRow(estateId: string | null): Row<'hero'> {
  return {
    id: 'hero-1',
    server_id: 'server-1',
    estate_id: estateId,
  } as Row<'hero'>;
}

function buildingRow(
  id: string,
  key: string,
  districtCode: string,
): MansionBuildingRow & { building_resource_costs: MansionBuildingResourceCostRow[] } {
  return {
    id,
    key,
    name: key,
    description: `${key} description`,
    image_path: null,
    district_code: districtCode,
    rank_required: districtCode.charCodeAt(0) - 64,
    sort_order: 10,
    starting_level: 1,
    base_cost: 50,
    base_build_time_seconds: 120,
    max_level: 10,
    building_resource_costs: [
      {
        id: `${id}-cost`,
        building_id: id,
        resource_type: 'materials',
        base_value: 25,
        applies_from_level: 1,
        sort_order: 10,
      } as MansionBuildingResourceCostRow,
    ],
  } as MansionBuildingRow & { building_resource_costs: MansionBuildingResourceCostRow[] };
}

function estateBuildingRow(buildingId: string, level: number): EstateBuildingRow {
  return {
    estate_id: 'estate-1',
    building_id: buildingId,
    level,
  };
}

function estateBuildingJobRow(
  id: string,
  buildingId: string,
  status: EstateBuildingJobRow['status'],
): EstateBuildingJobRow {
  return {
    id,
    estate_id: 'estate-1',
    building_id: buildingId,
    target_level: 2,
    status,
    started_at: '2026-05-04T10:00:00.000Z',
    completes_at: '2026-05-04T10:10:00.000Z',
    created_at: '2026-05-04T10:00:00.000Z',
    updated_at: '2026-05-04T10:10:00.000Z',
  } as EstateBuildingJobRow;
}

function levelCapRow(
  buildingId: string,
  districtCode: string,
  maxLevel: number,
): BuildingDistrictLevelCapRow {
  return {
    id: `${buildingId}-${districtCode}-cap`,
    building_id: buildingId,
    district_code: districtCode,
    max_level: maxLevel,
  } as BuildingDistrictLevelCapRow;
}

function requirementRow(
  buildingId: string,
  id = `${buildingId}-requirement`,
): MansionBuildingRequirementRow {
  return {
    id,
    entity_type: 'building_definition',
    entity_id: buildingId,
    requirement_definition_key: 'hero_level',
    applies_from_level: 1,
    context: 'runtime',
    description: null,
    is_active: true,
    required_building_key: null,
    required_district_code: null,
    required_resource_type: null,
    required_stat_key: null,
    required_value_boolean: null,
    required_value_decimal: null,
    required_value_integer: 5,
    required_value_text: null,
    sort_order: 10,
    requirement_definitions: {
      id: 'requirement-definition-1',
      key: 'hero_level',
      label: 'Hero level',
      description: 'Hero level requirement.',
      helper_text: null,
      admin_description: null,
      category: 'hero',
      value_type: 'integer',
      sort_order: 10,
      is_active: true,
    } as Row<'requirement_definitions'>,
  } as MansionBuildingRequirementRow;
}

function statRequirementRow(buildingId: string): MansionBuildingRequirementRow {
  return {
    id: `${buildingId}-stat-requirement`,
    entity_type: 'building_definition',
    entity_id: buildingId,
    requirement_definition_key: 'hero_stat',
    applies_from_level: 1,
    context: 'runtime',
    description: null,
    is_active: true,
    required_building_key: null,
    required_district_code: null,
    required_resource_type: null,
    required_stat_key: 'strength',
    required_value_boolean: null,
    required_value_decimal: null,
    required_value_integer: 2,
    required_value_text: null,
    sort_order: 20,
    requirement_definitions: {
      id: 'requirement-definition-2',
      key: 'hero_stat',
      label: 'Hero stat',
      description: 'Hero stat requirement.',
      helper_text: null,
      admin_description: null,
      category: 'hero',
      value_type: 'stat_key',
      sort_order: 20,
      is_active: true,
    } as Row<'requirement_definitions'>,
  } as MansionBuildingRequirementRow;
}

function statRow(key: string, label: string): StatLabelRow {
  return {
    key,
    label,
  };
}

function districtRows(): DistrictRow[] {
  return ['A', 'B', 'C', 'D', 'E'].map((code, index) => ({
    code,
    name: `District ${code}`,
    description: `District ${code}`,
    rank: index + 1,
  } as DistrictRow));
}

function runtimeState(input: {
  heroId?: string;
  serverId?: string;
  estateId?: string;
  districtCode?: string;
  address?: string;
  settledCompletedCount?: number;
  estateBuildings?: EstateBuildingRow[];
  activeJob?: EstateBuildingJobRow | null;
  recentJobs?: EstateBuildingJobRow[];
} = {}): GetHeroEstateRuntimeStateRpcRow {
  const districtCode = input.districtCode ?? 'A';

  return {
    hero_id: input.heroId ?? 'hero-1',
    server_id: input.serverId ?? 'server-1',
    estate_id: input.estateId ?? 'estate-1',
    address: input.address ?? `${districtCode}-3301`,
    address_number: 3301,
    district_code: districtCode,
    estate_rank: districtCode.charCodeAt(0) - 64,
    settled_as_of: '2026-05-04T10:00:00.000Z',
    settled_completed_count: input.settledCompletedCount ?? 0,
    buildings_json: (input.estateBuildings ?? [estateBuildingRow('building-a', 0)])
      .map(estateBuildingJson),
    active_job_json: input.activeJob ? estateBuildingJobJson(input.activeJob) : null,
    recent_jobs_json: (input.recentJobs ?? []).map(estateBuildingJobJson),
    resources_json: [
      {
        resource_type: 'drachma',
        amount: 900,
      },
    ],
  };
}

function runtimeReadModel(input: Parameters<typeof runtimeState>[0] = {}) {
  return firstHeroEstateRuntimeStateRow([runtimeState(input)]);
}

function estateBuildingJobJson(row: EstateBuildingJobRow) {
  return {
    jobId: row.id,
    estateId: row.estate_id,
    buildingId: row.building_id,
    targetLevel: row.target_level,
    status: row.status,
    startedAt: row.started_at,
    completesAt: row.completes_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    secondsUntilCompletion: 600,
    isDue: row.status !== 'active',
  };
}

function estateBuildingJson(row: EstateBuildingRow) {
  return {
    estateId: row.estate_id,
    buildingId: row.building_id,
    level: row.level,
  };
}
