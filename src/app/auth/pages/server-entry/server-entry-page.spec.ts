import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import {
  AccountEntryHeroContext,
  StartFlowEntryDecision,
  StartFlowHeroOption,
  StartFlowServerAvailability,
} from '../../../core/domain/start-flow/start-flow.model';
import { ActiveHeroState } from '../../../core/interfaces/hero/active-hero.interface';
import { SelectedGameServer } from '../../../core/interfaces/server/active-server.interface';
import { Auth } from '../../../core/services/auth/auth';
import { StartFlowEntryState } from '../../../core/services/start-flow/start-flow-entry.state';
import { ServerEntryPage } from './server-entry-page';

describe('ServerEntryPage', () => {
  it('renders server-entry page content without owning account shell chrome', () => {
    const fixture = createFixture(stateStub());

    fixture.detectChanges();

    const text = textContent(fixture);

    expect(text).toContain('Wybierz bohatera');
    expect(text).toContain('Wejdź do gry');
    expect(text).not.toContain('Mythsworn');
    expect(text).not.toContain('Zalogowano jako');
    expect(text).not.toContain('Ustawienia konta');
    expect(text).not.toContain('Powiadomienia');
    expect(text).not.toContain('Wyloguj');
    expect(text).not.toContain('Account settings');
    expect(text).not.toContain('Notifications');
    expect(text).not.toContain('Planned');
    expect(text).not.toContain('Step 1 of 4');
    expect(text).not.toContain('Armory');
    expect(text).not.toContain('World State');
    expect(fixture.nativeElement.classList).toContain('d-block');
    expect((fixture.nativeElement as HTMLElement).style.width).toBe('100%');
  });

  it('renders compact sandbox hero context selector with default/current context', () => {
    const state = stateStub({
      selectedHeroOptions: [
        heroOption({ heroId: 'hero-1', heroName: 'First' }),
        heroOption({ heroId: 'hero-2', heroName: 'Second' }),
      ],
      defaultHero: heroOption({ heroId: 'hero-1', heroName: 'First' }),
      activeHero: heroOption({ heroId: 'hero-2', heroName: 'Second' }),
      canCreateSandboxHero: true,
      showHeroSelection: true,
    });
    const fixture = createFixture(state);

    fixture.detectChanges();

    const text = textContent(fixture);

    expect(text).toContain('Wybierz bohatera');
    expect(text).toContain('Postacie na tym sandboxie');
    expect(text).toContain('Aktywny bohater');
    expect(text).toContain('Second');
    expect(text).toContain('Wybrany bohater');
    expect(text).toContain('Panel bohatera');
    expect(text).toContain('Wejdź do panelu bohatera');
    expect(text).toContain('Serwer / bohater');
    expect(text).toContain('Poziom');
    expect(text).toContain('4');
    expect(text).toContain('Adres');
    expect(text).toContain('A-3');
    expect(text).toContain('Zasada wejścia');
    expect(text).not.toContain('Wybrany kontekst');
    expect(text).not.toContain('Status bohatera');
    expect(text).not.toContain('Utworzono:');
    expect(text).not.toContain('2026-05-02T10:00:00Z');
    expect(fixture.componentInstance.selectedHeroContextControl).toBeTruthy();
    expect(fixture.componentInstance.heroContextForm.controls.selectedContextId)
      .toBe(fixture.componentInstance.selectedHeroContextControl);
    expect(fixture.debugElement.queryAll(By.css('p-select')).length).toBe(1);
  });

  it('does not own account shell logout chrome on server entry', () => {
    const fixture = createFixture(stateStub());

    fixture.detectChanges();

    expect(textContent(fixture)).not.toContain('Wyloguj');
  });

  it('selects another DB-returned sandbox hero from the compact switcher', () => {
    const state = stateStub({
      selectedHeroOptions: [
        heroOption({ heroId: 'hero-1', heroName: 'First' }),
        heroOption({ heroId: 'hero-2', heroName: 'Second' }),
      ],
      defaultHero: heroOption({ heroId: 'hero-1', heroName: 'First' }),
      activeHero: heroOption({ heroId: 'hero-1', heroName: 'First' }),
      canCreateSandboxHero: true,
      showHeroSelection: true,
    });
    const fixture = createFixture(state);

    fixture.detectChanges();
    fixture.componentInstance.selectedHeroContextControl.setValue('server-1:hero-2');
    fixture.detectChanges();

    expect(textContent(fixture)).toContain('Second');
    expect(state.enterHeroContext).not.toHaveBeenCalled();

    const useHeroButton = fixture.debugElement
      .queryAll(By.css('p-button'))
      .find((entry) => entry.componentInstance.label === 'Wejdź do gry');

    useHeroButton?.triggerEventHandler('onClick', {});

    expect(state.enterHeroContext).toHaveBeenCalledOnceWith('server-1', 'hero-2');
  });

  it('does not render one switch button per sandbox hero', () => {
    const state = stateStub({
      selectedHeroOptions: Array.from({ length: 25 }, (_, index) =>
        heroOption({
          heroId: `hero-${index + 1}`,
          heroName: `Hero ${index + 1}`,
          createdAt: `2026-05-${String(index + 1).padStart(2, '0')}T10:00:00Z`,
        }),
      ),
      defaultHero: heroOption({ heroId: 'hero-1', heroName: 'Hero 1' }),
      activeHero: heroOption({ heroId: 'hero-1', heroName: 'Hero 1' }),
      canCreateSandboxHero: true,
      showHeroSelection: true,
    });
    const fixture = createFixture(state);

    fixture.detectChanges();

    const switchButtons = fixture.debugElement
      .queryAll(By.css('p-button'))
      .filter((entry) => entry.componentInstance.label === 'Przełącz');

    expect(fixture.debugElement.queryAll(By.css('p-select')).length).toBe(1);
    expect(switchButtons.length).toBe(0);
  });

  it('does not render sandbox hero switcher or creation action for standard server state', () => {
    const state = stateStub({
      availability: availability({ isSandbox: false, isStandard: true }),
      canCreateSandboxHero: false,
      showHeroSelection: false,
    });
    const fixture = createFixture(state);

    fixture.detectChanges();

    const text = textContent(fixture);

    expect(text).not.toContain('Postacie na tym sandboxie');
    expect(text).not.toContain('Stwórz bohatera na tym sandboxie');
  });

  it('renders only the enter action for standard server state with an existing hero', () => {
    const state = stateStub({
      availability: availability({
        isSandbox: false,
        isStandard: true,
        canEnterGame: true,
        canCreateHero: false,
        nextAction: 'dashboard',
        userHeroCount: 1,
        defaultHeroName: 'Ariadne',
      }),
      activeHero: heroOption({ heroId: 'hero-1', heroName: 'Ariadne' }),
      canCreateSandboxHero: false,
      selectedDecision: {
        action: 'dashboard',
        route: '/hero/dashboard',
        message: null,
      },
    });
    const fixture = createFixture(state);

    fixture.detectChanges();

    const text = textContent(fixture);

    expect(text).toContain('Wejdź do gry');
    expect(text).not.toContain('Stwórz bohatera na tym sandboxie');
  });

  it('does not render sandbox creation link when DB blocks sandbox creation', () => {
    const state = stateStub({
      availability: availability({
        canCreateHero: false,
        blockReason: 'Sandbox creation is blocked.',
      }),
      selectedHeroOptions: [
        heroOption({ heroId: 'hero-1', heroName: 'First' }),
        heroOption({ heroId: 'hero-2', heroName: 'Second' }),
      ],
      canCreateSandboxHero: false,
      showHeroSelection: true,
    });
    const fixture = createFixture(state);

    fixture.detectChanges();

    const text = textContent(fixture);

    expect(text).toContain('Nie masz jeszcze bohatera gotowego do gry.');
    expect(text).not.toContain('Stwórz bohatera na tym sandboxie');
  });

  it('renders an empty state with a route CTA to create-character when no playable hero context exists', () => {
    const state = stateStub({
      availability: availability({
        isSandbox: false,
        isStandard: true,
        canEnterGame: false,
        canCreateHero: true,
        nextAction: 'create_hero',
        userHeroCount: 0,
        districtACapacity: 100,
        districtAOccupied: 96,
        districtAFree: 4,
      }),
      selectedDecision: {
        action: 'create_hero',
        route: '/auth/create-character',
        message: null,
      },
      accountEntryHeroContexts: [],
    });
    const fixture = createFixture(state);

    fixture.detectChanges();

    const text = textContent(fixture);
    const createButton = fixture.debugElement
      .queryAll(By.css('p-button'))
      .find((entry) => entry.componentInstance.label === 'Stwórz bohatera');

    expect(text).toContain('Nie masz jeszcze bohatera gotowego do gry.');
    expect(text).toContain('Stwórz bohatera');
    expect(createButton?.attributes['routerLink']).toBe('/auth/create-character');
    expect(text).not.toContain('Tworzenie bohatera');
    expect(text).not.toContain('Dzielnica A: 4 / 100 wolnych adresów');
    expect(text).not.toContain('Dołącz do świata');
    expect(text).not.toContain('Origin');
  });

  it('shows existing hero context as the entry path without mixing in creation form', () => {
    const state = stateStub({
      availability: availability({
        isSandbox: false,
        isStandard: true,
        canEnterGame: true,
        canCreateHero: false,
        nextAction: 'dashboard',
        userHeroCount: 1,
        defaultHeroName: 'Ariadne',
        defaultHeroId: 'hero-1',
      }),
      activeHero: heroOption({ heroId: 'hero-1', heroName: 'Ariadne' }),
      selectedDecision: {
        action: 'dashboard',
        route: '/hero/dashboard',
        message: null,
      },
    });
    const fixture = createFixture(state);

    fixture.detectChanges();

    const text = textContent(fixture);

    expect(text).toContain('Wejdź do gry');
    expect(text).toContain('Wybrany bohater');
    expect(text).toContain('Ariadne');
    expect(text).toContain('Serwer');
    expect(text).toContain('Bohater');
    expect(text).not.toContain('Hero name');
  });

  it('does not duplicate existing hero context when sandbox hero switcher is visible', () => {
    const state = stateStub({
      selectedHeroOptions: [
        heroOption({ heroId: 'hero-1', heroName: 'First' }),
        heroOption({ heroId: 'hero-2', heroName: 'Second' }),
      ],
      defaultHero: heroOption({ heroId: 'hero-1', heroName: 'First' }),
      activeHero: heroOption({ heroId: 'hero-2', heroName: 'Second' }),
      canCreateSandboxHero: true,
      showHeroSelection: true,
    });
    const fixture = createFixture(state);

    fixture.detectChanges();

    const text = textContent(fixture);

    expect(text).toContain('Postacie na tym sandboxie');
    expect(text).not.toContain('Istniejący bohater:');
  });
});

