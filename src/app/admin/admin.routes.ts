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
    path: 'scrapped-item-recovery',
    loadComponent: () =>
      import('./pages/scrapped-item-recovery/scrapped-item-recovery-page').then(
        (m) => m.ScrappedItemRecoveryPage,
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
    path: 'combat-opponents',
    loadComponent: () =>
      import('./pages/combat-opponents/combat-opponents-page').then(
        (m) => m.CombatOpponentsPage,
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
    path: 'luck-lab',
    loadComponent: () =>
      import('./pages/luck-lab/luck-lab-page').then((m) => m.LuckLabPage),
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
    path: 'level-up-stat-bonuses',
    loadComponent: () =>
      import('./pages/level-up-stat-bonuses/level-up-stat-bonuses-page').then(
        (m) => m.LevelUpStatBonusesPage,
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
  {
    path: 'notification-types',
    loadComponent: () =>
      import('./pages/notification-types/notification-types-page').then(
        (m) => m.NotificationTypesPage,
      ),
  },
  {
    path: 'notification-hooks',
    loadComponent: () =>
      import('./pages/notification-hooks/notification-hooks-page').then(
        (m) => m.NotificationHooksPage,
      ),
  },
  {
    path: 'pvp-overview',
    loadComponent: () =>
      import('./pages/pvp-overview/pvp-overview-page').then(
        (m) => m.PvpOverviewPage,
      ),
  },
  {
    path: 'pvp-action-lifecycle',
    loadComponent: () =>
      import('./pages/pvp-action-lifecycle/pvp-action-lifecycle-page').then(
        (m) => m.PvpActionLifecyclePage,
      ),
  },
  {
    path: 'pvp-targeting',
    loadComponent: () =>
      import('./pages/pvp-targeting/pvp-targeting-page').then(
        (m) => m.PvpTargetingPage,
      ),
  },
  {
    path: 'pvp-travel-timing',
    loadComponent: () =>
      import('./pages/pvp-travel-timing/pvp-travel-timing-page').then(
        (m) => m.PvpTravelTimingPage,
      ),
  },
  {
    path: 'pvp-resource-consequences',
    loadComponent: () =>
      import(
        './pages/pvp-resource-consequences/pvp-resource-consequences-page'
      ).then((m) => m.PvpResourceConsequencesPage),
  },
  {
    path: 'pvp-reward-routing',
    loadComponent: () =>
      import('./pages/pvp-reward-routing/pvp-reward-routing-page').then(
        (m) => m.PvpRewardRoutingPage,
      ),
  },
  {
    path: 'pvp-prestige-context',
    loadComponent: () =>
      import('./pages/pvp-prestige-context/pvp-prestige-context-page').then(
        (m) => m.PvpPrestigeContextPage,
      ),
  },
  {
    path: 'pvp-anti-abuse-explainability',
    loadComponent: () =>
      import(
        './pages/pvp-anti-abuse-explainability/pvp-anti-abuse-explainability-page'
      ).then((m) => m.PvpAntiAbuseExplainabilityPage),
  },
  {
    path: 'pvp-report-producer',
    loadComponent: () =>
      import('./pages/pvp-report-producer/pvp-report-producer-page').then(
        (m) => m.PvpReportProducerPage,
      ),
  },
  {
    path: 'pvp-foundation-diagnostic',
    loadComponent: () =>
      import(
        './pages/pvp-foundation-diagnostic/pvp-foundation-diagnostic-page'
      ).then((m) => m.PvpFoundationDiagnosticPage),
  },
];
