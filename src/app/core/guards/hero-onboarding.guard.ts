import { inject } from '@angular/core';
import {
  CanActivateChildFn,
  CanActivateFn,
  Router,
  UrlTree,
} from '@angular/router';
import { catchError, map, from, of, switchMap } from 'rxjs';
import { StartFlowServerAvailability } from '../domain/start-flow/start-flow.model';
import { AuthState } from '../services/auth/auth-state';
import { Auth } from '../services/auth/auth';
import { ActiveHero } from '../services/hero/active-hero';
import { ActiveServer } from '../services/server/active-server';
import { StartFlow } from '../services/start-flow/start-flow';

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
  const activeHero = inject(ActiveHero);
  const authState = inject(AuthState);
  const router = inject(Router);

  return from(auth.initialize()).pipe(
    switchMap(() => {
      const initialDecision = resolveOnboardedHeroRedirect(authState, router);

      if (initialDecision === true || !authState.user()) {
        return of(initialDecision);
      }

      return activeHero.loadActiveHero().pipe(
        map(() => resolveOnboardedHeroRedirect(authState, router)),
        catchError(() => of(router.parseUrl('/auth/server-entry'))),
      );
    })
  );
};

export const createCharacterEntryGuard: CanActivateFn = () => {
  const auth = inject(Auth);
  const authState = inject(AuthState);
  const activeServer = inject(ActiveServer);
  const router = inject(Router);
  const startFlow = inject(StartFlow);

  return from(auth.initialize()).pipe(
    switchMap(() => {
      if (!authState.user() || !authState.hero()) {
        return of(true);
      }

      return activeServer.loadAccessibleServers().pipe(
        switchMap(() => startFlow.getServerAvailability()),
        map((availability) => {
          const selectedServerId = activeServer.selectedServer()?.id ?? null;
          const selectedAvailability = selectedServerId
            ? availability.find((entry) => entry.serverId === selectedServerId) ?? null
            : null;

          return selectedAvailability && canEnterHeroCreation(selectedAvailability)
            ? true
            : router.parseUrl('/auth/server-entry');
        }),
        catchError(() => of(router.parseUrl('/auth/server-entry'))),
      );
    }),
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

export const publicEntryGuard: CanActivateFn = () => {
  const auth = inject(Auth);
  const authState = inject(AuthState);
  const router = inject(Router);

  return from(auth.initialize()).pipe(
    map(() => {
      if (authState.user()) {
        return router.parseUrl('/auth/server-entry');
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

function canEnterHeroCreation(
  availability: StartFlowServerAvailability,
): boolean {
  return availability.canCreateHero && !availability.blockReason;
}
