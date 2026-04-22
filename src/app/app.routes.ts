import { Routes } from '@angular/router';
import { adminRoutes } from './admin/admin.routes';
import { authRoutes } from './auth/auth.routes';
import { gameRoutes } from './game/game.routes';
import { heroRoutes } from './hero/hero.routes';
import { publicRoutes } from './public/public.routes';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'public',
    pathMatch: 'full'
  },
  {
    path: 'public',
    children: publicRoutes
  },
  {
    path: 'hero',
    children: heroRoutes
  },
  {
    path: 'game',
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
