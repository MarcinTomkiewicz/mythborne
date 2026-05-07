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
    path: 'exploration',
    loadComponent: () =>
      import('./pages/exploration/exploration-page').then((m) => m.ExplorationPage),
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
    path: 'vicinity/spy-results/:spyResultId',
    loadComponent: () =>
      import('./pages/vicinity/pvp-spy-result-page').then((m) => m.PvpSpyResultPage),
  },
  {
    path: 'vicinity/attack-results/:attackResultId',
    loadComponent: () =>
      import('./pages/vicinity/pvp-attack-result-page').then((m) => m.PvpAttackResultPage),
  },
  {
    path: 'vicinity',
    loadComponent: () =>
      import('./pages/vicinity/estate-vicinity-page').then((m) => m.EstateVicinityPage),
  },
  {
    path: 'reports',
    loadComponent: () =>
      import('./pages/reports/reports-page').then((m) => m.ReportsPage),
  },
  {
    path: 'reports/:reportId',
    loadComponent: () =>
      import('./pages/reports/report-detail-page').then((m) => m.ReportDetailPage),
  },
  {
    path: 'trade',
    loadComponent: () =>
      import('./pages/trade/trade-page').then((m) => m.TradePage),
  },
  {
    path: 'auction',
    loadComponent: () =>
      import('./pages/auction/auction-page').then((m) => m.AuctionPage),
  },
];
