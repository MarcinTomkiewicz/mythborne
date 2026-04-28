import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal, WritableSignal } from '@angular/core';
import { provideRouter } from '@angular/router';
import { GameSidebar } from './game-sidebar';
import { ServerStaffRole } from '../../../core/enums/active-server.enum';
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
