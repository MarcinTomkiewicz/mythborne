import { MansionBuildingJob } from '../../domain/building/building.model';
import {
  HeroDailyActionCounterReadModel,
  HeroPendingCombatEffectStateReadModel,
} from '../../domain/exploration/exploration-runtime.model';

export interface DashboardPersistentStateRow {
  key: string;
  label: string;
  value: string;
  route: string | null;
  isAttention: boolean;
}

export function mapDashboardPersistentStateRows(input: {
  activeBuildingJob: MansionBuildingJob | null;
  isBuildingJobStateLoaded: boolean;
  unreadReportCount: number;
  isReportsStateLoaded: boolean;
  trialCounter: HeroDailyActionCounterReadModel | null;
  isTrialCounterLoaded: boolean;
  activeCombatEffect: HeroPendingCombatEffectStateReadModel | null;
  isCombatEffectStateLoaded: boolean;
}): DashboardPersistentStateRow[] {
  return [
    reportsRow(input.unreadReportCount, input.isReportsStateLoaded),
    buildingJobRow(input.activeBuildingJob, input.isBuildingJobStateLoaded),
    trialsRemainingRow(input.trialCounter, input.isTrialCounterLoaded),
    activeCombatEffectRow(
      input.activeCombatEffect,
      input.isCombatEffectStateLoaded,
    ),
  ].filter((row): row is DashboardPersistentStateRow => row !== null);
}

function buildingJobRow(
  job: MansionBuildingJob | null,
  isLoaded: boolean,
): DashboardPersistentStateRow | null {
  if (!isLoaded) {
    return null;
  }

  if (!job) {
    return {
      key: 'estate-job-none',
      label: 'Building job',
      value: 'No building in progress',
      route: null,
      isAttention: false,
    };
  }

  return {
    key: `estate-job-${job.id}`,
    label: 'Building job',
    value: `${job.buildingName} to level ${job.targetLevel}`,
    route: '/game/mansion',
    isAttention: true,
  };
}

function reportsRow(
  count: number,
  isLoaded: boolean,
): DashboardPersistentStateRow | null {
  if (!isLoaded) {
    return null;
  }

  return {
    key: 'unread-reports',
    label: 'Reports',
    value: count > 0
      ? `${count} unread ${count === 1 ? 'report' : 'reports'}`
      : 'No unread reports',
    route: count > 0 ? '/game/reports' : null,
    isAttention: count > 0,
  };
}

function trialsRemainingRow(
  counter: HeroDailyActionCounterReadModel | null,
  isLoaded: boolean,
): DashboardPersistentStateRow | null {
  if (!isLoaded || !counter) {
    return null;
  }

  const count = counter.remainingCount;

  return {
    key: 'trials-remaining',
    label: 'Trials remaining',
    value: `${count} ${count === 1 ? 'trial' : 'trials'} remaining`,
    route: '/game/exploration',
    isAttention: count > 0,
  };
}

function activeCombatEffectRow(
  effect: HeroPendingCombatEffectStateReadModel | null,
  isLoaded: boolean,
): DashboardPersistentStateRow | null {
  if (!isLoaded) {
    return null;
  }

  if (!effect) {
    return {
      key: 'active-combat-effect-none',
      label: 'Active state',
      value: 'No active state',
      route: null,
      isAttention: false,
    };
  }

  return {
    key: `active-combat-effect-${effect.effectId}`,
    label: 'Active state',
    value: combatEffectValue(effect),
    route: '/game/exploration',
    isAttention: true,
  };
}

function combatEffectValue(effect: HeroPendingCombatEffectStateReadModel): string {
  return effect.playerSummary
    || effect.effectLabel
    || effect.effectKindLabel
    || 'Active state';
}
