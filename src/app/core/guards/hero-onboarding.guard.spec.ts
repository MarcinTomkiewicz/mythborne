import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, UrlTree, provideRouter } from '@angular/router';
import { firstValueFrom, isObservable, of } from 'rxjs';
import { StartFlowServerAvailability } from '../domain/start-flow/start-flow.model';
import { SelectedGameServer } from '../interfaces/server/active-server.interface';
import { Auth } from '../services/auth/auth';
import { AuthState } from '../services/auth/auth-state';
import { ActiveServer } from '../services/server/active-server';
import { StartFlow } from '../services/start-flow/start-flow';
import { createCharacterEntryGuard } from './hero-onboarding.guard';

describe('createCharacterEntryGuard', () => {
  let activeServer: jasmine.SpyObj<ActiveServer>;
  let auth: jasmine.SpyObj<Auth>;
  let authState: AuthState;
  let router: Router;
  let selectedServer: ReturnType<typeof signal<SelectedGameServer | null>>;
  let startFlow: jasmine.SpyObj<StartFlow>;

  beforeEach(() => {
    selectedServer = signal<SelectedGameServer | null>(server({ kind: 'sandbox' }));
    activeServer = jasmine.createSpyObj<ActiveServer>('ActiveServer', [
      'loadAccessibleServers',
    ], {
      selectedServer: selectedServer.asReadonly(),
    });
    auth = jasmine.createSpyObj<Auth>('Auth', ['initialize']);
    startFlow = jasmine.createSpyObj<StartFlow>('StartFlow', ['getServerAvailability']);

    auth.initialize.and.returnValue(of(void 0));
    activeServer.loadAccessibleServers.and.returnValue(of([server({ kind: 'sandbox' })]));
    startFlow.getServerAvailability.and.returnValue(of([
      availability({
        isSandbox: true,
        isStandard: false,
        canCreateHero: true,
        nextAction: 'hero_selection',
      }),
    ]));

    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        AuthState,
        { provide: ActiveServer, useValue: activeServer },
        { provide: Auth, useValue: auth },
        { provide: StartFlow, useValue: startFlow },
      ],
    });

    authState = TestBed.inject(AuthState);
    authState.setUser({ id: 'user-1', email: 'hero@example.com' } as ReturnType<AuthState['user']>);
    authState.setHero({ id: 'hero-1', name: 'Hero' } as ReturnType<AuthState['hero']>);
    router = TestBed.inject(Router);
  });

  it('allows sandbox hero creation entry for an active hero when DB canCreateHero is true', async () => {
    const result = await runGuard();

    expect(result).toBeTrue();
    expect(activeServer.loadAccessibleServers).toHaveBeenCalled();
    expect(startFlow.getServerAvailability).toHaveBeenCalled();
  });

  it('keeps standard server one-hero entry redirected to server entry', async () => {
    selectedServer.set(server({ kind: 'standard' }));
    activeServer.loadAccessibleServers.and.returnValue(of([server({ kind: 'standard' })]));
    startFlow.getServerAvailability.and.returnValue(of([
      availability({
        isSandbox: false,
        isStandard: true,
        canCreateHero: false,
        canEnterGame: true,
        nextAction: 'dashboard',
      }),
    ]));

    const result = await runGuard();

    expect(serializeUrl(result)).toBe('/auth/server-entry');
  });

  it('redirects blocked sandbox creation entry back to server entry', async () => {
    startFlow.getServerAvailability.and.returnValue(of([
      availability({
        isSandbox: true,
        isStandard: false,
        canCreateHero: false,
        canEnterGame: true,
        blockReason: 'Sandbox creation is blocked.',
        nextAction: 'hero_selection',
      }),
    ]));

    const result = await runGuard();

    expect(serializeUrl(result)).toBe('/auth/server-entry');
  });

  async function runGuard(): Promise<unknown> {
    const result = TestBed.runInInjectionContext(() =>
      createCharacterEntryGuard({} as never, {} as never),
    );

    return isObservable(result) ? firstValueFrom(result) : result;
  }

  function serializeUrl(result: unknown): string {
    if (result === true || result === false) {
      return String(result);
    }

    return router.serializeUrl(result as UrlTree);
  }
});

function server(
  patch: Partial<SelectedGameServer> = {},
): SelectedGameServer {
  return {
    id: 'server-1',
    key: patch.kind === 'standard' ? 'standard' : 'sandbox',
    name: patch.kind === 'standard' ? 'Standard' : 'Sandbox',
    kind: 'sandbox',
    status: 'live',
    description: 'Server.',
    launchedAt: null,
    archivedAt: null,
    membershipStatus: 'active',
    membership: null,
    staffRole: null,
    canManage: false,
    canUseAsSandbox: patch.kind !== 'standard',
    ...patch,
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
    canCreateHero: false,
    nextAction: 'blocked',
    blockReason: null,
    userHeroCount: 1,
    defaultHeroId: 'hero-1',
    defaultHeroName: 'Hero',
    isServerFull: false,
    isDistrictAFull: false,
    districtACapacity: 100,
    districtAOccupied: 1,
    districtAFree: 99,
    heroesJson: [],
    eligibilityJson: {},
    heroes: [{ heroId: 'hero-1', heroName: 'Hero', createdAt: '2026-05-01T10:00:00Z' }],
    ...patch,
  };
}
