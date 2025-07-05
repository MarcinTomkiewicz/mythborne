import { Routes } from '@angular/router';

export const authRoutes: Routes = [
  {
    path: 'create-character',
    loadComponent: () =>
      import('./components/create-character/create-character').then((m) => m.CreateCharacter)
  }
];
