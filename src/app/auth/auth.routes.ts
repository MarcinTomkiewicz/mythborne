import {
  authEntryGuard,
  createCharacterEntryGuard,
  serverEntryGuard,
} from '../core/guards/hero-onboarding.guard';
import { Routes } from '@angular/router';

export const authRoutes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    canActivate: [authEntryGuard],
    loadComponent: () =>
      import('./pages/login/login-page').then((m) => m.LoginPage)
  },
  {
    path: '',
    loadComponent: () =>
      import('./layout/account-entry-layout').then((m) => m.AccountEntryLayout),
    children: [
      {
        path: 'server-entry',
        canActivate: [serverEntryGuard],
        loadComponent: () =>
          import('./pages/server-entry/server-entry-page').then(
            (m) => m.ServerEntryPage,
          ),
      },
      {
        path: 'create-character',
        canActivate: [createCharacterEntryGuard],
        loadComponent: () =>
          import('./pages/create-character/create-character-page').then(
            (m) => m.CreateCharacterPage
          )
      },
    ],
  }
];
