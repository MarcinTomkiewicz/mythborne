import {
  AccountEntryHeroContext,
  StartFlowServerAvailability,
  isStartFlowDashboardEntryAction,
} from '../../../core/domain/start-flow/start-flow.model';

export interface ServerEntryHeroContextOption {
  id: string;
  label: string;
  serverId: string;
  serverName: string;
  serverKindLabel: string;
  serverStatusLabel: string;
  description: string;
  heroId: string;
  heroName: string;
  heroLevel: number;
  addressLabel: string | null;
  heroContextLabel: string;
  nextRouteLabel: string | null;
  isActive: boolean;
  isDefault: boolean;
  availability: StartFlowServerAvailability;
}

export function mapServerEntryHeroContextOptions(
  availability: readonly StartFlowServerAvailability[],
  heroContexts: readonly AccountEntryHeroContext[],
  activeHeroId: string | null,
): ServerEntryHeroContextOption[] {
  const availabilityByServerId = new Map(
    availability
      .filter((entry) => entry.isVisible && entry.canEnterGame && !entry.blockReason)
      .map((entry) => [entry.serverId, entry]),
  );

  return heroContexts.flatMap((context) => {
    if (!isStartFlowDashboardEntryAction(context.routeNextAction)) {
      return [];
    }

    const entry = availabilityByServerId.get(context.serverId);

    if (!entry) {
      return [];
    }

    return [{
      id: `${context.serverId}:${context.heroId}`,
      label: `${context.serverName} / ${context.heroName}`,
      serverId: context.serverId,
      serverName: context.serverName,
      serverKindLabel: serverKindLabel(entry),
      serverStatusLabel: serverStatusLabel(entry.serverStatus),
      description: entry.description,
      heroId: context.heroId,
      heroName: context.heroName,
      heroLevel: context.heroLevel,
      addressLabel: context.addressLabel ?? context.address,
      heroContextLabel: heroContextLabel(entry, context.heroId, activeHeroId),
      nextRouteLabel: isStartFlowDashboardEntryAction(context.routeNextAction)
        ? 'Panel bohatera'
        : null,
      isActive: activeHeroId === context.heroId,
      isDefault: entry.defaultHeroId === context.heroId,
      availability: entry,
    }];
  });
}

function heroContextLabel(
  availability: StartFlowServerAvailability,
  heroId: string,
  activeHeroId: string | null,
): string {
  const isActive = activeHeroId === heroId;
  const isDefault = availability.defaultHeroId === heroId;

  if (isActive && isDefault) {
    return 'Aktywny i domyślny bohater';
  }

  if (isActive) {
    return 'Aktualnie aktywny bohater';
  }

  if (isDefault) {
    return 'Domyślny bohater na tym świecie';
  }

  if (availability.isSandbox && availability.userHeroCount > 1) {
    return 'Dostępny bohater sandboxowy';
  }

  return 'Gotowy do gry';
}

function serverKindLabel(availability: StartFlowServerAvailability): string {
  if (availability.isSandbox) {
    return 'Sandbox';
  }

  if (availability.isStandard) {
    return 'Świat standardowy';
  }

  return availability.serverKind;
}

function serverStatusLabel(status: string): string {
  switch (status) {
    case 'live':
      return 'aktywny';
    case 'scheduled':
      return 'zaplanowany';
    case 'archived':
      return 'archiwalny';
    default:
      return status;
  }
}
