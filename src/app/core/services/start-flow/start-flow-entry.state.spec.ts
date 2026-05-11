import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, Subject, throwError } from 'rxjs';
import {
  StartFlowServerAvailability,
} from '../../domain/start-flow/start-flow.model';
import { ActiveHeroState } from '../../interfaces/hero/active-hero.interface';
import { SelectedGameServer } from '../../interfaces/server/active-server.interface';
import { ActiveHero } from '../hero/active-hero';
import { ActiveServer } from '../server/active-server';
import { StartFlow } from './start-flow';
import {
  resolveStartFlowEntryDecision,
  StartFlowEntryState,
} from './start-flow-entry.state';

describe('StartFlowEntryState', () => {
  let activeHeroState: ReturnType<typeof signal<ActiveHeroState | null>>;
  let selectedServer: ReturnType<typeof signal<SelectedGameServer | null>>;
  let servers: ReturnType<typeof signal<SelectedGameServer[]>>;
  let activeHero: jasmine.SpyObj<ActiveHero>;
  let activeServer: jasmine.SpyObj<ActiveServer>;
  let router: jasmine.SpyObj<Router>;
  let startFlow: jasmine.SpyObj<StartFlow>;
  let state: StartFlowEntryState;

  beforeEach(() => {
    activeHeroState = signal<ActiveHeroState | null>(null);
    selectedServer = signal<SelectedGameServer | null>(server());
    servers = signal<SelectedGameServer[]>([server()]);
    activeHero = jasmine.createSpyObj<ActiveHero>('ActiveHero', [
      'clear',
      'loadActiveHero',
      'selectHero',
    ]);
    activeServer = jasmine.createSpyObj<ActiveServer>('ActiveServer', [
      'loadAccessibleServers',
      'selectServer',
    ], {
      selectedServer: selectedServer.asReadonly(),
      servers: servers.asReadonly(),
    });
    router = jasmine.createSpyObj<Router>('Router', ['navigateByUrl']);
    startFlow = jasmine.createSpyObj<StartFlow>('StartFlow', ['getServerAvailability']);

    activeHero.loadActiveHero.and.returnValue(of(null));
    activeHero.selectHero.and.returnValue(of(activeContext('hero-1')));
    activeServer.loadAccessibleServers.and.returnValue(of([server()]));
    activeServer.selectServer.and.callFake((serverId: string) => {
      const next = servers().find((entry) => entry.id === serverId) ?? null;
      selectedServer.set(next);
      return !!next;
    });
    startFlow.getServerAvailability.and.returnValue(
      of([availability({ canCreateHero: true, nextAction: 'create_hero' })]),
    );

    TestBed.configureTestingModule({
      providers: [
        StartFlowEntryState,
        { provide: ActiveHero, useValue: activeHero },
        { provide: ActiveServer, useValue: activeServer },
        { provide: Router, useValue: router },
        { provide: StartFlow, useValue: startFlow },
      ],
    });

    Object.defineProperty(activeHero, 'state', {
      get: () => activeHeroState.asReadonly(),
    });

    state = TestBed.inject(StartFlowEntryState);
  });

  it('routes a selected standard server without hero to character creation only when DB allows it', () => {
    state.load();

    state.enterSelectedServer();

    expect(activeServer.loadAccessibleServers).toHaveBeenCalled();
    expect(startFlow.getServerAvailability).toHaveBeenCalled();
    expect(router.navigateByUrl).toHaveBeenCalledOnceWith('/auth/create-character');
  });

  it('shows the DB blocker for a full standard server instead of routing to creation', () => {
    startFlow.getServerAvailability.and.returnValue(of([
      availability({
        canCreateHero: false,
        canEnterGame: false,
        isDistrictAFull: true,
        blockReason: 'District A is full.',
        nextAction: 'blocked',
      }),
    ]));

    state.load();
    state.enterSelectedServer();

    expect(router.navigateByUrl).not.toHaveBeenCalled();
    expect(state.blocker()).toBe('District A is full.');
  });

  it('routes an existing active hero to dashboard instead of stat allocation or creation', () => {
    activeHeroState.set(activeContext('hero-1'));
    activeHero.loadActiveHero.and.returnValue(of(activeContext('hero-1')));
    startFlow.getServerAvailability.and.returnValue(of([
      availability({
        canEnterGame: true,
        canCreateHero: false,
        nextAction: 'dashboard',
        defaultHeroId: 'hero-1',
      }),
    ]));

    state.load();
    state.enterSelectedServer();

    expect(router.navigateByUrl).toHaveBeenCalledOnceWith('/hero/dashboard');
    expect(router.navigateByUrl).not.toHaveBeenCalledWith('/hero/attributes');
    expect(router.navigateByUrl).not.toHaveBeenCalledWith('/auth/create-character');
  });

  it('uses sandbox hero selection for multi-hero sandbox servers', () => {
    selectedServer.set(server({ kind: 'sandbox', key: 'sandbox' }));
    servers.set([server({ kind: 'sandbox', key: 'sandbox' })]);
    startFlow.getServerAvailability.and.returnValue(of([
      availability({
        isStandard: false,
        isSandbox: true,
        canEnterGame: true,
        canCreateHero: false,
        nextAction: 'hero_selection',
        userHeroCount: 2,
        defaultHeroId: 'hero-1',
        heroes: [
          { heroId: 'hero-1', heroName: 'First', createdAt: '2026-05-01T10:00:00Z' },
          { heroId: 'hero-2', heroName: 'Second', createdAt: '2026-05-02T10:00:00Z' },
        ],
      }),
    ]));
    activeHero.selectHero.and.returnValue(of(activeContext('hero-2')));

    state.load();

    expect(state.showHeroSelection()).toBeTrue();

    state.selectHero('hero-2');

    expect(activeHero.selectHero).toHaveBeenCalledOnceWith('hero-2');
    expect(router.navigateByUrl).toHaveBeenCalledOnceWith('/hero/dashboard');
  });

  it('continues to dashboard from sandbox hero selection when the current hero is active', () => {
    selectedServer.set(server({ kind: 'sandbox', key: 'sandbox' }));
    servers.set([server({ kind: 'sandbox', key: 'sandbox' })]);
    activeHeroState.set(activeContext('hero-2'));
    startFlow.getServerAvailability.and.returnValue(of([
      availability({
        isStandard: false,
        isSandbox: true,
        canEnterGame: true,
        canCreateHero: true,
        nextAction: 'hero_selection',
        userHeroCount: 2,
        heroes: [
          { heroId: 'hero-1', heroName: 'First', createdAt: '2026-05-01T10:00:00Z' },
          { heroId: 'hero-2', heroName: 'Second', createdAt: '2026-05-02T10:00:00Z' },
        ],
      }),
    ]));

    state.load();
    state.enterSelectedServer();

    expect(router.navigateByUrl).toHaveBeenCalledOnceWith('/hero/dashboard');
    expect(activeHero.selectHero).not.toHaveBeenCalled();
  });

  it('selects the DB default hero before continuing from sandbox hero selection without active hero context', () => {
    selectedServer.set(server({ kind: 'sandbox', key: 'sandbox' }));
    servers.set([server({ kind: 'sandbox', key: 'sandbox' })]);
    activeHero.selectHero.and.returnValue(of(activeContext('hero-2')));
    startFlow.getServerAvailability.and.returnValue(of([
      availability({
        isStandard: false,
        isSandbox: true,
        canEnterGame: true,
        canCreateHero: true,
        nextAction: 'hero_selection',
        userHeroCount: 2,
        defaultHeroId: 'hero-2',
        heroes: [
          { heroId: 'hero-1', heroName: 'First', createdAt: '2026-05-01T10:00:00Z' },
          { heroId: 'hero-2', heroName: 'Second', createdAt: '2026-05-02T10:00:00Z' },
        ],
      }),
    ]));

    state.load();
    state.enterSelectedServer();

    expect(activeHero.selectHero).toHaveBeenCalledOnceWith('hero-2');
    expect(router.navigateByUrl).toHaveBeenCalledOnceWith('/hero/dashboard');
  });

  it('does not invent a default sandbox hero when DB omits defaultHeroId', () => {
    selectedServer.set(server({ kind: 'sandbox', key: 'sandbox' }));
    servers.set([server({ kind: 'sandbox', key: 'sandbox' })]);
    startFlow.getServerAvailability.and.returnValue(of([
      availability({
        isStandard: false,
        isSandbox: true,
        canEnterGame: true,
        canCreateHero: true,
        nextAction: 'hero_selection',
        userHeroCount: 2,
        defaultHeroId: null,
        heroes: [
          { heroId: 'hero-1', heroName: 'First', createdAt: '2026-05-01T10:00:00Z' },
          { heroId: 'hero-2', heroName: 'Second', createdAt: '2026-05-02T10:00:00Z' },
        ],
      }),
    ]));

    state.load();
    state.enterSelectedServer();

    expect(state.selectedDefaultHeroOption()).toBeNull();
    expect(activeHero.selectHero).not.toHaveBeenCalled();
    expect(router.navigateByUrl).not.toHaveBeenCalled();
    expect(state.blocker()).toBe('Select a sandbox hero before entering the game.');
  });

  it('uses mapped sandbox hero option order and exposes default/current context', () => {
    selectedServer.set(server({ kind: 'sandbox', key: 'sandbox' }));
    servers.set([server({ kind: 'sandbox', key: 'sandbox' })]);
    activeHeroState.set(activeContext('hero-2'));
    startFlow.getServerAvailability.and.returnValue(of([
      availability({
        isStandard: false,
        isSandbox: true,
        canEnterGame: true,
        canCreateHero: true,
        nextAction: 'hero_selection',
        userHeroCount: 2,
        defaultHeroId: 'hero-2',
        heroes: [
          { heroId: 'hero-1', heroName: 'First', createdAt: '2026-05-01T10:00:00Z' },
          { heroId: 'hero-2', heroName: 'Second', createdAt: '2026-05-02T10:00:00Z' },
        ],
      }),
    ]));

    state.load();
    state.enterSelectedServer();

    expect(state.showHeroSelection()).toBeTrue();
    expect(state.selectedHeroOptions().map((hero) => hero.heroId))
      .toEqual(['hero-1', 'hero-2']);
    expect(state.selectedDefaultHeroOption()?.heroId).toBe('hero-2');
    expect(state.activeHeroOption()?.heroId).toBe('hero-2');
    expect(state.canCreateSandboxHero()).toBeTrue();
  });

  it('exposes sandbox hero selection from DB-returned heroes when sandbox entry is otherwise allowed', () => {
    selectedServer.set(server({ kind: 'sandbox', key: 'sandbox' }));
    servers.set([server({ kind: 'sandbox', key: 'sandbox' })]);
    activeHeroState.set(activeContext('hero-1'));
    startFlow.getServerAvailability.and.returnValue(of([
      availability({
        isStandard: false,
        isSandbox: true,
        canEnterGame: true,
        canCreateHero: true,
        nextAction: 'dashboard',
        userHeroCount: 2,
        heroes: [
          { heroId: 'hero-1', heroName: 'First', createdAt: '2026-05-01T10:00:00Z' },
          { heroId: 'hero-2', heroName: 'Second', createdAt: '2026-05-02T10:00:00Z' },
        ],
      }),
    ]));
    activeHero.selectHero.and.returnValue(of(activeContext('hero-2')));

    state.load();

    expect(state.showHeroSelection()).toBeTrue();

    state.selectHero('hero-2');

    expect(activeHero.selectHero).toHaveBeenCalledOnceWith('hero-2');
    expect(router.navigateByUrl).toHaveBeenCalledOnceWith('/hero/dashboard');
  });

  it('does not expose hero selection or sandbox creation affordances for standard servers', () => {
    startFlow.getServerAvailability.and.returnValue(of([
      availability({
        isStandard: true,
        isSandbox: false,
        canEnterGame: true,
        canCreateHero: false,
        nextAction: 'dashboard',
        userHeroCount: 1,
        heroes: [
          { heroId: 'hero-1', heroName: 'Standard Hero', createdAt: '2026-05-01T10:00:00Z' },
        ],
      }),
    ]));
    activeHeroState.set(activeContext('hero-1'));

    state.load();

    expect(state.showHeroSelection()).toBeFalse();
    expect(state.canCreateSandboxHero()).toBeFalse();
  });

  it('does not expose sandbox creation when DB returns a blocker', () => {
    selectedServer.set(server({ kind: 'sandbox', key: 'sandbox' }));
    servers.set([server({ kind: 'sandbox', key: 'sandbox' })]);
    startFlow.getServerAvailability.and.returnValue(of([
      availability({
        isStandard: false,
        isSandbox: true,
        canEnterGame: true,
        canCreateHero: true,
        blockReason: 'Sandbox creation is blocked.',
        nextAction: 'hero_selection',
        userHeroCount: 2,
        heroes: [
          { heroId: 'hero-1', heroName: 'First', createdAt: '2026-05-01T10:00:00Z' },
        ],
      }),
    ]));

    state.load();

    expect(state.canCreateSandboxHero()).toBeFalse();
  });

  it('ignores stale hero selection responses after selected server changes', () => {
    startFlow.getServerAvailability.and.returnValue(of([
      availability({
        isStandard: false,
        isSandbox: true,
        canEnterGame: true,
        canCreateHero: false,
        nextAction: 'hero_selection',
        userHeroCount: 2,
        heroes: [
          { heroId: 'hero-1', heroName: 'First', createdAt: '2026-05-01T10:00:00Z' },
          { heroId: 'hero-2', heroName: 'Second', createdAt: '2026-05-02T10:00:00Z' },
        ],
      }),
    ]));
    const firstSelection = new Subject<ActiveHeroState>();
    activeHero.selectHero.and.returnValue(firstSelection.asObservable());

    state.load();
    state.selectHero('hero-1');
    selectedServer.set(server({ id: 'server-2' }));

    firstSelection.next(activeContext('hero-1', 'server-1'));
    firstSelection.complete();

    expect(router.navigateByUrl).not.toHaveBeenCalled();
  });

  it('does not expose sandbox hero selection when DB blocks entry', () => {
    selectedServer.set(server({ kind: 'sandbox', key: 'sandbox' }));
    servers.set([server({ kind: 'sandbox', key: 'sandbox' })]);
    startFlow.getServerAvailability.and.returnValue(of([
      availability({
        isStandard: false,
        isSandbox: true,
        canEnterGame: false,
        canCreateHero: false,
        nextAction: 'blocked',
        blockReason: 'Sandbox access is blocked.',
        userHeroCount: 2,
        heroes: [
          { heroId: 'hero-1', heroName: 'First', createdAt: '2026-05-01T10:00:00Z' },
          { heroId: 'hero-2', heroName: 'Second', createdAt: '2026-05-02T10:00:00Z' },
        ],
      }),
    ]));

    state.load();
    state.enterSelectedServer();
    state.selectHero('hero-1');

    expect(state.showHeroSelection()).toBeFalse();
    expect(router.navigateByUrl).not.toHaveBeenCalled();
    expect(activeHero.selectHero).not.toHaveBeenCalled();
    expect(state.blocker()).toBe('Sandbox access is blocked.');
  });

  it('blocks selecting a hero outside the current DB-returned hero options', () => {
    selectedServer.set(server({ kind: 'sandbox', key: 'sandbox' }));
    servers.set([server({ kind: 'sandbox', key: 'sandbox' })]);
    startFlow.getServerAvailability.and.returnValue(of([
      availability({
        isStandard: false,
        isSandbox: true,
        canEnterGame: true,
        nextAction: 'hero_selection',
        userHeroCount: 2,
        heroes: [
          { heroId: 'hero-1', heroName: 'First', createdAt: '2026-05-01T10:00:00Z' },
        ],
      }),
    ]));

    state.load();
    state.selectHero('hero-2');

    expect(activeHero.selectHero).not.toHaveBeenCalled();
    expect(state.blocker()).toBe(
      'Selected hero is not available in the current start-flow state.',
    );
  });

  it('does not silently continue when active hero load fails during entry load', () => {
    activeHero.loadActiveHero.and.returnValue(
      throwError(() => new Error('Active hero load failed.')),
    );

    state.load();
    state.enterSelectedServer();

    expect(state.error()).toBe('Active hero load failed.');
    expect(state.availability()).toEqual([]);
    expect(router.navigateByUrl).not.toHaveBeenCalled();
  });
});

