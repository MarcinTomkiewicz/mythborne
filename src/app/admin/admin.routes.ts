import { Routes } from '@angular/router';

export const adminRoutes: Routes = [
  {
    path: 'access-denied',
    loadComponent: () =>
      import('./pages/access-denied/admin-access-denied-page').then(
        (m) => m.AdminAccessDeniedPage,
      ),
  },
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
  {
    path: 'config-change-sets',
    loadComponent: () =>
      import('./pages/config-change-sets/config-change-sets-page').then(
        (m) => m.ConfigChangeSetsPage
      ),
  },
  {
    path: 'anti-abuse-config',
    loadComponent: () =>
      import('./pages/anti-abuse-config/anti-abuse-config-page').then(
        (m) => m.AntiAbuseConfigPage
      ),
  },
  {
    path: 'staff-management',
    loadComponent: () =>
      import('./pages/staff-management/staff-management-page').then(
        (m) => m.StaffManagementPage,
      ),
  },
  {
    path: 'formulas',
    loadComponent: () =>
      import('./pages/formulas/formulas-page').then((m) => m.FormulasPage),
  },
  {
    path: 'audit-dictionaries',
    loadComponent: () =>
      import('./pages/audit-dictionaries/audit-dictionaries-page').then(
        (m) => m.AuditDictionariesPage,
      ),
  },
  {
    path: 'audit-logs',
    loadComponent: () =>
      import('./pages/audit-logs/audit-logs-page').then((m) => m.AuditLogsPage),
  },
];
