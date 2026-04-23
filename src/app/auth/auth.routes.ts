import {
  authEntryGuard,
  createCharacterEntryGuard,
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
    path: 'create-character',
    canActivate: [createCharacterEntryGuard],
    loadComponent: () =>
      import('./pages/create-character/create-character-page').then(
        (m) => m.CreateCharacterPage
      )
  }
];
