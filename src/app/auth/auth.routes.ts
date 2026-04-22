import { Routes } from '@angular/router';

export const authRoutes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login-page').then((m) => m.LoginPage)
  },
  {
    path: 'create-character',
    loadComponent: () =>
      import('./pages/create-character/create-character-page').then(
        (m) => m.CreateCharacterPage
      )
  }
];
