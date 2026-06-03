import { VICINITY_ROW_ACTION_CONFIGS } from '../configs/vicinity-row-actions.config';
import { PvpTargetCandidate } from '../domain/pvp/pvp.model';
import {
  VicinityRowAction,
  VicinityRowActionAvailability,
} from '../types/vicinity.types';

export function toVicinityRowActions(
  candidate: PvpTargetCandidate,
): VicinityRowAction[] {
  return VICINITY_ROW_ACTION_CONFIGS.map((config) => {
    const disabled = isVicinityRowActionDisabled(candidate, config.availability);

    return {
      kind: config.kind,
      icon: config.icon,
      label: config.label,
      severity: config.severity,
      disabled,
      primary: config.primaryWhenAvailable && !disabled,
      pending: false,
    };
  });
}

function isVicinityRowActionDisabled(
  candidate: PvpTargetCandidate,
  availability: VicinityRowActionAvailability,
): boolean {
  if (availability === 'spy') {
    return !candidate.spyEligibility.canStart;
  }

  if (availability === 'attack') {
    return !candidate.attackEligibility.canStart;
  }

  return true;
}
