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
      import('./pages/section-placeholder/section-placeholder').then((m) => m.GameSectionPlaceholderPage),
    data: {
      sectionTitle: 'Combat',
      sectionDescription: 'Tutaj trafia PVP, walka z potworami i logika starc.',
    },
  },
  {
    path: 'armory',
    loadComponent: () =>
      import('./pages/armory/armory-page').then((m) => m.ArmoryPage),
  },
  {
    path: 'mansion',
    loadComponent: () =>
      import('./pages/section-placeholder/section-placeholder').then((m) => m.GameSectionPlaceholderPage),
    data: {
      sectionTitle: 'Mansion',
      sectionDescription: 'Tutaj trafia budynki, estate, produkcja surowcow i rozwoj bazy.',
    },
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
