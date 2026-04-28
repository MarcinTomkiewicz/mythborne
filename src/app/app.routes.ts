import { inject } from '@angular/core';
import { Routes } from '@angular/router';
import { adminRoutes } from './admin/admin.routes';
import { authRoutes } from './auth/auth.routes';
import { requireOnboardedHeroGuard } from './core/guards/hero-onboarding.guard';
import { AuthState } from './core/services/auth/auth-state';
import { gameRoutes } from './game/game.routes';
import { heroRoutes } from './hero/hero.routes';
import { publicRoutes } from './public/public.routes';

const appShellRoutes: Routes = [
  {
    path: '',
    redirectTo: () => {
      const authState = inject(AuthState);

      if (authState.hero()) {
        return '/hero/dashboard';
      }

      if (authState.user()) {
        return '/auth/create-character';
      }

      return '/public';
    },
    pathMatch: 'full'
  },
  {
    path: 'public',
    children: publicRoutes
  },
  {
    path: 'hero',
    canActivateChild: [requireOnboardedHeroGuard],
    children: heroRoutes
  },
  {
    path: 'game',
    canActivateChild: [requireOnboardedHeroGuard],
    children: gameRoutes
  },
  {
    path: 'admin',
    children: adminRoutes
  },
  {
    path: 'game/dashboard',
    redirectTo: 'hero/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'game/attributes',
    redirectTo: 'hero/attributes',
    pathMatch: 'full'
  },
  {
    path: 'register',
    redirectTo: 'auth/create-character',
    pathMatch: 'full'
  },
  {
    path: 'login',
    redirectTo: 'auth/login',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    children: authRoutes
  },
  {
    path: '**',
    redirectTo: 'public'
  }
];

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./layout/components/app-shell/app-shell').then((m) => m.AppShell),
    children: appShellRoutes,
  },
];
