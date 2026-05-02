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
    path: 'combat-balance',
    loadComponent: () =>
      import('./pages/combat-balance/combat-balance-page').then(
        (m) => m.CombatBalancePage,
      ),
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
    path: 'anti-abuse-cases',
    loadComponent: () =>
      import('./pages/anti-abuse-cases/anti-abuse-cases-page').then(
        (m) => m.AntiAbuseCasesPage,
      ),
  },
  {
    path: 'anti-abuse-cases/:caseId',
    loadComponent: () =>
      import('./pages/anti-abuse-cases/anti-abuse-case-detail-page').then(
        (m) => m.AntiAbuseCaseDetailPage,
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
    path: 'moderation-actions',
    loadComponent: () =>
      import('./pages/moderation-actions/moderation-actions-page').then(
        (m) => m.ModerationActionsPage,
      ),
  },
  {
    path: 'exploration-debug',
    loadComponent: () =>
      import('./pages/exploration-debug/exploration-debug-page').then(
        (m) => m.ExplorationDebugPage,
      ),
  },
  {
    path: 'exploration-lab',
    loadComponent: () =>
      import('./pages/exploration-lab/exploration-lab-page').then(
        (m) => m.ExplorationLabPage,
      ),
  },
  {
    path: 'exploration-trials',
    loadComponent: () =>
      import('./pages/exploration-trials/exploration-trials-page').then(
        (m) => m.ExplorationTrialsPage,
      ),
  },
  {
    path: 'exploration-encounters',
    loadComponent: () =>
      import('./pages/exploration-encounters/exploration-encounters-page').then(
        (m) => m.ExplorationEncountersPage,
      ),
  },
  {
    path: 'reward-profiles',
    loadComponent: () =>
      import('./pages/reward-profiles/reward-profiles-page').then(
        (m) => m.RewardProfilesPage,
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
