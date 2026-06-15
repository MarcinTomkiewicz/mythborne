import { signal, WritableSignal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of, Subject } from 'rxjs';
import {
  EstateBuildingJob,
  EstateBuildingRow,
  PlayerEstatePageContext,
} from '../../domain/estate/player-estate-page-context.model';
import {
  ActiveHeroState,
  RequiredActiveHeroState,
} from '../../interfaces/hero/active-hero.interface';
import { ActiveHero } from '../hero/active-hero';
import { PlayerEstate } from '../estate/player-estate';
import { BuildingJobs } from './building-jobs';
import { MansionPageFacade } from './mansion-page.facade';
import { StartBuildingUpgradeResult } from '../../domain/building/building.model';

describe('MansionPageFacade', () => {
  let facade: MansionPageFacade;
  let playerEstate: jasmine.SpyObj<PlayerEstate>;
  let buildingJobs: jasmine.SpyObj<BuildingJobs>;
  let activeHero: jasmine.SpyObj<ActiveHero>;
  let activeHeroState: WritableSignal<ActiveHeroState | null>;

  beforeEach(() => {
    playerEstate = jasmine.createSpyObj<PlayerEstate>('PlayerEstate', ['getPageContext']);
    buildingJobs = jasmine.createSpyObj<BuildingJobs>('BuildingJobs', [
      'startHeroEstateBuildingUpgrade',
    ]);
    activeHeroState = signal<ActiveHeroState | null>(activeHeroStateValue());
    activeHero = jasmine.createSpyObj<ActiveHero>(
      'ActiveHero',
      ['requireActiveHero'],
      { state: activeHeroState.asReadonly() },
    );

    playerEstate.getPageContext.and.returnValue(of(pageContext()));
    activeHero.requireActiveHero.and.returnValue(of(requiredActiveHeroState()));
    buildingJobs.startHeroEstateBuildingUpgrade.and.returnValue(of(upgradeResult()));

    TestBed.configureTestingModule({
      providers: [
        MansionPageFacade,
        { provide: PlayerEstate, useValue: playerEstate },
        { provide: BuildingJobs, useValue: buildingJobs },
        { provide: ActiveHero, useValue: activeHero },
      ],
    });
    facade = TestBed.inject(MansionPageFacade);
  });

  it('loads only the player estate page context for Mansion state', () => {
    facade.loadData();

    expect(playerEstate.getPageContext).toHaveBeenCalledTimes(1);
    expect(facade.context()?.contractVersion).toBe('player_estate_page_context_v3');
    expect(facade.estateRuntimeState()?.address).toBe('A-3301');
    expect(facade.resources().map((row) => row.displayLabel)).toEqual([
      'Drachma',
      'Materials',
    ]);
    expect(facade.buildings().map((row) => row.buildingId)).toEqual(['building-1']);

    const exposedKeys = Object.keys(facade as unknown as Record<string, unknown>);
    expect(exposedKeys.some((key) => key.toLowerCase().includes('relocation'))).toBeFalse();
    expect(exposedKeys).not.toContain('uiMetadata');
    expect(exposedKeys).not.toContain('resourceBalances');
  });

  it('ignores stale page-context responses from an earlier load request', () => {
    const first = new Subject<PlayerEstatePageContext>();
    const second = new Subject<PlayerEstatePageContext>();
    playerEstate.getPageContext.and.returnValues(
      first.asObservable(),
      second.asObservable(),
    );

    facade.loadData();
    facade.loadData();
    second.next(pageContext({ address: 'A-3302' }));
    second.complete();
    first.next(pageContext({ address: 'A-3301' }));
    first.complete();

    expect(facade.estateRuntimeState()?.address).toBe('A-3302');
  });

  it('starts upgrades through the canonical RPC helper and reloads page context', () => {
    facade.loadData();

    facade.startBuildingUpgrade(buildingRow());

    expect(activeHero.requireActiveHero).toHaveBeenCalled();
    expect(buildingJobs.startHeroEstateBuildingUpgrade).toHaveBeenCalledWith({
      heroId: 'hero-1',
      buildingId: 'building-1',
    });
    expect(playerEstate.getPageContext).toHaveBeenCalledTimes(2);
    expect(facade.startingBuildingId()).toBeNull();
    expect(facade.actionError()).toBeNull();
  });

  it('blocks upgrade RPC when an active job is present in the context', () => {
    playerEstate.getPageContext.and.returnValue(of(pageContext({
      activeJob: activeJob(),
    })));

    facade.loadData();
    facade.startBuildingUpgrade(buildingRow());

    expect(buildingJobs.startHeroEstateBuildingUpgrade).not.toHaveBeenCalled();
  });

  it('blocks upgrade RPC for max-level or unavailable buildings', () => {
    facade.loadData();

    facade.startBuildingUpgrade(buildingRow({ isAtMaxLevel: true }));
    facade.startBuildingUpgrade(buildingRow({ isAvailableInEstateDistrict: false }));

    expect(buildingJobs.startHeroEstateBuildingUpgrade).not.toHaveBeenCalled();
  });

  it('ignores stale upgrade responses after active hero context changes', () => {
    const action = new Subject<StartBuildingUpgradeResult>();
    buildingJobs.startHeroEstateBuildingUpgrade.and.returnValue(action.asObservable());

    facade.loadData();
    facade.startBuildingUpgrade(buildingRow());

    activeHeroState.set(activeHeroStateValue({ heroId: 'hero-2' }));
    action.next(upgradeResult());
    action.complete();

    expect(playerEstate.getPageContext).toHaveBeenCalledTimes(1);
    expect(facade.startingBuildingId()).toBeNull();
    expect(facade.actionError()).toBeNull();
  });
});

