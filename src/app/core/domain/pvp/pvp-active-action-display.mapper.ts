import { formatTimeOfDayLabel } from '../../utils/pending-timer';
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

export function pvpActiveActionFactRows(offer: ActivePvpActionOffer): PvpActiveActionFactRow[] {
  const baseRows: Array<{ label: string; value: string | null }> = [
    { label: 'Akcja', value: offer.actionKindLabel },
    { label: 'Stan', value: offer.phaseLabel },
    { label: 'Cel', value: offer.targetHeroDisplayName },
    { label: 'Adres celu', value: offer.targetAddressLabel },
    { label: 'Twój adres', value: offer.attackerAddressLabel },
  ];

  if (isPvpReturnRuntimePhase(offer)) {
    return presentFactRows([
      ...baseRows,
      { label: 'Dostępne od', value: timeDisplay(returnAvailabilityAt(offer)) },
    ]);
  }

  if (offer.isTravelPhase || isPvpSpyActivePhase(offer)) {
    return presentFactRows([
      ...baseRows,
      { label: 'Dotarcie', value: timeDisplay(offer.phaseEndsAt ?? offer.arrivesAt ?? offer.availableAt) },
    ]);
  }

  if (offer.isManualWindow) {
    return presentFactRows([
      ...baseRows,
      { label: 'Decyzja do', value: timeDisplay(pvpActiveActionManualDecisionDeadlineAt(offer)) },
    ]);
  }

  return presentFactRows([
    ...baseRows,
    { label: 'Dostępne od', value: timeDisplay(offer.availableAt ?? offer.phaseEndsAt) },
  ]);
}

export function pvpActiveActionHelperText(offer: ActivePvpActionOffer): string {
  if (isPvpReturnRuntimePhase(offer)) {
    return 'Bohater wraca do posiadłości. Kolejna blokująca akcja będzie dostępna po zakończeniu powrotu.';
  }

  if (offer.actionKind === 'attack') {
    return offer.isManualWindow
      ? 'Atak dotarł do celu. Decyzję manual/auto podejmiesz w module walki.'
      : 'Aktywna faza ataku jest obsługiwana przez stan gry.';
  }

  return offer.isManualWindow
    ? 'Szpiegowanie dotarło do celu. Wynik należy do przepływu raportów/wyników poza tym ekranem.'
    : 'Aktywna faza szpiegowania jest obsługiwana przez stan gry.';
}

export function pvpActiveActionPendingHelperText(offer: ActivePvpActionOffer): string {
  if (isPvpReturnRuntimePhase(offer)) {
    return 'Bohater wraca do posiadłości.';
  }

  return offer.actionKind === 'attack'
    ? 'Atak jest w drodze do wskazanej posiadłości.'
    : 'Szpieg jest w drodze do wskazanej posiadłości.';
}

export function pvpActiveActionErrorMessage(error: unknown, fallback: string): string {
  const status = error && typeof error === 'object'
    ? (error as { status?: unknown }).status
    : null;
  const message = error instanceof Error ? error.message : null;

  if (status === 400 || message === 'Bad Request') {
    return fallback;
  }

  if (message) {
    return message;
  }

  return fallback;
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
