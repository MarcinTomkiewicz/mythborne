import { AdminDashboardCard, AdminTagLink } from '../core/types/admin-ui.types';

export const ADMIN_DASHBOARD_CARDS: readonly AdminDashboardCard[] = [
  {
    legend: 'Balance',
    title: 'Balance and formulas',
    description:
      'Edycja quality tiers, bucket profiles oraz globalnych formul przypinanych do konkretnych targetow balansu.',
    routerLink: '/admin/balance',
    accessPolicy: 'selectedServerManagement',
  },
  {
    legend: 'Catalog',
    title: 'Items, prefixes and suffixes',
    description:
      'Dodawanie i edycja bazowych przedmiotow, prefixow, suffixow i ich bonusow.',
    routerLink: '/admin/item-catalog',
    accessPolicy: 'selectedServerManagement',
  },
  {
    legend: 'Buildings',
    title: 'Estate buildings',
    description:
      'Edycja definicji budynkow, ich bonusow, wymagan, bazowych kosztow i czasu budowy.',
    routerLink: '/admin/buildings',
    accessPolicy: 'selectedServerManagement',
  },
  {
    legend: 'Governance',
    title: 'Config definitions',
    description:
      'Podglad rejestru konfigurowalnych wartosci i encji zarzadzanych przez governance.',
    routerLink: '/admin/config-definitions',
    accessPolicy: 'selectedServerManagement',
  },
  {
    legend: 'Governance',
    title: 'Config changes',
    description:
      'Podglad historii change-setow konfiguracji, statusow, powodow oraz wpisow zmian.',
    routerLink: '/admin/config-change-sets',
    accessPolicy: 'selectedServerManagement',
  },
  {
    legend: 'Formulas',
    title: 'Formula read model',
    description:
      'Podglad formula targets, formula library, global assignments, blocks i lokalnych overrideow.',
    routerLink: '/admin/formulas',
    accessPolicy: 'selectedServerManagement',
  },
  {
    legend: 'Anti-abuse',
    title: 'Anti-abuse config',
    description:
      'Podglad serwerowych progow i flag anti-abuse zarzadzanych przez config governance.',
    routerLink: '/admin/anti-abuse-config',
    accessPolicy: 'selectedServerManagement',
  },
  {
    legend: 'Anti-abuse',
    title: 'Case list',
    description:
      'Server-scoped staff queue for anti-abuse cases, participant filters and status review.',
    routerLink: '/admin/anti-abuse-cases',
    accessPolicy: 'selectedServerAntiAbuseTriage',
  },
  {
    legend: 'Staff',
    title: 'Staff management',
    description:
      'Wyszukiwanie kandydatow, weryfikacja eligibility oraz przypisywanie staffu do wybranego serwera.',
    routerLink: '/admin/staff-management',
    accessPolicy: 'selectedServerManagement',
  },
  {
    legend: 'Moderation',
    title: 'Moderation actions',
    description:
      'Tworzenie serwerowych akcji moderacyjnych i podglad widocznej historii dla wybranego kontekstu.',
    routerLink: '/admin/moderation-actions',
    accessPolicy: 'selectedServerModeration',
  },
  {
    legend: 'Exploration',
    title: 'Exploration debug',
    description:
      'Server-scoped sandbox tools for inspecting exploration runtime state and test helper RPCs.',
    routerLink: '/admin/exploration-debug',
    accessPolicy: 'selectedServerTesting',
  },
  {
    legend: 'Exploration',
    title: 'Exploration lab',
    description:
      'Non-mutating previews and simulations for trial chances, auto-resolve and rewards.',
    routerLink: '/admin/exploration-lab',
    accessPolicy: 'selectedServerTesting',
  },
  {
    legend: 'Exploration',
    title: 'Trial definitions',
    description:
      'Read-only inspector for exploration trial definitions, minigames and combat candidates.',
    routerLink: '/admin/exploration-trials',
    accessPolicy: 'selectedServerManagement',
  },
  {
    legend: 'Audit',
    title: 'Audit dictionaries',
    description:
      'Podglad stabilnych typow akcji i encji uzywanych przez audit log.',
    routerLink: '/admin/audit-dictionaries',
    accessPolicy: 'selectedServerManagement',
  },
  {
    legend: 'Audit',
    title: 'Audit logs',
    description:
      'Podglad ostatnich audit logow z filtrowaniem po akcji, encji, serwerze i aktorze.',
    routerLink: '/admin/audit-logs',
    accessPolicy: 'selectedServerManagement',
  },
];

export const ADMIN_DASHBOARD_LINKS: readonly AdminTagLink[] = [
  {
    label: 'Open armory',
    routerLink: '/game/armory',
    accessPolicy: 'playerGameplay',
  },
  {
    label: 'Hero dashboard',
    routerLink: '/hero/dashboard',
    accessPolicy: 'playerGameplay',
  },
];

