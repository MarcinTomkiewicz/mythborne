import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal, WritableSignal } from '@angular/core';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { GameSidebar } from './game-sidebar';
import {
  GlobalRoleKey,
  ServerStaffRole,
} from '../../../core/enums/active-server.enum';
import {
  SelectedGameServer,
  ServerAccessState,
} from '../../../core/interfaces/server/active-server.interface';
import { Auth } from '../../../core/services/auth/auth';
import { AuthState } from '../../../core/services/auth/auth-state';
import { Backend } from '../../../core/services/backend/backend';
import { ActiveHero } from '../../../core/services/hero/active-hero';
import { ActiveServer } from '../../../core/services/server/active-server';

describe('GameSidebar', () => {
  let component: GameSidebar;
  let fixture: ComponentFixture<GameSidebar>;
  let authState: AuthState;
  let backend: jasmine.SpyObj<Backend>;
  let activeHeroState: WritableSignal<unknown>;
  let accessState: WritableSignal<ServerAccessState>;
  let selectedServer: WritableSignal<SelectedGameServer | null>;

  beforeEach(() => {
    backend = jasmine.createSpyObj<Backend>('Backend', ['rpc']);
    backend.rpc.and.returnValue(of([prestigeRow()]));
    activeHeroState = signal({
      userId: 'user-1',
      serverId: 'server-1',
      heroId: 'hero-1',
      server: createServer(),
      hero: { id: 'hero-1', name: 'Hero', level: 1 },
      heroRow: { id: 'hero-1', name: 'Hero', level: 1 },
    });
    accessState = signal(createAccess());
    selectedServer = signal(createServer());

    TestBed.configureTestingModule({
      imports: [GameSidebar],
      providers: [
        provideRouter([]),
        {
          provide: ActiveServer,
          useValue: {
            access: accessState.asReadonly(),
            selectedServer: selectedServer.asReadonly(),
          },
        },
        {
          provide: ActiveHero,
          useValue: {
            state: activeHeroState.asReadonly(),
          },
        },
        { provide: Backend, useValue: backend },
        {
          provide: Auth,
          useValue: jasmine.createSpyObj<Auth>('Auth', {
            logout: of(void 0),
          }),
        },
      ],
    });

    authState = TestBed.inject(AuthState);
    authState.setUser({ id: 'user-1', email: 'player@example.com' } as never);
    authState.setHero({ id: 'hero-1', name: 'Hero', level: 1 } as never);

    fixture = TestBed.createComponent(GameSidebar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('shows gameplay links for normal logged-in players', () => {
    const urls = navItems(component).map((item) => item.route);

    expect(urls).toContain('/hero/dashboard');
    expect(urls).toContain('/game/guild');
    expect(urls).toContain('/game/auction');
  });

  it('renders selected server status and DB prestige summary', () => {
    const text = textContent(fixture);

    expect(text).toContain('Athens');
    expect(text).toContain('Aktywny');
    expect(text).toContain('Zeugitai');
    expect(backend.rpc).toHaveBeenCalledWith(
      'get_hero_prestige_public_summary',
      { p_hero_id: 'hero-1' },
    );
  });

  it('clears prestige summary when selected server context is missing', async () => {
    component.prestigeSummary.set(prestigeRow());

    selectedServer.set(null);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const text = textContent(fixture);

    expect(component.prestigeSummary()).toBeNull();
    expect(text).toContain('Prestiż niedostępny');
    expect(text).not.toContain('Zeugitai');
  });

  it('ignores prestige rows returned for a stale server context', async () => {
    backend.rpc.and.returnValue(of([prestigeRow({ server_id: 'server-1' })]));

    selectedServer.set(createServer({ id: 'server-2', name: 'Sparta' }));
    activeHeroState.set({
      userId: 'user-1',
      serverId: 'server-2',
      heroId: 'hero-1',
      server: createServer({ id: 'server-2', name: 'Sparta' }),
      hero: { id: 'hero-1', name: 'Hero', level: 1 },
      heroRow: { id: 'hero-1', name: 'Hero', level: 1 },
    });
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const text = textContent(fixture);

    expect(component.prestigeSummary()).toBeNull();
    expect(text).toContain('Sparta');
    expect(text).toContain('Prestiż niedostępny');
    expect(text).not.toContain('Zeugitai');
  });

  it('renders a visible logout action in the authenticated shell', () => {
    expect(textContent(fixture)).toContain('Wyloguj');
  });

  it('shows the vicinity navigation entry without introducing neighborhood labels', () => {
    const items = navItems(component);

    expect(items).toEqual(jasmine.arrayContaining([
      jasmine.objectContaining({
        label: 'Okolica',
        route: '/game/vicinity',
      }),
    ]));
    expect(items).toEqual(jasmine.arrayContaining([
      jasmine.objectContaining({
        label: 'Posiadłość',
        route: '/game/mansion',
      }),
    ]));
    expect(items.some((item) => item.label === 'Neighborhood')).toBeFalse();
    expect(items.some((item) => item.route === '/game/neighborhood')).toBeFalse();
  });

  it('hides the admin link for normal logged-in players', () => {
    const urls = navItems(component).map((item) => item.route);

    expect(urls).not.toContain('/admin');
  });

  it('shows the admin link for global admins', () => {
    accessState.set(
      createAccess({
        globalRoleKey: GlobalRoleKey.Admin,
        isAdmin: true,
      }),
    );

    const urls = navItems(component).map((item) => item.route);

    expect(urls).toContain('/admin');
  });

  it('hides gameplay links for staff-blocked standard server context', () => {
    accessState.set(
      createAccess({
        serverStaffRole: ServerStaffRole.Moderator,
        isServerStaff: true,
      }),
    );
    selectedServer.set(createServer({ staffRole: ServerStaffRole.Moderator }));

    const urls = navItems(component).map((item) => item.route);

    expect(urls).not.toContain('/hero/dashboard');
    expect(urls).not.toContain('/game/guild');
    expect(urls).not.toContain('/game/vicinity');
    expect(urls).not.toContain('/game/auction');
    expect(urls).toContain('/admin');
  });
});

function textContent(fixture: ComponentFixture<GameSidebar>): string {
  return (fixture.nativeElement as HTMLElement).textContent ?? '';
}

function navItems(component: GameSidebar) {
  return component.menuGroups().flatMap((group) => group.items);
}

function createAccess(
  overrides: Partial<ServerAccessState> = {},
): ServerAccessState {
  return {
    userId: 'user-1',
    globalRoleKey: null,
    membershipStatus: 'active',
    membership: null,
    serverStaffRole: null,
    isAdmin: false,
    isOperator: false,
    isTester: false,
    isModerator: false,
    isServerStaff: false,
    isMembershipActive: true,
    isMembershipSuspended: false,
    isMembershipBanned: false,
    isMembershipBlocked: false,
    canAccessSandbox: false,
    canManageSelectedServer: false,
    ...overrides,
  };
}

function createServer(
  overrides: Partial<SelectedGameServer> = {},
): SelectedGameServer {
  return {
    id: 'server-1',
    key: 'athens',
    name: 'Athens',
    kind: 'standard',
    status: 'live',
    description: null,
    launchedAt: null,
    archivedAt: null,
    membershipStatus: 'active',
    membership: null,
    staffRole: null,
    canManage: false,
    canUseAsSandbox: false,
    ...overrides,
  };
}

function prestigeRow(overrides: Record<string, unknown> = {}) {
  return {
    district_code: 'A',
    helper_text: 'Current prestige rank.',
    hero_id: 'hero-1',
    player_label: 'Zeugitai',
    rank_name: 'Zeugitai',
    rank_number: 2,
    rank_uuid: 'rank-2',
    server_id: 'server-1',
    updated_at: '2026-05-08T00:00:00.000Z',
    ...overrides,
  };
}
