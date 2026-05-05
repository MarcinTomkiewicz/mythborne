import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal, WritableSignal } from '@angular/core';
import { provideRouter } from '@angular/router';
import { GameSidebar } from './game-sidebar';
import {
  GlobalRoleKey,
  ServerStaffRole,
} from '../../../core/enums/active-server.enum';
import {
  SelectedGameServer,
  ServerAccessState,
} from '../../../core/interfaces/server/active-server.interface';
import { AuthState } from '../../../core/services/auth/auth-state';
import { ActiveServer } from '../../../core/services/server/active-server';

describe('GameSidebar', () => {
  let component: GameSidebar;
  let fixture: ComponentFixture<GameSidebar>;
  let authState: AuthState;
  let accessState: WritableSignal<ServerAccessState>;
  let selectedServer: WritableSignal<SelectedGameServer | null>;

  beforeEach(() => {
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
      ],
    });

    authState = TestBed.inject(AuthState);
    authState.setUser({ id: 'user-1', email: 'player@example.com' } as never);
    authState.setHero({ name: 'Hero', level: 1 } as never);

    fixture = TestBed.createComponent(GameSidebar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('shows gameplay links for normal logged-in players', () => {
    const urls = component.menuItems().map((item) => item.url);

    expect(urls).toContain('/hero/dashboard');
    expect(urls).toContain('/game/combat');
    expect(urls).toContain('/game/auction');
  });

  it('shows the vicinity navigation entry without introducing neighborhood labels', () => {
    const items = component.menuItems();

    expect(items).toEqual(jasmine.arrayContaining([
      jasmine.objectContaining({
        title: 'Vicinity',
        url: '/game/vicinity',
      }),
    ]));
    expect(items).toEqual(jasmine.arrayContaining([
      jasmine.objectContaining({
        title: 'Mansion',
        url: '/game/mansion',
      }),
    ]));
    expect(items.some((item) => item.title === 'Neighborhood')).toBeFalse();
    expect(items.some((item) => item.url === '/game/neighborhood')).toBeFalse();
  });

  it('hides the admin link for normal logged-in players', () => {
    const urls = component.menuItems().map((item) => item.url);

    expect(urls).not.toContain('/admin');
  });

  it('shows the admin link for global admins', () => {
    accessState.set(
      createAccess({
        globalRoleKey: GlobalRoleKey.Admin,
        isAdmin: true,
      }),
    );

    const urls = component.menuItems().map((item) => item.url);

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

    const urls = component.menuItems().map((item) => item.url);

    expect(urls).not.toContain('/hero/dashboard');
    expect(urls).not.toContain('/game/combat');
    expect(urls).not.toContain('/game/vicinity');
    expect(urls).not.toContain('/game/auction');
    expect(urls).toContain('/admin');
  });
});

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
