import { Routes } from '@angular/router';
import { authRoutes } from './auth/auth.routes';


export const routes: Routes = [
  {
    path: '',
    redirectTo: 'game',
    pathMatch: 'full'
  },
  {
    path: 'game/dashboard',
    loadComponent: () =>
      import('./features/hero/dashboard/dashboard').then((m) => m.Dashboard)
  },
  {
    path: 'auth',
    children: authRoutes
  },
  {
    path: '**',
    redirectTo: 'game'
  }
];