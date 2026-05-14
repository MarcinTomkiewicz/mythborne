import { StartFlowServerAvailability } from '../../domain/start-flow/start-flow.model';
import {
  entryRouteDecisionLabel,
  mapCreateCharacterServerDetails,
  resolveCreateCharacterCreationGate,
} from './create-character-server-options';

describe('create-character server options', () => {
  it('maps standard free District A capacity as primary server detail', () => {
    const entry = availability({
      isStandard: true,
      isSandbox: false,
      isStaffContext: false,
      districtACapacity: 5000,
      districtAFree: 4615,
      districtAOccupied: 385,
    });
    const gate = resolveCreateCharacterCreationGate(entry);
    const details = mapCreateCharacterServerDetails(entry, gate);

    expect(gate.canCreate).toBeTrue();
    expect(details?.summaryRows).toContain(jasmine.objectContaining({
      label: 'Dzielnica A',
      value: '4615 / 5000 wolnych posiadłości startowych',
      primary: true,
    }));
  });

  it('blocks standard full District A capacity and returns the exact reason', () => {
    const entry = availability({
      isStandard: true,
      isSandbox: false,
      isStaffContext: false,
      canCreateHero: false,
      blockReason: 'Brak wolnych posiadłości startowych w District A.',
      isDistrictAFull: true,
      districtACapacity: 5000,
      districtAFree: 0,
      districtAOccupied: 5000,
    });
    const gate = resolveCreateCharacterCreationGate(entry);
    const details = mapCreateCharacterServerDetails(entry, gate);

    expect(gate.canCreate).toBeFalse();
    expect(gate.blocker).toBe('Brak wolnych posiadłości startowych w District A.');
    expect(details?.summaryRows).toContain(jasmine.objectContaining({
      label: 'Dzielnica A',
      value: '0 / 5000 wolnych posiadłości startowych',
      tone: 'danger',
      primary: true,
    }));
  });

  it('blocks inconsistent standard payload with no free District A slots', () => {
    const entry = availability({
      isStandard: true,
      isSandbox: false,
      isStaffContext: false,
      canCreateHero: true,
      blockReason: null,
      isDistrictAFull: true,
      districtACapacity: 5000,
      districtAFree: 0,
      districtAOccupied: 5000,
    });

    const gate = resolveCreateCharacterCreationGate(entry);

    expect(gate.canCreate).toBeFalse();
    expect(gate.blocker).toBe('Brak wolnych posiadłości startowych w District A.');
  });

  it('blocks standard existing-hero entry actions without depending on display labels', () => {
    const entryActions = ['dashboard', 'game_shell', 'enter_game'];

    for (const nextAction of entryActions) {
      const entry = availability({
        isStandard: true,
        isSandbox: false,
        isStaffContext: false,
        canCreateHero: true,
        canEnterGame: true,
        nextAction,
        userHeroCount: 0,
        defaultHeroId: null,
        defaultHeroName: null,
        districtACapacity: 5000,
        districtAFree: 4615,
        districtAOccupied: 385,
      });

      const gate = resolveCreateCharacterCreationGate(entry);

      expect(gate.canCreate).toBeFalse();
      expect(gate.blocker).toBe(
        'Na świecie standardowym możesz mieć tylko jednego bohatera. Wejdź do gry istniejącym bohaterem.',
      );
    }
  });

  it('blocks standard existing-hero state when backend marks creation unavailable without a blocker', () => {
    const entry = availability({
      isStandard: true,
      isSandbox: false,
      isStaffContext: false,
      canCreateHero: false,
      canEnterGame: true,
      nextAction: 'dashboard',
      userHeroCount: 1,
      defaultHeroName: 'Ariadne',
      districtACapacity: 5000,
      districtAFree: 4615,
      districtAOccupied: 385,
    });

    const gate = resolveCreateCharacterCreationGate(entry);

    expect(gate.canCreate).toBeFalse();
    expect(gate.blocker).toBe(
      'Na świecie standardowym możesz mieć tylko jednego bohatera. Wejdź do gry istniejącym bohaterem.',
    );
  });

  it('allows sandbox creation when DB allows it even if entry route points to an existing hero', () => {
    const entry = availability({
      canCreateHero: true,
      canEnterGame: true,
      nextAction: 'enter_game',
      userHeroCount: 1,
      defaultHeroName: 'Vlad',
    });

    const gate = resolveCreateCharacterCreationGate(entry);
    const details = mapCreateCharacterServerDetails(entry, gate);

    expect(gate.canCreate).toBeTrue();
    expect(gate.blocker).toBeNull();
    expect(entryRouteDecisionLabel(entry)).toBe('istniejący bohater');
    expect(details?.sideRows).toContain(jasmine.objectContaining({
      label: 'Twój bohater',
      value: 'Vlad',
    }));
  });

  it('uses backend blocker for sandbox when DB blocks creation', () => {
    const entry = availability({
      canCreateHero: false,
      blockReason: 'Sandbox creation is blocked by backend.',
      nextAction: 'enter_game',
      userHeroCount: 1,
      defaultHeroName: 'Vlad',
    });

    const gate = resolveCreateCharacterCreationGate(entry);

    expect(gate.canCreate).toBeFalse();
    expect(gate.blocker).toBe('Sandbox creation is blocked by backend.');
  });
});

function availability(
  patch: Partial<StartFlowServerAvailability> = {},
): StartFlowServerAvailability {
  return {
    serverId: 'server-1',
    serverKey: 'sandbox',
    serverName: 'Sandbox',
    serverKind: 'sandbox',
    serverStatus: 'live',
    description: 'Sandbox server.',
    membershipStatus: 'active',
    isVisible: true,
    isStandard: false,
    isSandbox: true,
    isStaffContext: true,
    canEnterGame: false,
    canCreateHero: true,
    nextAction: 'create_hero',
    blockReason: null,
    userHeroCount: 0,
    defaultHeroId: null,
    defaultHeroName: null,
    isServerFull: false,
    isDistrictAFull: false,
    districtACapacity: 100,
    districtAOccupied: 2,
    districtAFree: 98,
    heroesJson: [],
    eligibilityJson: {},
    heroes: [],
    ...patch,
  };
}
