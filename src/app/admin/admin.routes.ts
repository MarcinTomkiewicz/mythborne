import { Routes } from '@angular/router';

export const adminRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/dashboard/admin-dashboard').then((m) => m.AdminDashboardPage),
  },
  {
    path: 'balance',
    loadComponent: () =>
      import('./pages/balance/item-generation-balance-page').then(
        (m) => m.ItemGenerationBalancePage
      ),
  },
  {
    path: 'item-catalog',
    loadComponent: () =>
      import('./pages/item-catalog/item-generation-item-catalog-page').then(
        (m) => m.ItemGenerationItemCatalogPage
      ),
  },
  {
    path: 'buildings',
    loadComponent: () =>
      import('./pages/buildings/buildings-page').then((m) => m.BuildingsPage),
  },
  {
    path: 'config-definitions',
    loadComponent: () =>
      import('./pages/config-definitions/config-definitions-page').then(
        (m) => m.ConfigDefinitionsPage
      ),
  },
];
