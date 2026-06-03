import { EnvironmentInjector, inject, runInInjectionContext } from '@angular/core';
import {
  CanActivateChildFn,
  CanActivateFn,
  GuardResult,
  MaybeAsync,
  Routes,
} from '@angular/router';
import { from, isObservable, Observable, switchMap } from 'rxjs';

const publicEntryGuard: CanActivateFn = (route, state) => {
  const injector = inject(EnvironmentInjector);

  return from(import('./core/guards/hero-onboarding.guard')).pipe(
    switchMap((m) =>
      toGuardResult(
        runInInjectionContext(injector, () => m.publicEntryGuard(route, state)),
      ),
    ),
  );
};

const requireOnboardedHeroGuard: CanActivateChildFn = (route, state) => {
  const injector = inject(EnvironmentInjector);

  return from(import('./core/guards/hero-onboarding.guard')).pipe(
    switchMap((m) =>
      toGuardResult(
        runInInjectionContext(injector, () =>
          m.requireOnboardedHeroGuard(route, state),
        ),
      ),
    ),
  );
};

const requireAdminAccessGuard: CanActivateChildFn = (route, state) => {
  const injector = inject(EnvironmentInjector);

  return from(import('./core/guards/admin-access.guard')).pipe(
    switchMap((m) =>
      toGuardResult(
        runInInjectionContext(injector, () =>
          m.requireAdminAccessGuard(route, state),
        ),
      ),
    ),
  );
};

function toGuardResult(result: MaybeAsync<GuardResult>): Observable<GuardResult> {
  return isObservable(result) ? result : from(Promise.resolve(result));
}

const entryShellRoutes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () =>
      import('./public/pages/home/home').then((m) => m.PublicHomePage),
  },
  {
    path: 'public',
    canActivate: [publicEntryGuard],
    loadChildren: () =>
      import('./public/public.routes').then((m) => m.publicRoutes),
  },
  {
    path: 'register',
    redirectTo: 'auth/register',
    pathMatch: 'full'
  },
  {
    path: 'login',
    redirectTo: 'auth/login',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    loadChildren: () =>
      import('./auth/auth.routes').then((m) => m.authRoutes),
  },
  {
    path: '**',
    redirectTo: 'public'
  }
];

export const routes: Routes = [
  {
    path: 'report/:publicToken',
    loadComponent: () =>
      import('./public/pages/report/public-report-page').then((m) => m.PublicReportPage),
  },
  {
    path: 'hero',
    canActivateChild: [requireOnboardedHeroGuard],
    loadComponent: () =>
      import('./layout/components/game-shell/game-shell').then((m) => m.GameShell),
    loadChildren: () =>
      import('./hero/hero.routes').then((m) => m.heroRoutes),
  },
  {
    path: 'game',
    canActivateChild: [requireOnboardedHeroGuard],
    loadComponent: () =>
      import('./layout/components/game-shell/game-shell').then((m) => m.GameShell),
    children: [
      {
        path: 'dashboard',
        redirectTo: '/hero/dashboard',
        pathMatch: 'full',
      },
      {
        path: 'attributes',
        redirectTo: '/hero/attributes',
        pathMatch: 'full',
      },
      {
        path: '',
        loadChildren: () =>
          import('./game/game.routes').then((m) => m.gameRoutes),
      },
    ],
  },
  {
    path: 'admin',
    canActivateChild: [requireAdminAccessGuard],
    loadComponent: () =>
      import('./layout/components/game-shell/game-shell').then((m) => m.GameShell),
    loadChildren: () =>
      import('./admin/admin.routes').then((m) => m.adminRoutes),
  },
  {
    path: '',
    loadComponent: () =>
      import('./layout/components/app-shell/app-shell').then((m) => m.AppShell),
    children: entryShellRoutes,
  },
];