function createFixture(
  state: Partial<StartFlowEntryState>,
): ComponentFixture<ServerEntryPage> {
  TestBed.configureTestingModule({
    imports: [ServerEntryPage],
    providers: [
      provideRouter([]),
      {
        provide: Auth,
        useValue: jasmine.createSpyObj<Auth>('Auth', {
          logout: of(void 0),
        }),
      },
    ],
  });
  TestBed.overrideComponent(ServerEntryPage, {
    remove: { providers: [StartFlowEntryState] },
    add: { providers: [{ provide: StartFlowEntryState, useValue: state }] },
  });

  return TestBed.createComponent(ServerEntryPage);
}

function stateStub(input: {
  availability?: StartFlowServerAvailability;
  selectedHeroOptions?: StartFlowHeroOption[];
  defaultHero?: StartFlowHeroOption | null;
  activeHero?: StartFlowHeroOption | null;
  canCreateSandboxHero?: boolean;
  showHeroSelection?: boolean;
  selectedDecision?: StartFlowEntryDecision;
  accountEntryHeroContexts?: AccountEntryHeroContext[];
} = {}): Partial<StartFlowEntryState> {
  const selectedServer = server();
  const baseAvailability = input.availability ?? availability();
  const heroOptions = input.selectedHeroOptions ?? baseAvailability.heroes;
  const defaultHero = input.defaultHero ?? heroOptions[0] ?? null;
  const currentAvailability = {
    ...baseAvailability,
    heroes: heroOptions,
    userHeroCount: heroOptions.length || baseAvailability.userHeroCount,
    defaultHeroId: defaultHero?.heroId ?? baseAvailability.defaultHeroId,
    defaultHeroName: defaultHero?.heroName ?? baseAvailability.defaultHeroName,
  };
  const contextHeroOptions = heroOptions.length > 0
    ? heroOptions
    : currentAvailability.defaultHeroId && currentAvailability.defaultHeroName
      ? [heroOption({
          heroId: currentAvailability.defaultHeroId,
          heroName: currentAvailability.defaultHeroName,
        })]
      : [];

  const stub = {
    activeHeroState: signal<ActiveHeroState | null>(
      input.activeHero ? activeHeroStateFromOption(input.activeHero, selectedServer) : null,
    ).asReadonly(),
    activeHeroOption: signal(input.activeHero ?? null).asReadonly(),
    accountEntryHeroContexts: signal<AccountEntryHeroContext[]>(
      input.accountEntryHeroContexts ??
        contextHeroOptions.map((hero) => heroContextFromOption(hero, currentAvailability)),
    ).asReadonly(),
    blocker: signal<string | null>(null).asReadonly(),
    canCreateSandboxHero: signal(input.canCreateSandboxHero ?? false).asReadonly(),
    enterSelectedServer: jasmine.createSpy('enterSelectedServer'),
    error: signal<string | null>(null).asReadonly(),
    isLoading: signal(false).asReadonly(),
    isTransitioning: signal(false).asReadonly(),
    load: jasmine.createSpy('load'),
    selectedDefaultHeroOption: signal(input.defaultHero ?? null).asReadonly(),
    selectedDecision: signal(input.selectedDecision ?? {
      action: currentAvailability.nextAction === 'create_hero'
        ? 'create_hero'
        : currentAvailability.canEnterGame
          ? 'dashboard'
          : 'blocked',
      route: currentAvailability.nextAction === 'create_hero'
        ? '/auth/create-character'
        : currentAvailability.canEnterGame
          ? '/hero/dashboard'
          : null,
      message: currentAvailability.blockReason,
    } as StartFlowEntryDecision).asReadonly(),
    selectedHeroOptions: signal(input.selectedHeroOptions ?? []).asReadonly(),
    selectedServer: signal<SelectedGameServer | null>(selectedServer).asReadonly(),
    selectHero: jasmine.createSpy('selectHero'),
    enterHeroContext: jasmine.createSpy('enterHeroContext'),
    selectServer: jasmine.createSpy('selectServer'),
    serverAvailability: (candidate: SelectedGameServer) =>
      candidate.id === currentAvailability.serverId ? currentAvailability : null,
    servers: signal<SelectedGameServer[]>([selectedServer]).asReadonly(),
    showHeroSelection: signal(input.showHeroSelection ?? false).asReadonly(),
    visibleAvailability: signal<StartFlowServerAvailability[]>([currentAvailability]).asReadonly(),
  };

  return stub as unknown as Partial<StartFlowEntryState>;
}

