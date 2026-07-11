import { Routes } from '@angular/router';
import { explorationManualTrialExitGuard } from './pages/exploration/exploration-manual-trial-exit.guard';

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
    canDeactivate: [explorationManualTrialExitGuard],
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
    path: 'guild',
    loadComponent: () =>
      import('./pages/guild/guild-page').then((m) => m.GuildPage),
  },
  {
    path: 'estate',
    loadComponent: () =>
      import('./pages/mansion/mansion-page').then((m) => m.MansionPage),
  },
  {
    path: 'mansion',
    loadComponent: () =>
      import('./pages/mansion/mansion-page').then((m) => m.MansionPage),
  },
  {
    path: 'vicinity',
    loadComponent: () =>
      import('./pages/vicinity/vicinity-page').then((m) => m.VicinityPage),
  },
  {
    path: 'ranking',
    loadComponent: () =>
      import('./pages/pvp-ranking/pvp-ranking-page').then((m) => m.PvpRankingPage),
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
