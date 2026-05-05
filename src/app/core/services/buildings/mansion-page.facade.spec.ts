import { signal, WritableSignal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of, Subject } from 'rxjs';
import {
  MansionBuilding,
  MansionEstateView,
  StartBuildingUpgradeResult,
} from '../../domain/building/building.model';
import { ActiveHeroState } from '../../interfaces/hero/active-hero.interface';
import { ActiveHero } from '../hero/active-hero';
import { BuildingExplainabilityMetadata } from './building-explainability-metadata';
import { BuildingsService } from './buildings';
import { MansionPageFacade } from './mansion-page.facade';
import { ToastService } from '../ui/toast';

describe('MansionPageFacade', () => {
  let facade: MansionPageFacade;
  let buildingsService: jasmine.SpyObj<BuildingsService>;
  let explainabilityMetadata: jasmine.SpyObj<BuildingExplainabilityMetadata>;
  let activeHero: jasmine.SpyObj<ActiveHero>;
  let toast: jasmine.SpyObj<ToastService>;
  let activeHeroState: WritableSignal<ActiveHeroState | null>;

  beforeEach(() => {
    buildingsService = jasmine.createSpyObj<BuildingsService>('BuildingsService', [
      'getMansionEstateView',
      'startBuildingUpgrade',
    ]);
    explainabilityMetadata = jasmine.createSpyObj<BuildingExplainabilityMetadata>(
      'BuildingExplainabilityMetadata',
      ['getRuntimeEntries'],
    );
    activeHeroState = signal<ActiveHeroState | null>({
      heroId: 'hero-1',
      serverId: 'server-1',
      userId: 'user-1',
      hero: {} as never,
      heroRow: {} as never,
      server: {} as never,
    });
    activeHero = jasmine.createSpyObj<ActiveHero>(
      'ActiveHero',
      ['loadActiveHero'],
      { state: activeHeroState.asReadonly() },
    );
    toast = jasmine.createSpyObj<ToastService>('ToastService', ['show']);
    buildingsService.getMansionEstateView.and.returnValue(of(mansionView()));
    explainabilityMetadata.getRuntimeEntries.and.returnValue(of([]));
    buildingsService.startBuildingUpgrade.and.returnValue(of({
      auditLogId: 'audit-1',
      buildTimeSeconds: 120,
      buildingId: 'building-1',
      completesAt: '2026-05-04T10:02:00.000Z',
      estateId: 'estate-1',
      jobId: 'job-1',
      startedAt: '2026-05-04T10:00:00.000Z',
      status: 'active',
      targetLevel: 1,
      resourceCosts: [
        { resourceType: 'drachma', cost: 100, balanceAfter: 900 },
      ],
    }));
    activeHero.loadActiveHero.and.returnValue(of(null));

    TestBed.configureTestingModule({
      providers: [
        MansionPageFacade,
        { provide: BuildingsService, useValue: buildingsService },
        { provide: BuildingExplainabilityMetadata, useValue: explainabilityMetadata },
        { provide: ActiveHero, useValue: activeHero },
        { provide: ToastService, useValue: toast },
      ],
    });
    facade = TestBed.inject(MansionPageFacade);
  });

  it('loads mansion building state without relocation UI state', () => {
    facade.loadData();

    expect(facade.currentAddress()).toBe('A-3301');
    expect(facade.currentDistrictCode()).toBe('A');
    expect(facade.currentDistrictRank()).toBe(1);
    expect(facade.resourceBalances()).toEqual([
      { resourceType: 'drachma', amount: 900, perHour: 10 },
      { resourceType: 'materials', amount: 450, perHour: 0 },
      { resourceType: 'workforce', amount: 100, perHour: 0 },
    ]);
    expect(facade.activeBuildingJob()).toBeNull();
    expect(facade.recentBuildingJobs()).toEqual([]);
    expect(facade.finalizedBuildingJobsCount()).toBe(0);
    expect(facade.visibleBuildings()).toEqual([]);
    expect(explainabilityMetadata.getRuntimeEntries).toHaveBeenCalled();
    expect(activeHero.loadActiveHero).toHaveBeenCalled();

    const exposedKeys = Object.keys(facade as unknown as Record<string, unknown>);
    expect(exposedKeys.some((key) => key.toLowerCase().includes('relocation'))).toBeFalse();
    expect(exposedKeys).not.toContain('relocateEstate');
  });

  it('ignores stale mansion responses from an earlier load request', () => {
    const first = new Subject<MansionEstateView>();
    const second = new Subject<MansionEstateView>();
    buildingsService.getMansionEstateView.and.returnValues(
      first.asObservable(),
      second.asObservable(),
    );

    facade.loadData();
    facade.loadData();
    second.next({
      ...mansionView(),
      currentAddress: 'A-3302',
    });
    second.complete();
    first.next({
      ...mansionView(),
      currentAddress: 'A-3301',
    });
    first.complete();

    expect(facade.currentAddress()).toBe('A-3302');
  });

  it('starts a build action, refreshes active hero and reloads mansion data', () => {
    facade.loadData();

    facade.startBuildingUpgrade(building());

    expect(buildingsService.startBuildingUpgrade).toHaveBeenCalledWith('building-1');
    expect(activeHero.loadActiveHero).toHaveBeenCalled();
    expect(buildingsService.getMansionEstateView).toHaveBeenCalledTimes(2);
    expect(facade.lastStartedJob()).toEqual(jasmine.objectContaining({
      jobId: 'job-1',
      targetLevel: 1,
    }));
    expect(facade.actionSuccess()).toBe('Agora started to level 1.');
    expect(toast.show).toHaveBeenCalledWith(
      'success',
      'Building started',
      'Agora started to level 1. Completion is tracked by the active building job.',
    );
    expect(facade.actionError()).toBeNull();
    expect(facade.canStartBuilding(building())).toBeFalse();
    expect(facade.disabledBuildReason(building()))
      .toBe('A building job has just started and estate state is refreshing.');
  });

  it('blocks build action locally while another building job is active', () => {
    facade.activeBuildingJob.set({
      id: 'job-active',
      estateId: 'estate-1',
      buildingId: 'building-2',
      buildingKey: 'farm',
      buildingName: 'Farm',
      targetLevel: 2,
      status: 'active',
      startedAt: '2026-05-04T10:00:00.000Z',
      completesAt: '2026-05-04T10:10:00.000Z',
      durationSeconds: 600,
      remainingSeconds: 600,
      progressPercent: 0,
      createdAt: '2026-05-04T10:00:00.000Z',
      updatedAt: '2026-05-04T10:00:00.000Z',
    });

    facade.startBuildingUpgrade(building());

    expect(buildingsService.startBuildingUpgrade).not.toHaveBeenCalled();
    expect(facade.actionError()).toBe('Another estate building job is already active.');
    expect(toast.show).toHaveBeenCalledWith(
      'warn',
      'Building action unavailable',
      'Another estate building job is already active.',
    );
  });

  it('ignores stale building action responses after active hero context changes', () => {
    const action = new Subject<StartBuildingUpgradeResult>();
    buildingsService.startBuildingUpgrade.and.returnValue(action.asObservable());

    facade.loadData();
    facade.startBuildingUpgrade(building());

    activeHeroState.set({
      heroId: 'hero-2',
      serverId: 'server-1',
      userId: 'user-1',
      hero: {} as never,
      heroRow: {} as never,
      server: {} as never,
    });
    action.next({
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
    });

    expect(facade.lastStartedJob()).toBeNull();
    expect(facade.actionSuccess()).toBeNull();
    expect(facade.startingBuildingId()).toBeNull();
  });
});