export const BALANCE_PAGE_LINKS: readonly AdminTagLink[] = [
  {
    label: 'Formula read model',
    routerLink: '/admin/formulas',
    accessPolicy: 'selectedServerManagement',
  },
  {
    label: 'Item catalog',
    routerLink: '/admin/item-catalog',
    accessPolicy: 'selectedServerManagement',
  },
  {
    label: 'Buildings',
    routerLink: '/admin/buildings',
    accessPolicy: 'selectedServerManagement',
  },
  { label: 'Go to armory', routerLink: '/game/armory', accessPolicy: 'playerGameplay' },
];

export const ITEM_CATALOG_PAGE_LINKS: readonly AdminTagLink[] = [
  { label: 'Balance', routerLink: '/admin/balance', accessPolicy: 'selectedServerManagement' },
  { label: 'Go to armory', routerLink: '/game/armory', accessPolicy: 'playerGameplay' },
];

export const BUILDINGS_PAGE_LINKS: readonly AdminTagLink[] = [
  { label: 'Formulas', routerLink: '/admin/balance', accessPolicy: 'selectedServerManagement' },
  { label: 'Mansion view', routerLink: '/game/mansion', accessPolicy: 'playerGameplay' },
];

export const CONFIG_DEFINITIONS_PAGE_LINKS: readonly AdminTagLink[] = [
  { label: 'Admin dashboard', routerLink: '/admin', accessPolicy: 'adminShell' },
  {
    label: 'Config changes',
    routerLink: '/admin/config-change-sets',
    accessPolicy: 'selectedServerManagement',
  },
  {
    label: 'Anti-abuse config',
    routerLink: '/admin/anti-abuse-config',
    accessPolicy: 'selectedServerManagement',
  },
  {
    label: 'Formulas',
    routerLink: '/admin/formulas',
    accessPolicy: 'selectedServerManagement',
  },
  {
    label: 'Buildings',
    routerLink: '/admin/buildings',
    accessPolicy: 'selectedServerManagement',
  },
];

export const CONFIG_CHANGE_SETS_PAGE_LINKS: readonly AdminTagLink[] = [
  { label: 'Admin dashboard', routerLink: '/admin', accessPolicy: 'adminShell' },
  {
    label: 'Config definitions',
    routerLink: '/admin/config-definitions',
    accessPolicy: 'selectedServerManagement',
  },
  {
    label: 'Anti-abuse config',
    routerLink: '/admin/anti-abuse-config',
    accessPolicy: 'selectedServerManagement',
  },
  {
    label: 'Formulas',
    routerLink: '/admin/formulas',
    accessPolicy: 'selectedServerManagement',
  },
  {
    label: 'Buildings',
    routerLink: '/admin/buildings',
    accessPolicy: 'selectedServerManagement',
  },
];

export const ANTI_ABUSE_CONFIG_PAGE_LINKS: readonly AdminTagLink[] = [
  { label: 'Admin dashboard', routerLink: '/admin', accessPolicy: 'adminShell' },
  {
    label: 'Case list',
    routerLink: '/admin/anti-abuse-cases',
    accessPolicy: 'selectedServerAntiAbuseTriage',
  },
  {
    label: 'Staff management',
    routerLink: '/admin/staff-management',
    accessPolicy: 'selectedServerManagement',
  },
  {
    label: 'Config changes',
    routerLink: '/admin/config-change-sets',
    accessPolicy: 'selectedServerManagement',
  },
  {
    label: 'Config definitions',
    routerLink: '/admin/config-definitions',
    accessPolicy: 'selectedServerManagement',
  },
];

export const ANTI_ABUSE_CASES_PAGE_LINKS: readonly AdminTagLink[] = [
  { label: 'Admin dashboard', routerLink: '/admin', accessPolicy: 'adminShell' },
  {
    label: 'Anti-abuse config',
    routerLink: '/admin/anti-abuse-config',
    accessPolicy: 'selectedServerManagement',
  },
  {
    label: 'Moderation actions',
    routerLink: '/admin/moderation-actions',
    accessPolicy: 'selectedServerModeration',
  },
  {
    label: 'Audit logs',
    routerLink: '/admin/audit-logs',
    accessPolicy: 'selectedServerManagement',
  },
];

export const STAFF_MANAGEMENT_PAGE_LINKS: readonly AdminTagLink[] = [
  { label: 'Admin dashboard', routerLink: '/admin', accessPolicy: 'adminShell' },
  {
    label: 'Moderation actions',
    routerLink: '/admin/moderation-actions',
    accessPolicy: 'selectedServerModeration',
  },
  {
    label: 'Anti-abuse config',
    routerLink: '/admin/anti-abuse-config',
    accessPolicy: 'selectedServerManagement',
  },
  {
    label: 'Audit logs',
    routerLink: '/admin/audit-logs',
    accessPolicy: 'selectedServerManagement',
  },
];

