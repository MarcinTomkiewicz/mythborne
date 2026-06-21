import {
  formatTimeOfDayLabel,
  pendingTimerHasElapsed,
} from '../../utils/pending-timer';
import {
  PvpActiveActionFactCandidate,
  PvpActiveActionFactRow,
  PvpActiveActionTiming,
} from './pvp-active-action-display.model';
import { PvpActionCopy } from './pvp-action-copy.model';
import { ActivePvpActionOffer } from './pvp.model';

export function shouldShowActivePvpOffer(offer: ActivePvpActionOffer): boolean {
  return isPvpSpyActivePhase(offer) ||
    isPvpActiveCombatOffer(offer) ||
    offer.isTravelPhase ||
    offer.isManualWindow ||
    offer.isBlockingRuntimeActivity;
}

export function isPvpManualCombatDecisionOffer(
  offer: ActivePvpActionOffer,
): boolean {
  return offer.actionKind === 'attack' &&
    offer.phase === 'manual_window' &&
    offer.isManualWindow &&
    offer.canEnterManualResolution &&
    !offer.isResolved;
}

export function isPvpActiveCombatOffer(
  offer: ActivePvpActionOffer,
): boolean {
  return offer.actionKind === 'attack' &&
    offer.phase === 'live_combat' &&
    !!offer.combatLiveSessionId &&
    offer.combatLiveStatusKey === 'awaiting_player_action' &&
    offer.awaitingPlayerAction &&
    !offer.isResolved;
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
      resolvesAt: pvpActiveActionTravelArrivalAt(offer),
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

export function pvpReturnRefreshKey(offer: ActivePvpActionOffer): string {
  const returnResolvesAt = returnAvailabilityAt(offer) ?? '';

  return `${offer.pvpActionId}:${offer.runtimeActivityId ?? ''}:${returnResolvesAt}`;
}

export function isPvpAttackArrivalReady(
  offer: ActivePvpActionOffer,
  nowMs: number,
): boolean {
  return offer.actionKind === 'attack' &&
    offer.isTravelPhase &&
    !offer.isManualWindow &&
    !offer.canEnterManualResolution &&
    offer.phase !== 'manual_window' &&
    offer.phase !== 'live_combat' &&
    !offer.combatLiveSessionId &&
    !offer.isResolved &&
    pendingTimerHasElapsed({ resolvesAt: offer.arrivesAt, nowMs });
}

export function pvpActiveActionFactRows(
  offer: ActivePvpActionOffer,
  copy: PvpActionCopy,
): PvpActiveActionFactRow[] {
  const labels = copy.common.labels;
  const baseRows: PvpActiveActionFactCandidate[] = [
    { label: labels.action, value: pvpActiveActionKindLabel(offer, copy) },
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
      { label: labels.arrivalTime, value: timeDisplay(pvpActiveActionTravelArrivalAt(offer)) },
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

function pvpActiveActionTravelArrivalAt(offer: ActivePvpActionOffer): string | null {
  return offer.actionKind === 'attack'
    ? offer.arrivesAt
    : offer.phaseEndsAt ?? offer.arrivesAt ?? offer.availableAt;
}

function returnAvailabilityAt(offer: ActivePvpActionOffer): string | null {
  return offer.returnAvailableAt ?? offer.availableAt ?? offer.phaseEndsAt;
}

function timeDisplay(value: string | null): string | null {
  return value ? formatTimeOfDayLabel(value) : null;
}

function presentFactRows(
  rows: PvpActiveActionFactCandidate[],
): PvpActiveActionFactRow[] {
  return rows.filter(
    (row): row is PvpActiveActionFactRow => row.value !== null,
  );
}
