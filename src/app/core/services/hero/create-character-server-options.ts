import { StartFlowServerAvailability } from '../../domain/start-flow/start-flow.model';
import {
  CREATE_CHARACTER_AVAILABILITY_MISSING,
  CREATE_CHARACTER_CREATION_AVAILABLE,
  CREATE_CHARACTER_CREATION_UNAVAILABLE,
  CREATE_CHARACTER_CHOOSE_SERVER_AVAILABILITY,
  CREATE_CHARACTER_ENTRY_ROUTE_LABELS,
  CREATE_CHARACTER_ENTRY_ROUTE_CONTRACT_GAP,
  CREATE_CHARACTER_MISSING_BLOCKER,
  CREATE_CHARACTER_NO_FREE_SLOTS,
  DISTRICT_A_FULL_BLOCKER,
  STANDARD_SINGLE_HERO_BLOCKER,
} from '../../constants/hero/create-character-server-options.constants';
import {
  CreateCharacterCreationGate,
  CreateCharacterServerBadge,
  CreateCharacterServerDetails,
  CreateCharacterServerOption,
  CreateCharacterSummaryRow,
} from '../../interfaces/hero/create-character-server-options.interface';

const EXISTING_HERO_ENTRY_ACTIONS = new Set(['dashboard', 'game_shell', 'enter_game']);

export function mapCreateCharacterServerOptions(
  availability: StartFlowServerAvailability[],
): CreateCharacterServerOption[] {
  return availability
    .filter((entry) => entry.isVisible)
    .map((entry) => ({
      id: entry.serverId,
      label: `${entry.serverName} - ${optionStatus(entry)}`,
      availability: entry,
    }));
}

export function resolveCreateCharacterCreationGate(
  availability: StartFlowServerAvailability | null,
  availabilityError: string | null = null,
  requireAvailability = true,
): CreateCharacterCreationGate {
  if (availabilityError) {
    return gate(availability, false, availabilityError);
  }

  if (!availability) {
    const blocker = requireAvailability ? CREATE_CHARACTER_AVAILABILITY_MISSING : null;
    return gate(null, false, blocker, blocker ?? CREATE_CHARACTER_CHOOSE_SERVER_AVAILABILITY);
  }

  const blocker = creationBlockerForAvailability(availability);
  return gate(availability, !blocker, blocker, blocker ?? CREATE_CHARACTER_CREATION_AVAILABLE);
}

export function mapCreateCharacterServerDetails(
  availability: StartFlowServerAvailability | null,
  gateState: CreateCharacterCreationGate,
): CreateCharacterServerDetails | null {
  if (!availability) {
    return null;
  }

  return {
    title: availability.serverName,
    description: availability.description,
    badges: serverBadges(availability, gateState),
    summaryRows: mainSummaryRows(availability, gateState),
    sideRows: sideRows(availability),
    footerTitle: 'Przejdź do tworzenia bohatera',
    footerCopy: `Wybrany świat: ${availability.serverName}.`,
    ctaLabel: 'Przejdź do tworzenia bohatera',
    canContinue: gateState.canCreate,
    disabledReason: gateState.blocker,
  };
}

export function canCreateHeroOnServer(
  availability: StartFlowServerAvailability | null,
): boolean {
  return resolveCreateCharacterCreationGate(availability, null, false).canCreate;
}

export function creationBlockerForAvailability(
  availability: StartFlowServerAvailability,
): string | null {
  if (availability.blockReason) {
    return availability.blockReason;
  }

  if (hasUsableDistrictCapacity(availability) && isDistrictAFull(availability)) {
    return DISTRICT_A_FULL_BLOCKER;
  }

  if (availability.isStandard && hasExistingStandardHero(availability)) {
    return STANDARD_SINGLE_HERO_BLOCKER;
  }

  return availability.canCreateHero ? null : CREATE_CHARACTER_MISSING_BLOCKER;
}

export function creationEligibilityReason(availability: StartFlowServerAvailability): string {
  return creationBlockerForAvailability(availability) ?? CREATE_CHARACTER_CREATION_AVAILABLE;
}

function optionStatus(availability: StartFlowServerAvailability): string {
  if (canCreateHeroOnServer(availability)) {
    return 'tworzenie dostępne';
  }

  if (availability.blockReason || isDistrictAFull(availability)) {
    return 'tworzenie zablokowane';
  }

  return availability.canEnterGame || availability.userHeroCount > 0
    ? 'masz już bohatera'
    : 'niedostępny';
}

export function serverKindLabel(availability: StartFlowServerAvailability): string {
  if (availability.isSandbox) {
    return 'Sandbox/test';
  }

  return availability.isStandard ? 'Standardowy' : availability.serverKind;
}

