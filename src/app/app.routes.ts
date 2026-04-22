import { Routes } from '@angular/router';
import { authRoutes } from './auth/auth.routes';


export const routes: Routes = [
  {
    path: '',
    redirectTo: 'game/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'game',
    redirectTo: 'game/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'game/dashboard',
    loadComponent: () =>
      import('./features/hero/dashboard/dashboard').then((m) => m.Dashboard)
  },
  {
    path: 'register',
    redirectTo: 'auth/create-character',
    pathMatch: 'full'
  },
  {
    path: 'login',
    redirectTo: 'game/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    children: authRoutes
  },
  {
    path: '**',
    redirectTo: 'game/dashboard'
  }
];
