import { Routes } from '@angular/router';

export const heroRoutes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./pages/dashboard/dashboard').then((m) => m.Dashboard),
  },
  {
    path: 'attributes',
    loadComponent: () =>
      import('./pages/attributes/attributes-page').then((m) => m.HeroAttributesPage),
  },
];