function mansionView(): MansionEstateView {
  return {
    heroId: 'hero-1',
    serverId: 'server-1',
    currentAddress: 'A-3301',
    currentDistrictCode: 'A',
    currentDistrictName: 'District A',
    currentDistrictRank: 1,
    resourceBalances: [
      { resourceType: 'drachma', amount: 900, perHour: 10 },
      { resourceType: 'materials', amount: 450, perHour: 0 },
      { resourceType: 'workforce', amount: 100, perHour: 0 },
    ],
    activeBuildingJob: null,
    recentBuildingJobs: [],
    finalizedBuildingJobsCount: 0,
    buildings: [],
  };
}

function building(): MansionBuilding {
  return {
    id: 'building-1',
    key: 'agora',
    name: 'Agora',
    description: null,
    imagePath: null,
    districtCode: 'A',
    districtUnlockRank: 1,
    rankRequired: 1,
    sortOrder: 10,
    startingLevel: 1,
    baseCost: 100,
    maxLevel: 0,
    effectiveMaxLevel: 0,
    isUnlimited: true,
    currentLevel: 0,
    nextLevel: 1,
    baseBuildTimeSeconds: 120,
    isOwned: false,
    isUnlocked: true,
    canUpgrade: true,
    nextUpgradeTimeSeconds: 120,
    nextUpgradeCosts: [{ resourceType: 'drachma', amount: 100 }],
    activeCostRules: [],
    activeRequirements: [],
    bonuses: [],
  };
}
