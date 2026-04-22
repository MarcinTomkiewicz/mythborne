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
      sectionDescription: 'Tutaj trafią polowania, zadania i przebieg wypraw.',
    },
  },
  {
    path: 'combat',
    loadComponent: () =>
      import('./pages/section-placeholder/section-placeholder').then((m) => m.GameSectionPlaceholderPage),
    data: {
      sectionTitle: 'Combat',
      sectionDescription: 'Tutaj trafi PVP, walka z potworami i logika starć.',
    },
  },
  {
    path: 'armory',
    loadComponent: () =>
      import('./pages/section-placeholder/section-placeholder').then((m) => m.GameSectionPlaceholderPage),
    data: {
      sectionTitle: 'Armory',
      sectionDescription: 'Tutaj trafi ekwipunek, crafting, jakość przedmiotów i bonusy.',
    },
  },
  {
    path: 'mansion',
    loadComponent: () =>
      import('./pages/section-placeholder/section-placeholder').then((m) => m.GameSectionPlaceholderPage),
    data: {
      sectionTitle: 'Mansion',
      sectionDescription: 'Tutaj trafią budynki, estate, produkcja surowców i rozwój bazy.',
    },
  },
  {
    path: 'trade',
    loadComponent: () =>
      import('./pages/section-placeholder/section-placeholder').then((m) => m.GameSectionPlaceholderPage),
    data: {
      sectionTitle: 'Trade',
      sectionDescription: 'Tutaj trafi handel, gospodarka, drachmy i wymiana między graczami.',
    },
  },
];
