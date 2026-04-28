import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  GuardResult,
  provideRouter,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { firstValueFrom, isObservable, of } from 'rxjs';
import { GlobalRoleKey, ServerStaffRole } from '../enums/active-server.enum';
import {
  SelectedGameServer,
  ServerAccessState,
} from '../interfaces/server/active-server.interface';
import { Auth } from '../services/auth/auth';
import { AuthState } from '../services/auth/auth-state';
import { ActiveServer } from '../services/server/active-server';
import { requireAdminAccessGuard } from './admin-access.guard';

describe('requireAdminAccessGuard', () => {
  let authState: AuthState;
  let router: Router;
  let activeServerState: {
    access: ServerAccessState;
    selectedServer: SelectedGameServer | null;
  };

  beforeEach(() => {
    activeServerState = {
      access: createAccess(),
      selectedServer: createServer(),
    };

    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        {
          provide: Auth,
          useValue: {
            initialize: () => of(void 0),
          },
        },
        {
          provide: ActiveServer,
          useValue: {
            loadAccessibleServers: () => of([activeServerState.selectedServer]),
            access: () => activeServerState.access,
            selectedServer: () => activeServerState.selectedServer,
          },
        },
      ],
    });

    authState = TestBed.inject(AuthState);
    router = TestBed.inject(Router);
  });

  it('allows the access denied route without requiring admin access', async () => {
    const result = await runGuard('access-denied');

    expect(result).toBeTrue();
  });

  it('redirects a normal player away from admin routes', async () => {
    authState.setUser({ id: 'user-1', email: 'player@example.com' } as never);

    const result = await runGuard('');

    expect(result instanceof UrlTree).toBeTrue();
    expect(router.serializeUrl(result as UrlTree)).toBe('/admin/access-denied');
  });

  it('redirects users without an active session away from admin routes', async () => {
    authState.setUser(null);

    const result = await runGuard('');

    expect(result instanceof UrlTree).toBeTrue();
    expect(router.serializeUrl(result as UrlTree)).toBe('/admin/access-denied');
  });

  it('allows global admins into the admin shell without selected server context', async () => {
    authState.setUser({ id: 'user-1', email: 'admin@example.com' } as never);
    activeServerState.access = createAccess({
      globalRoleKey: GlobalRoleKey.Admin,
      isAdmin: true,
    });
    activeServerState.selectedServer = null;

    const result = await runGuard('');

    expect(result).toBeTrue();
  });

  it('allows selected-server moderators into the admin shell', async () => {
    authState.setUser({ id: 'user-1', email: 'moderator@example.com' } as never);
    activeServerState.access = createAccess({
      serverStaffRole: ServerStaffRole.Moderator,
      isServerStaff: true,
    });
    activeServerState.selectedServer = createServer({
      staffRole: ServerStaffRole.Moderator,
    });

    const result = await runGuard('');

    expect(result).toBeTrue();
  });

  async function runGuard(path: string): Promise<GuardResult> {
    const route = {
      routeConfig: { path },
    } as ActivatedRouteSnapshot;
    const state = { url: `/admin/${path}` } as RouterStateSnapshot;
    const result = TestBed.runInInjectionContext(() =>
      requireAdminAccessGuard(route, state),
    );

    return isObservable(result) ? firstValueFrom(result) : result;
  }
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
