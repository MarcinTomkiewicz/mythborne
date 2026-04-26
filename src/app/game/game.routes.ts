import { Routes } from '@angular/router';

export const gameRoutes: Routes = [
  {
    path: '',
    redirectTo: 'challenges',
    pathMatch: 'full',
  },
  {
    path: 'challenges',
    loadComponent: () =>
      import('./pages/section-placeholder/section-placeholder').then((m) => m.GameSectionPlaceholderPage),
    data: {
      sectionTitle: 'Challenges',
      sectionDescription: 'Tutaj trafia polowania, zadania i przebieg wypraw.',
    },
  },
  {
    path: 'combat',
    loadComponent: () =>
      import('./pages/combat/combat-page').then((m) => m.CombatPage),
  },
  {
    path: 'armory',
    loadComponent: () =>
      import('./pages/armory/armory-page').then((m) => m.ArmoryPage),
  },
  {
    path: 'mansion',
    loadComponent: () =>
      import('./pages/mansion/mansion-page').then((m) => m.MansionPage),
  },
  {
    path: 'trade',
    loadComponent: () =>
      import('./pages/section-placeholder/section-placeholder').then((m) => m.GameSectionPlaceholderPage),
    data: {
      sectionTitle: 'Trade',
      sectionDescription: 'Tutaj trafia handel, gospodarka, drachmy i wymiana miedzy graczami.',
    },
  },
];
