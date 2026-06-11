import { DATA_ROW_ACTION_CONFIGS } from '../configs/data-row-actions.config';
import { PvpTargetCandidate } from '../domain/pvp/pvp.model';
import type { PlayerVicinityCopyReadModel } from '../domain/vicinity/player-vicinity-page-context.model';
import {
  DataRowAction,
  DataRowActionAvailability,
} from '../types/data-row.types';

export function toVicinityDataRowActions(
  candidate: PvpTargetCandidate,
  addressListCopy: PlayerVicinityCopyReadModel['addressList'],
  selectedTargetCopy: PlayerVicinityCopyReadModel['selectedTarget'],
): DataRowAction[] {
  return DATA_ROW_ACTION_CONFIGS.map((config) => {
    const disabled = isDataRowActionDisabled(candidate, config.availability);

    return {
      kind: config.kind,
      icon: config.icon,
      label: rowActionLabel(config.kind, addressListCopy, selectedTargetCopy),
      tooltip: rowActionTooltip(config.kind, addressListCopy),
      severity: config.severity,
      disabled,
      primary: config.primaryWhenAvailable && !disabled,
      pending: false,
    };
  });
}

function isDataRowActionDisabled(
  candidate: PvpTargetCandidate,
  availability: DataRowActionAvailability,
): boolean {
  if (availability === 'spy') {
    return !candidate.spyEligibility.canStart;
  }

  if (availability === 'attack') {
    return !candidate.attackEligibility.canStart;
  }

  return true;
}

function rowActionLabel(
  kind: DataRowAction['kind'],
  addressListCopy: PlayerVicinityCopyReadModel['addressList'],
  selectedTargetCopy: PlayerVicinityCopyReadModel['selectedTarget'],
): string {
  if (kind === 'spy') {
    return addressListCopy.columnSpy;
  }

  if (kind === 'attack') {
    return addressListCopy.columnAttack;
  }

  return selectedTargetCopy.siegeLabel;
}

function rowActionTooltip(
  kind: DataRowAction['kind'],
  copy: PlayerVicinityCopyReadModel['addressList'],
): string {
  if (kind === 'spy') {
    return copy.spyTooltip;
  }

  if (kind === 'attack') {
    return copy.attackTooltip;
  }

  return copy.siegeTooltip;
}
