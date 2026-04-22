import { inject } from '@angular/core';
import {
  CanActivateChildFn,
  CanActivateFn,
  Router,
  UrlTree,
} from '@angular/router';
import { AuthState } from '../services/auth/auth-state';

function requireOnboardedHero(): true | UrlTree {
  const authState = inject(AuthState);
  const router = inject(Router);

  if (!authState.user()) {
    return router.parseUrl('/auth/login');
  }

  if (!authState.hero()) {
    return router.parseUrl('/auth/create-character');
  }

  return true;
}

export const requireOnboardedHeroGuard: CanActivateChildFn = () =>
  requireOnboardedHero();

export const createCharacterEntryGuard: CanActivateFn = () => {
  const authState = inject(AuthState);
  const router = inject(Router);

  if (authState.user() && authState.hero()) {
    return router.parseUrl('/hero/dashboard');
  }

  return true;
};
