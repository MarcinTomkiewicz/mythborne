import { MansionBuildingJob } from '../../domain/building/building.model';
import {
  HeroDailyActionCounterReadModel,
  HeroPendingCombatEffectStateReadModel,
} from '../../domain/exploration/exploration-runtime.model';
import { mapDashboardPersistentStateRows } from './dashboard-persistent-state.mapper';

describe('dashboard persistent state mapper', () => {
  it('maps source-backed active rows without badge-specific display state', () => {
    expect(
      mapDashboardPersistentStateRows({
        activeBuildingJob: buildingJob(),
        isBuildingJobStateLoaded: true,
        unreadReportCount: 2,
        isReportsStateLoaded: true,
        trialCounter: trialCounter(3),
        isTrialCounterLoaded: true,
        activeCombatEffect: combatEffect(),
        isCombatEffectStateLoaded: true,
      }),
    ).toEqual([
      {
        key: 'unread-reports',
        label: 'Reports',
        value: '2 unread reports',
        route: '/game/reports',
        isAttention: true,
      },
      {
        key: 'estate-job-job-1',
        label: 'Building job',
        value: 'Farm to level 2',
        route: '/game/mansion',
        isAttention: true,
      },
      {
        key: 'trials-remaining',
        label: 'Trials remaining',
        value: '3 trials remaining',
        route: '/game/exploration',
        isAttention: true,
      },
      {
        key: 'active-combat-effect-effect-1',
        label: 'Active state',
        value: 'Blessing: +10% defense',
        route: '/game/exploration',
        isAttention: true,
      },
    ]);
  });

  it('maps only source-backed negative rows after sources load empty', () => {
    expect(
      mapDashboardPersistentStateRows({
        activeBuildingJob: null,
        isBuildingJobStateLoaded: true,
        unreadReportCount: 0,
        isReportsStateLoaded: true,
        trialCounter: trialCounter(0),
        isTrialCounterLoaded: true,
        activeCombatEffect: null,
        isCombatEffectStateLoaded: true,
      }),
    ).toEqual([
      jasmine.objectContaining({
        key: 'unread-reports',
        value: 'No unread reports',
        isAttention: false,
      }),
      jasmine.objectContaining({
        key: 'estate-job-none',
        value: 'No building in progress',
        isAttention: false,
      }),
      jasmine.objectContaining({
        key: 'trials-remaining',
        value: '0 trials remaining',
        isAttention: false,
      }),
      jasmine.objectContaining({
        key: 'active-combat-effect-none',
        value: 'No active state',
        isAttention: false,
      }),
    ]);
  });

  it('does not invent negative rows for sources that failed to load', () => {
    expect(
      mapDashboardPersistentStateRows({
        activeBuildingJob: null,
        isBuildingJobStateLoaded: false,
        unreadReportCount: 0,
        isReportsStateLoaded: false,
        trialCounter: null,
        isTrialCounterLoaded: false,
        activeCombatEffect: null,
        isCombatEffectStateLoaded: false,
      }),
    ).toEqual([]);
  });
});

function buildingJob(): MansionBuildingJob {
  return {
    id: 'job-1',
    estateId: 'estate-1',
    buildingId: 'building-1',
    buildingKey: 'farm',
    buildingName: 'Farm',
    targetLevel: 2,
    status: 'active',
    startedAt: '2026-05-13T10:00:00.000Z',
    completesAt: '2026-05-13T11:00:00.000Z',
    durationSeconds: 3600,
    remainingSeconds: 1800,
    progressPercent: 50,
    createdAt: '2026-05-13T10:00:00.000Z',
    updatedAt: '2026-05-13T10:00:00.000Z',
  };
}

function trialCounter(remainingCount: number): HeroDailyActionCounterReadModel {
  return {
    id: 'counter-1',
    serverId: 'server-1',
    heroId: 'hero-1',
    actionKind: 'trial',
    actionDate: '2026-05-13',
    remainingCount,
    metadataJson: {},
    createdAt: '2026-05-13T00:00:00.000Z',
    updatedAt: '2026-05-13T10:00:00.000Z',
  };
}

function combatEffect(): HeroPendingCombatEffectStateReadModel {
  return {
    effectId: 'effect-1',
    serverId: 'server-1',
    heroId: 'hero-1',
    explorationId: 'exploration-1',
    effectDefinitionId: 'effect-definition-1',
    effectKey: 'blessing',
    effectLabel: 'Blessing',
    effectDescription: 'Defensive blessing.',
    effectHelperText: 'Improves defense in combat.',
    effectKind: 'buff',
    effectKindLabel: 'Buff',
    effectTargetKey: 'defense',
    effectTargetLabel: 'Defense',
    bonusTemplateKey: 'defense_percent',
    bonusTemplateLabel: 'Defense percent',
    valueDisplay: '+10%',
    status: 'pending',
    isActive: true,
    runtimeIncluded: true,
    playerSummary: 'Blessing: +10% defense',
    metadataJson: {},
    appliedAt: '2026-05-13T10:00:00.000Z',
    consumedAt: null,
    consumedByKind: null,
    consumedById: null,
  };
}
