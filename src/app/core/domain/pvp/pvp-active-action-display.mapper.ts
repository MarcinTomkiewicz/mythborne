import { formatTimeOfDayLabel } from '../../utils/pending-timer';
import { PvpActionCopy } from './pvp-action-copy.model';
import { ActivePvpActionOffer } from './pvp.model';

export interface PvpActiveActionFactRow {
  label: string;
  value: string;
}

export interface PvpActiveActionTiming {
  startedAt: string | null;
  resolvesAt: string | null;
}

export function shouldShowActivePvpOffer(offer: ActivePvpActionOffer): boolean {
  return isPvpSpyActivePhase(offer) ||
    offer.isTravelPhase ||
    offer.isManualWindow ||
    offer.isBlockingRuntimeActivity;
}

export function pvpActiveActionTiming(offer: ActivePvpActionOffer): PvpActiveActionTiming {
  if (isPvpReturnRuntimePhase(offer)) {
    return {
      startedAt: offer.returnStartedAt ?? offer.phaseStartedAt ?? offer.resolvedAt,
      resolvesAt: returnAvailabilityAt(offer),
    };
  }

  if (offer.isTravelPhase) {
    return {
      startedAt: offer.phaseStartedAt ?? offer.startedAt,
      resolvesAt: offer.phaseEndsAt ?? offer.arrivesAt,
    };
  }

  if (isPvpSpyActivePhase(offer)) {
    return {
      startedAt: offer.phaseStartedAt ?? offer.startedAt,
      resolvesAt: offer.phaseEndsAt ?? offer.arrivesAt ?? offer.availableAt,
    };
  }

  if (offer.isManualWindow) {
    return {
      startedAt: offer.phaseStartedAt ?? offer.arrivesAt ?? offer.availableAt,
      resolvesAt: pvpActiveActionManualDecisionDeadlineAt(offer),
    };
  }

  if (offer.isBlockingRuntimeActivity) {
    return {
      startedAt: offer.startedAt,
      resolvesAt: offer.availableAt,
    };
  }

  return {
    startedAt: null,
    resolvesAt: null,
  };
}

export function pvpActiveActionManualDecisionDeadlineAt(
  offer: ActivePvpActionOffer,
): string | null {
  return offer.phaseEndsAt ?? offer.manualDeadlineAt ?? offer.expiresAt;
}

export function pvpActiveActionRefreshAt(offer: ActivePvpActionOffer): string | null {
  return pvpActiveActionTiming(offer).resolvesAt;
}

export function pvpActiveActionFactRows(
  offer: ActivePvpActionOffer,
  copy: PvpActionCopy,
): PvpActiveActionFactRow[] {
  const labels = copy.common.labels;
  const baseRows: Array<{ label: string; value: string | null }> = [
    { label: labels.action, value: pvpActiveActionKindLabel(offer, copy) },
    { label: labels.state, value: pvpActiveActionPhaseText(offer, copy) },
    { label: labels.target, value: offer.targetHeroDisplayName },
    { label: labels.targetAddress, value: offer.targetAddressLabel },
    { label: labels.yourAddress, value: offer.attackerAddressLabel },
  ];

  if (isPvpReturnRuntimePhase(offer)) {
    return presentFactRows([
      ...baseRows,
      { label: labels.availableFrom, value: timeDisplay(returnAvailabilityAt(offer)) },
    ]);
  }

  if (offer.isTravelPhase || isPvpSpyActivePhase(offer)) {
    return presentFactRows([
      ...baseRows,
      { label: labels.arrivalTime, value: timeDisplay(offer.phaseEndsAt ?? offer.arrivesAt ?? offer.availableAt) },
    ]);
  }

  if (offer.isManualWindow) {
    return presentFactRows([
      ...baseRows,
      { label: labels.decisionTime, value: timeDisplay(pvpActiveActionManualDecisionDeadlineAt(offer)) },
    ]);
  }

  return presentFactRows([
    ...baseRows,
    { label: labels.availableFrom, value: timeDisplay(offer.availableAt ?? offer.phaseEndsAt) },
  ]);
}

export function pvpActiveActionPhaseText(
  offer: ActivePvpActionOffer,
  copy: PvpActionCopy,
): string {
  if (isPvpReturnRuntimePhase(offer)) {
    return copy.activeAction.phaseText.attackReturn;
  }

  if (offer.actionKind === 'attack') {
    if (offer.isResolved) {
      return copy.activeAction.phaseText.attackResolved;
    }

    return offer.isManualWindow
      ? copy.activeAction.phaseText.attackManualWindow
      : copy.activeAction.phaseText.attackTravel;
  }

  return offer.isResolved
    ? copy.activeAction.phaseText.spyResolved
    : copy.activeAction.phaseText.spyTravel;
}

export function pvpActiveActionPendingHelperText(
  offer: ActivePvpActionOffer,
  copy: PvpActionCopy,
): string {
  if (isPvpReturnRuntimePhase(offer)) {
    return copy.activeAction.loading.refreshReturnState;
  }

  if (offer.isManualWindow) {
    return copy.activeAction.loading.refreshDecisionState;
  }

  return offer.actionKind === 'attack'
    ? copy.activeAction.loading.refreshAttackState
    : copy.activeAction.loading.refreshSpyState;
}

export function pvpActiveActionErrorMessage(_error: unknown, fallback: string): string {
  return fallback;
}

export function pvpActiveActionTitle(
  offer: ActivePvpActionOffer,
  copy: PvpActionCopy,
): string {
  if (isPvpReturnRuntimePhase(offer)) {
    return copy.activeAction.panel.returnTitle;
  }

  if (offer.actionKind === 'spy') {
    return copy.activeAction.panel.spyTitle;
  }

  if (offer.actionKind === 'attack') {
    return copy.activeAction.panel.attackTitle;
  }

  return copy.activeAction.panel.defaultTitle;
}

export function pvpActiveActionAriaLabel(
  offer: ActivePvpActionOffer,
  copy: PvpActionCopy,
): string {
  if (isPvpReturnRuntimePhase(offer)) {
    return copy.activeAction.panel.returnAriaLabel;
  }

  return offer.actionKind === 'spy'
    ? copy.activeAction.panel.spyAriaLabel
    : copy.activeAction.panel.attackAriaLabel;
}

export function pvpActiveActionKindLabel(
  offer: ActivePvpActionOffer,
  copy: PvpActionCopy,
): string {
  return offer.actionKind === 'spy'
    ? copy.common.labels.spyProgress
    : copy.common.labels.attack;
}

export function isPvpReturnRuntimePhase(offer: ActivePvpActionOffer): boolean {
  return offer.phase === 'returning';
}

function isPvpSpyActivePhase(offer: ActivePvpActionOffer): boolean {
  return offer.actionKind === 'spy' &&
    !offer.isResolved &&
    Boolean(offer.phaseEndsAt ?? offer.arrivesAt ?? offer.availableAt);
}

function returnAvailabilityAt(offer: ActivePvpActionOffer): string | null {
  return offer.returnAvailableAt ?? offer.availableAt ?? offer.phaseEndsAt;
}

function timeDisplay(value: string | null): string | null {
  return value ? formatTimeOfDayLabel(value) : null;
}

function presentFactRows(
  rows: Array<{ label: string; value: string | null }>,
): PvpActiveActionFactRow[] {
  return rows.filter(
    (row): row is PvpActiveActionFactRow => row.value !== null,
  );
}
