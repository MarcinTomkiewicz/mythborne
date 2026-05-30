import { Routes } from '@angular/router';
import { adminRoutes } from './admin/admin.routes';
import { authRoutes } from './auth/auth.routes';
import { requireAdminAccessGuard } from './core/guards/admin-access.guard';
import {
  publicEntryGuard,
  requireOnboardedHeroGuard,
} from './core/guards/hero-onboarding.guard';
import { gameRoutes } from './game/game.routes';
import { heroRoutes } from './hero/hero.routes';
import { publicRoutes } from './public/public.routes';

const appShellRoutes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () =>
      import('./public/pages/home/home').then((m) => m.PublicHomePage),
  },
  {
    path: 'public',
    canActivate: [publicEntryGuard],
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
    canActivateChild: [requireAdminAccessGuard],
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
    path: 'report/:publicToken',
    loadComponent: () =>
      import('./public/pages/report/public-report-page').then((m) => m.PublicReportPage),
  },
  {
    path: '',
    loadComponent: () =>
      import('./layout/components/app-shell/app-shell').then((m) => m.AppShell),
    children: appShellRoutes,
  },
];
