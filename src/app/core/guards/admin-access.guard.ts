import { inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivateChildFn,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { catchError, from, map, of, switchMap } from 'rxjs';
import { ActiveServer } from '../services/server/active-server';
import { Auth } from '../services/auth/auth';
import { AuthState } from '../services/auth/auth-state';
import { resolveStaffAccessPolicy } from '../utils/staff-access-policy';

const ADMIN_ACCESS_DENIED_URL = '/admin/access-denied';

export const requireAdminAccessGuard: CanActivateChildFn = (
  route: ActivatedRouteSnapshot,
  _state: RouterStateSnapshot,
) => {
  if (route.routeConfig?.path === 'access-denied') {
    return true;
  }

  const auth = inject(Auth);
  const authState = inject(AuthState);
  const activeServer = inject(ActiveServer);
  const router = inject(Router);

  return from(auth.initialize()).pipe(
    switchMap(() => {
      if (!authState.user()) {
        return of(adminAccessDenied(router));
      }

      return activeServer.loadAccessibleServers().pipe(
        map(() => {
          const policy = resolveStaffAccessPolicy({
            access: activeServer.access(),
            selectedServer: activeServer.selectedServer(),
          });

          return policy.canAccessAdminShell ? true : adminAccessDenied(router);
        }),
      );
    }),
    catchError(() => of(adminAccessDenied(router))),
  );
};

function adminAccessDenied(router: Router): UrlTree {
  return router.parseUrl(ADMIN_ACCESS_DENIED_URL);
}
