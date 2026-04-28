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