describe('resolveStartFlowEntryDecision', () => {
  it('blocks missing availability instead of guessing a route', () => {
    expect(resolveStartFlowEntryDecision(null, null)).toEqual({
      action: 'blocked',
      route: null,
      message: 'Select a server before entering the game.',
    });
  });

  it('blocks unsupported DB entry actions instead of guessing dashboard or creation', () => {
    expect(
      resolveStartFlowEntryDecision(
        availability({
          canCreateHero: true,
          nextAction: 'unexpected_action',
        }),
        null,
      ),
    ).toEqual({
      action: 'blocked',
      route: null,
      message: 'Unsupported start-flow entry action returned by DB: unexpected_action.',
    });
  });

  it('does not route dashboard from default hero until active hero context is loaded', () => {
    expect(
      resolveStartFlowEntryDecision(
        availability({
          canEnterGame: true,
          defaultHeroId: 'hero-1',
          nextAction: 'dashboard',
        }),
        null,
      ),
    ).toEqual({
      action: 'blocked',
      route: null,
      message: 'Active hero context must be loaded before entering the game.',
    });
  });
});

function server(
  patch: Partial<SelectedGameServer> = {},
): SelectedGameServer {
  return {
    id: 'server-1',
    key: 'standard',
    name: 'Standard',
    kind: 'standard',
    status: 'live',
    description: 'Main server.',
    launchedAt: null,
    archivedAt: null,
    membershipStatus: 'active',
    membership: null,
    staffRole: null,
    canManage: false,
    canUseAsSandbox: false,
    ...patch,
  };
}

function availability(
  patch: Partial<StartFlowServerAvailability> = {},
): StartFlowServerAvailability {
  return {
    serverId: 'server-1',
    serverKey: 'standard',
    serverName: 'Standard',
    serverKind: 'standard',
    serverStatus: 'live',
    description: 'Main server.',
    membershipStatus: 'active',
    isVisible: true,
    isStandard: true,
    isSandbox: false,
    isStaffContext: false,
    canEnterGame: false,
    canCreateHero: false,
    nextAction: 'blocked',
    blockReason: null,
    userHeroCount: 0,
    defaultHeroId: null,
    defaultHeroName: null,
    isServerFull: false,
    isDistrictAFull: false,
    districtACapacity: 100,
    districtAOccupied: 0,
    districtAFree: 100,
    heroesJson: [],
    eligibilityJson: {},
    heroes: [],
    ...patch,
  };
}

function activeContext(
  heroId: string,
  serverId = 'server-1',
): ActiveHeroState {
  return {
    userId: 'user-1',
    serverId,
    heroId,
    server: server({ id: serverId }),
    hero: { id: heroId, name: 'Hero', serverId } as ActiveHeroState['hero'],
    heroRow: { id: heroId, server_id: serverId } as ActiveHeroState['heroRow'],
  };
}