function activeHeroStateValue(input: {
  heroId?: string;
  serverId?: string;
} = {}): ActiveHeroState {
  return {
    heroId: input.heroId ?? 'hero-1',
    serverId: input.serverId ?? 'server-1',
    userId: 'user-1',
    hero: {} as never,
    heroRow: {} as never,
    server: {} as never,
  };
}

function requiredActiveHeroState(): RequiredActiveHeroState {
  return {
    ...activeHeroStateValue(),
    heroId: 'hero-1',
    hero: {} as never,
    heroRow: {} as never,
  };
}

function pageContext(input: {
  address?: string;
  activeJob?: EstateBuildingJob;
} = {}): PlayerEstatePageContext {
  return {
    contractVersion: 'player_estate_page_context_v3',
    hero: {
      id: 'hero-1',
      name: 'Hero',
      level: 1,
      origin_id: null,
      rank: 1,
      experience: 0,
      profile_picture: null,
      created_at: '2026-05-04T10:00:00.000Z',
      estate_id: 'estate-1',
      user_id: 'user-1',
      server_id: 'server-1',
      character_points: 0,
      total_character_points_earned: 0,
      total_experience_earned: 0,
    },
    copyJson: {
      sections: {
        overview: 'Overview',
        buildings: 'Buildings',
        resources: 'Resources',
        requirements: 'Requirements',
        upgradePreview: 'Upgrade preview',
        bonuses: 'Bonuses',
      },
      summary: {
        address: 'Address',
        district: 'District',
        rank: 'Rank',
        buildingsReady: 'Ready',
        activeJob: 'Active job',
      },
      actions: {
        upgrade: 'Upgrade',
        details: 'Details',
      },
      empty: {
        buildings: 'No buildings',
        requirements: 'No requirements',
        bonuses: 'No bonuses',
        activeJob: 'No active job',
      },
      labels: {
        currentLevel: 'Current',
        nextLevel: 'Next',
        maxLevel: 'Max',
        buildTime: 'Build time',
        availableInDistrict: 'District',
      },
    },
    estateRuntimeState: {
      hero_id: 'hero-1',
      server_id: 'server-1',
      estate_id: 'estate-1',
      district_code: 'A',
      address_number: 3301,
      address: input.address ?? 'A-3301',
      estate_rank: 1,
      settled_completed_count: 0,
      settled_as_of: '2026-05-04T10:00:00.000Z',
      active_job_json: input.activeJob ?? null,
      recent_jobs_json: [],
      resources_json: [
        {
          resourceId: 'resource-1',
          heroId: 'hero-1',
          resourceType: 'drachma',
          amount: 900,
          perHour: 10,
          updatedAt: '2026-05-04T10:00:00.000Z',
          dbNow: '2026-05-04T10:00:00.000Z',
          elapsedHours: 0,
          naiveLiveAmountIfAccrued: 900,
          displayLabel: 'Drachma',
          displayValue: '900',
        },
        {
          resourceId: 'resource-2',
          heroId: 'hero-1',
          resourceType: 'materials',
          amount: 450,
          perHour: 0,
          updatedAt: '2026-05-04T10:00:00.000Z',
          dbNow: '2026-05-04T10:00:00.000Z',
          elapsedHours: 0,
          naiveLiveAmountIfAccrued: 450,
          displayLabel: 'Materials',
          displayValue: '450',
        },
      ],
      buildings_json: [buildingRow()],
      attack_protection_active: false,
      siege_protection_active: false,
    },
  };
}