export function heroStateLabel(availability: StartFlowServerAvailability): string {
  if (availability.defaultHeroName) {
    return availability.defaultHeroName;
  }

  return availability.userHeroCount > 0
    ? `Postacie na świecie: ${availability.userHeroCount}`
    : 'Brak bohatera na tym świecie';
}

export function creationEligibilityLabel(
  availability: StartFlowServerAvailability,
  gateState = resolveCreateCharacterCreationGate(availability, null, false),
): string {
  if (hasUsableDistrictCapacity(availability) && isDistrictAFull(availability)) {
    return CREATE_CHARACTER_NO_FREE_SLOTS;
  }

  return gateState.canCreate
    ? CREATE_CHARACTER_CREATION_AVAILABLE
    : CREATE_CHARACTER_CREATION_UNAVAILABLE;
}

export function entryRouteDecisionLabel(availability: StartFlowServerAvailability): string {
  return CREATE_CHARACTER_ENTRY_ROUTE_LABELS[availability.nextAction] ??
    CREATE_CHARACTER_ENTRY_ROUTE_CONTRACT_GAP;
}

function gate(
  availability: StartFlowServerAvailability | null,
  canCreate: boolean,
  blocker: string | null,
  reason = blocker ?? CREATE_CHARACTER_CREATION_AVAILABLE,
): CreateCharacterCreationGate {
  return { availability, canCreate, blocker, reason };
}

function serverBadges(
  availability: StartFlowServerAvailability,
  gateState: CreateCharacterCreationGate,
): CreateCharacterServerBadge[] {
  return [
    { label: serverKindLabel(availability), tone: 'muted' },
    { label: availability.serverStatus, tone: 'muted' },
    {
      label: creationEligibilityLabel(availability, gateState),
      tone: gateState.canCreate ? 'success' : 'danger',
    },
  ];
}

function sideRows(availability: StartFlowServerAvailability): CreateCharacterSummaryRow[] {
  return [
    { label: 'Następny krok', value: 'Tworzenie bohatera' },
    { label: 'Domyślne wejście', value: entryRouteDecisionLabel(availability) },
    { label: 'Typ świata', value: serverKindLabel(availability) },
    { label: 'Twój bohater', value: heroStateLabel(availability), multiline: true },
  ];
}

function mainSummaryRows(
  availability: StartFlowServerAvailability,
  gateState: CreateCharacterCreationGate,
): CreateCharacterSummaryRow[] {
  return [
    ...districtCapacityRows(availability),
    creationRow(availability, gateState),
    { label: 'Status świata', value: availability.serverStatus },
    ...blockerRows(gateState),
  ];
}

function districtCapacityRows(
  availability: StartFlowServerAvailability,
): CreateCharacterSummaryRow[] {
  if (!hasUsableDistrictCapacity(availability)) {
    return [];
  }

  return [{
    label: 'Dzielnica A',
    value: `${Math.max(availability.districtAFree, 0)} / ${availability.districtACapacity} wolnych posiadłości startowych`,
    tone: isDistrictAFull(availability) ? 'danger' : 'default',
    primary: true,
  }];
}

function creationRow(
  availability: StartFlowServerAvailability,
  gateState: CreateCharacterCreationGate,
): CreateCharacterSummaryRow {
  const full = hasUsableDistrictCapacity(availability) && isDistrictAFull(availability);

  return {
    label: 'Tworzenie',
    value: full ? CREATE_CHARACTER_NO_FREE_SLOTS : gateState.reason,
    tone: gateState.canCreate ? 'default' : 'danger',
    multiline: !!gateState.blocker && !full,
    primary: true,
  };
}

function blockerRows(gateState: CreateCharacterCreationGate): CreateCharacterSummaryRow[] {
  return gateState.blocker
    ? [{
        label: 'Powód',
        value: gateState.blocker,
        tone: 'danger',
        multiline: true,
      }]
    : [];
}

function isDistrictAFull(availability: StartFlowServerAvailability): boolean {
  return availability.isDistrictAFull || availability.districtAFree <= 0;
}

function hasUsableDistrictCapacity(availability: StartFlowServerAvailability): boolean {
  return Number.isFinite(availability.districtACapacity) &&
    Number.isFinite(availability.districtAFree) &&
    Number.isFinite(availability.districtAOccupied) &&
    availability.districtACapacity > 0;
}

function hasExistingStandardHero(availability: StartFlowServerAvailability): boolean {
  return availability.userHeroCount > 0 ||
    !!availability.defaultHeroId ||
    !!availability.defaultHeroName ||
    (availability.canEnterGame && isExistingHeroEntryAction(availability.nextAction));
}

function isExistingHeroEntryAction(nextAction: string): boolean {
  return EXISTING_HERO_ENTRY_ACTIONS.has(nextAction);
}
