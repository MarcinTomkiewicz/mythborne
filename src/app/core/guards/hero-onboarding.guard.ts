import { inject } from '@angular/core';
import {
  CanActivateChildFn,
  CanActivateFn,
  Router,
  UrlTree,
} from '@angular/router';
import { map, from } from 'rxjs';
import { AuthState } from '../services/auth/auth-state';
import { Auth } from '../services/auth/auth';

function resolveOnboardedHeroRedirect(
  authState: AuthState,
  router: Router
): true | UrlTree {
  if (!authState.user()) {
    return router.parseUrl('/public');
  }

  if (!authState.hero()) {
    return router.parseUrl('/auth/server-entry');
  }

  return true;
}

export const requireOnboardedHeroGuard: CanActivateChildFn = () => {
  const auth = inject(Auth);
  const authState = inject(AuthState);
  const router = inject(Router);

  return from(auth.initialize()).pipe(
    map(() => resolveOnboardedHeroRedirect(authState, router))
  );
};

export const createCharacterEntryGuard: CanActivateFn = () => {
  const auth = inject(Auth);
  const authState = inject(AuthState);
  const router = inject(Router);

  return from(auth.initialize()).pipe(
    map(() => {
      if (authState.user() && authState.hero()) {
        return router.parseUrl('/auth/server-entry');
      }

      return true;
    })
  );
};

export const serverEntryGuard: CanActivateFn = () => {
  const auth = inject(Auth);
  const authState = inject(AuthState);
  const router = inject(Router);

  return from(auth.initialize()).pipe(
    map(() => {
      if (!authState.user()) {
        return router.parseUrl('/public');
      }

      return true;
    })
  );
};

export const authEntryGuard: CanActivateFn = () => {
  const auth = inject(Auth);
  const authState = inject(AuthState);
  const router = inject(Router);

  return from(auth.initialize()).pipe(
    map(() => {
      if (authState.user() && authState.hero()) {
        return router.parseUrl('/auth/server-entry');
      }

      if (authState.user()) {
        return router.parseUrl('/auth/server-entry');
      }

      return true;
    })
  );
};