function server(): SelectedGameServer {
  return {
    id: 'server-1',
    key: 'sandbox',
    name: 'Sandbox',
    kind: 'sandbox',
    status: 'live',
    description: 'Sandbox server.',
    launchedAt: null,
    archivedAt: null,
    membershipStatus: 'active',
    membership: null,
    staffRole: null,
    canManage: false,
    canUseAsSandbox: true,
  };
}

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
    canEnterGame: true,
    canCreateHero: true,
    nextAction: 'hero_selection',
    blockReason: null,
    userHeroCount: 2,
    defaultHeroId: 'hero-1',
    defaultHeroName: 'First',
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

function heroOption(
  patch: Partial<StartFlowHeroOption> = {},
): StartFlowHeroOption {
  return {
    heroId: 'hero-1',
    heroName: 'First',
    createdAt: '2026-05-01T10:00:00Z',
    ...patch,
  };
}

function heroContextFromOption(
  hero: StartFlowHeroOption,
  availability: StartFlowServerAvailability,
): AccountEntryHeroContext {
  return {
    heroId: hero.heroId,
    serverId: availability.serverId,
    serverKey: availability.serverKey,
    serverName: availability.serverName,
    heroName: hero.heroName,
    heroLevel: 4,
    estateId: 'estate-1',
    districtCode: 'A',
    addressNumber: 3,
    address: 'A-3',
    addressLabel: 'A-3',
    createdAt: hero.createdAt,
    routeNextAction: 'hero_dashboard',
  };
}

function activeHeroStateFromOption(
  hero: StartFlowHeroOption,
  selectedServer: SelectedGameServer,
): ActiveHeroState {
  return {
    userId: 'user-1',
    serverId: selectedServer.id,
    heroId: hero.heroId,
    server: selectedServer,
    hero: {
      id: hero.heroId,
      name: hero.heroName,
      serverId: selectedServer.id,
    } as ActiveHeroState['hero'],
    heroRow: {
      id: hero.heroId,
      name: hero.heroName,
      server_id: selectedServer.id,
    } as ActiveHeroState['heroRow'],
  };
}

function textContent(fixture: ComponentFixture<ServerEntryPage>): string {
  return (fixture.nativeElement as HTMLElement).textContent ?? '';
}