export const MODERATION_ACTIONS_PAGE_LINKS: readonly AdminTagLink[] = [
  { label: 'Admin dashboard', routerLink: '/admin', accessPolicy: 'adminShell' },
  {
    label: 'Anti-abuse cases',
    routerLink: '/admin/anti-abuse-cases',
    accessPolicy: 'selectedServerAntiAbuseTriage',
  },
  {
    label: 'Staff management',
    routerLink: '/admin/staff-management',
    accessPolicy: 'selectedServerManagement',
  },
  {
    label: 'Audit logs',
    routerLink: '/admin/audit-logs',
    accessPolicy: 'selectedServerManagement',
  },
  {
    label: 'Anti-abuse config',
    routerLink: '/admin/anti-abuse-config',
    accessPolicy: 'selectedServerManagement',
  },
];

export const EXPLORATION_DEBUG_PAGE_LINKS: readonly AdminTagLink[] = [
  { label: 'Admin dashboard', routerLink: '/admin', accessPolicy: 'adminShell' },
  {
    label: 'Exploration',
    routerLink: '/game/exploration',
    accessPolicy: 'playerGameplay',
  },
  {
    label: 'Audit logs',
    routerLink: '/admin/audit-logs',
    accessPolicy: 'selectedServerManagement',
  },
  {
    label: 'Config definitions',
    routerLink: '/admin/config-definitions',
    accessPolicy: 'selectedServerManagement',
  },
];

export const EXPLORATION_TRIALS_PAGE_LINKS: readonly AdminTagLink[] = [
  { label: 'Admin dashboard', routerLink: '/admin', accessPolicy: 'adminShell' },
  {
    label: 'Exploration lab',
    routerLink: '/admin/exploration-lab',
    accessPolicy: 'selectedServerTesting',
  },
  {
    label: 'Formula read model',
    routerLink: '/admin/formulas',
    accessPolicy: 'selectedServerManagement',
  },
  {
    label: 'Config definitions',
    routerLink: '/admin/config-definitions',
    accessPolicy: 'selectedServerManagement',
  },
];

export const EXPLORATION_LAB_PAGE_LINKS: readonly AdminTagLink[] = [
  { label: 'Admin dashboard', routerLink: '/admin', accessPolicy: 'adminShell' },
  {
    label: 'Trial definitions',
    routerLink: '/admin/exploration-trials',
    accessPolicy: 'selectedServerManagement',
  },
  {
    label: 'Exploration debug',
    routerLink: '/admin/exploration-debug',
    accessPolicy: 'selectedServerTesting',
  },
  {
    label: 'Exploration',
    routerLink: '/game/exploration',
    accessPolicy: 'playerGameplay',
  },
  {
    label: 'Config definitions',
    routerLink: '/admin/config-definitions',
    accessPolicy: 'selectedServerManagement',
  },
];

export const FORMULAS_PAGE_LINKS: readonly AdminTagLink[] = [
  { label: 'Admin dashboard', routerLink: '/admin', accessPolicy: 'adminShell' },
  {
    label: 'Balance editor',
    routerLink: '/admin/balance',
    accessPolicy: 'selectedServerManagement',
  },
  {
    label: 'Config definitions',
    routerLink: '/admin/config-definitions',
    accessPolicy: 'selectedServerManagement',
  },
  {
    label: 'Config changes',
    routerLink: '/admin/config-change-sets',
    accessPolicy: 'selectedServerManagement',
  },
];

export const AUDIT_DICTIONARIES_PAGE_LINKS: readonly AdminTagLink[] = [
  { label: 'Admin dashboard', routerLink: '/admin', accessPolicy: 'adminShell' },
  {
    label: 'Audit logs',
    routerLink: '/admin/audit-logs',
    accessPolicy: 'selectedServerManagement',
  },
  {
    label: 'Config changes',
    routerLink: '/admin/config-change-sets',
    accessPolicy: 'selectedServerManagement',
  },
  {
    label: 'Anti-abuse config',
    routerLink: '/admin/anti-abuse-config',
    accessPolicy: 'selectedServerManagement',
  },
];

export const AUDIT_LOGS_PAGE_LINKS: readonly AdminTagLink[] = [
  { label: 'Admin dashboard', routerLink: '/admin', accessPolicy: 'adminShell' },
  {
    label: 'Audit dictionaries',
    routerLink: '/admin/audit-dictionaries',
    accessPolicy: 'selectedServerManagement',
  },
  {
    label: 'Config changes',
    routerLink: '/admin/config-change-sets',
    accessPolicy: 'selectedServerManagement',
  },
  {
    label: 'Anti-abuse config',
    routerLink: '/admin/anti-abuse-config',
    accessPolicy: 'selectedServerManagement',
  },
];
