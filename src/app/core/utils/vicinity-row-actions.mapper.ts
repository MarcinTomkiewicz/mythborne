import { DATA_ROW_ACTION_CONFIGS } from '../configs/data-row-actions.config';
import type { PvpActionCopy } from '../domain/pvp/pvp-action-copy.model';
import { PvpTargetCandidate } from '../domain/pvp/pvp.model';
import {
  DataRowAction,
  DataRowActionAvailability,
} from '../types/data-row.types';

export function toVicinityDataRowActions(
  candidate: PvpTargetCandidate,
  copy: PvpActionCopy['common'],
): DataRowAction[] {
  return DATA_ROW_ACTION_CONFIGS.map((config) => {
    const disabled = isDataRowActionDisabled(candidate, config.availability);

    return {
      kind: config.kind,
      icon: config.icon,
      label: rowActionLabel(config.kind, copy),
      tooltip: rowActionTooltip(config.kind, copy),
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
  copy: PvpActionCopy['common'],
): string {
  if (kind === 'spy') {
    return copy.actionLabels.spy;
  }

  if (kind === 'attack') {
    return copy.actionLabels.attack;
  }

  return copy.actionLabels.siege;
}

function rowActionTooltip(
  kind: DataRowAction['kind'],
  copy: PvpActionCopy['common'],
): string {
  if (kind === 'spy') {
    return copy.actionTooltips.spy;
  }

  if (kind === 'attack') {
    return copy.actionTooltips.attack;
  }

  return copy.actionTooltips.siegeUnavailable;
}
