import { MansionBuildingJob } from '../../domain/building/building.model';
import { CurrentEstateAddressReadModel } from '../../domain/estate/estate-address.model';
import {
  HeroDailyActionCounterReadModel,
  HeroPendingCombatEffectStateReadModel,
} from '../../domain/exploration/exploration-runtime.model';
import { toBuildingDurationLabel } from '../../utils/building-display';
import { DashboardPersistentStateRow } from './dashboard-persistent-state.model';

export function mapDashboardPersistentStateRows(input: {
  activeBuildingJob: MansionBuildingJob | null;
  isBuildingJobStateLoaded: boolean;
  unreadReportCount: number;
  isReportsStateLoaded: boolean;
  trialCounter: HeroDailyActionCounterReadModel | null;
  isTrialCounterLoaded: boolean;
  activeCombatEffect: HeroPendingCombatEffectStateReadModel | null;
  isCombatEffectStateLoaded: boolean;
  estateAddress: CurrentEstateAddressReadModel | null;
  isEstateAddressLoaded: boolean;
}): DashboardPersistentStateRow[] {
  return [
    trialsRemainingRow(input.trialCounter, input.isTrialCounterLoaded),
    activeCombatEffectRow(
      input.activeCombatEffect,
      input.isCombatEffectStateLoaded,
    ),
    buildingJobRow(input.activeBuildingJob, input.isBuildingJobStateLoaded),
    districtRow(input.estateAddress, input.isEstateAddressLoaded),
    vicinityRow(input.estateAddress, input.isEstateAddressLoaded),
    reportsRow(input.unreadReportCount, input.isReportsStateLoaded),
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
    value: buildingJobValue(job),
    route: '/game/mansion',
    isAttention: true,
  };
}

function buildingJobValue(job: MansionBuildingJob): string {
  const jobLabel = `${job.buildingName} to level ${job.targetLevel}`;

  if (job.remainingSeconds <= 0) {
    return `${jobLabel} - Ready / refresh mansion`;
  }

  return `${jobLabel} - ${toBuildingDurationLabel(job.remainingSeconds)} remaining`;
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
    label: 'Unread reports',
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

function districtRow(
  estateAddress: CurrentEstateAddressReadModel | null,
  isLoaded: boolean,
): DashboardPersistentStateRow | null {
  if (!isLoaded || !estateAddress) {
    return null;
  }

  return {
    key: 'estate-district',
    label: 'District',
    value: estateAddress.districtName
      ? `${estateAddress.districtName} (${estateAddress.districtCode})`
      : `District ${estateAddress.districtCode}`,
    route: null,
    isAttention: false,
  };
}

function vicinityRow(
  estateAddress: CurrentEstateAddressReadModel | null,
  isLoaded: boolean,
): DashboardPersistentStateRow | null {
  if (!isLoaded || !estateAddress) {
    return null;
  }

  return {
    key: 'vicinity-view',
    label: 'Vicinity view',
    value: 'Open Vicinity',
    route: '/game/vicinity',
    isAttention: false,
  };
}