function activeJob(): EstateBuildingJob {
  return {
    jobId: 'job-active',
    estateId: 'estate-1',
    buildingId: 'building-2',
    buildingKey: 'farm',
    buildingName: 'Farm',
    targetLevel: 2,
    status: 'active',
    startedAt: '2026-05-04T10:00:00.000Z',
    completesAt: '2026-05-04T10:10:00.000Z',
    createdAt: '2026-05-04T10:00:00.000Z',
    updatedAt: '2026-05-04T10:00:00.000Z',
    secondsUntilCompletion: 600,
    isDue: false,
  };
}

function buildingRow(input: {
  isAtMaxLevel?: boolean;
  isAvailableInEstateDistrict?: boolean;
} = {}): EstateBuildingRow {
  return {
    buildingId: 'building-1',
    buildingKey: 'agora',
    buildingName: 'Agora',
    buildingDescription: 'Agora description',
    districtCode: 'A',
    level: 0,
    currentLevel: 0,
    targetLevel: 1,
    nextLevel: 1,
    startingLevel: 0,
    maxLevel: 0,
    effectiveMaxLevel: 0,
    isAtMaxLevel: input.isAtMaxLevel ?? false,
    isAvailableInEstateDistrict: input.isAvailableInEstateDistrict ?? true,
    resourceCostsJson: [],
    requirementsJson: [],
    bonusesJson: [],
    upgradePreviewJson: {
      contractVersion: 'estate_building_upgrade_preview_v2',
      currentLevel: 0,
      targetLevel: 1,
      nextLevel: 1,
      isAtMaxLevel: false,
      effectiveMaxLevel: 0,
      buildTimeSeconds: 120,
      resourceCostsJson: [],
      requirementsJson: [],
      bonusesJson: [],
      meetsRequirements: true,
      requirementCount: 0,
      unmetCount: 0,
      failuresJson: [],
    },
    meetsRequirements: true,
    requirementCount: 0,
    unmetCount: 0,
    requirementFailuresJson: [],
  };
}

function upgradeResult(): StartBuildingUpgradeResult {
  return {
    auditLogId: 'audit-1',
    buildTimeSeconds: 120,
    buildingId: 'building-1',
    completesAt: '2026-05-04T10:02:00.000Z',
    estateId: 'estate-1',
    jobId: 'job-1',
    startedAt: '2026-05-04T10:00:00.000Z',
    status: 'active',
    targetLevel: 1,
    resourceCosts: [],
  };
}
