import { AdminDashboardCard, AdminTagLink } from '../core/types/admin-ui.types';

export const ADMIN_DASHBOARD_CARDS: readonly AdminDashboardCard[] = [
  {
    legend: 'Balance',
    title: 'Balance and formulas',
    description:
      'Edycja quality tiers, bucket profiles oraz globalnych formul przypinanych do konkretnych targetow balansu.',
    routerLink: '/admin/balance',
  },
  {
    legend: 'Catalog',
    title: 'Items, prefixes and suffixes',
    description:
      'Dodawanie i edycja bazowych przedmiotow, prefixow, suffixow i ich bonusow.',
    routerLink: '/admin/item-catalog',
  },
  {
    legend: 'Buildings',
    title: 'Estate buildings',
    description:
      'Edycja definicji budynkow, ich bonusow, wymagan, bazowych kosztow i czasu budowy.',
    routerLink: '/admin/buildings',
  },
  {
    legend: 'Governance',
    title: 'Config definitions',
    description:
      'Podglad rejestru konfigurowalnych wartosci i encji zarzadzanych przez governance.',
    routerLink: '/admin/config-definitions',
  },
  {
    legend: 'Governance',
    title: 'Config changes',
    description:
      'Podglad historii change-setow konfiguracji, statusow, powodow oraz wpisow zmian.',
    routerLink: '/admin/config-change-sets',
  },
  {
    legend: 'Formulas',
    title: 'Formula read model',
    description:
      'Podglad formula targets, formula library, global assignments, blocks i lokalnych overrideow.',
    routerLink: '/admin/formulas',
  },
  {
    legend: 'Anti-abuse',
    title: 'Anti-abuse config',
    description:
      'Podglad serwerowych progow i flag anti-abuse zarzadzanych przez config governance.',
    routerLink: '/admin/anti-abuse-config',
  },
  {
    legend: 'Audit',
    title: 'Audit dictionaries',
    description:
      'Podglad stabilnych typow akcji i encji uzywanych przez audit log.',
    routerLink: '/admin/audit-dictionaries',
  },
];

export const ADMIN_DASHBOARD_LINKS: readonly AdminTagLink[] = [
  { label: 'Open armory', routerLink: '/game/armory' },
  { label: 'Hero dashboard', routerLink: '/hero/dashboard' },
];

export const BALANCE_PAGE_LINKS: readonly AdminTagLink[] = [
  { label: 'Formula read model', routerLink: '/admin/formulas' },
  { label: 'Item catalog', routerLink: '/admin/item-catalog' },
  { label: 'Buildings', routerLink: '/admin/buildings' },
  { label: 'Go to armory', routerLink: '/game/armory' },
];

export const ITEM_CATALOG_PAGE_LINKS: readonly AdminTagLink[] = [
  { label: 'Balance', routerLink: '/admin/balance' },
  { label: 'Go to armory', routerLink: '/game/armory' },
];

export const BUILDINGS_PAGE_LINKS: readonly AdminTagLink[] = [
  { label: 'Formulas', routerLink: '/admin/balance' },
  { label: 'Mansion view', routerLink: '/game/mansion' },
];

export const CONFIG_DEFINITIONS_PAGE_LINKS: readonly AdminTagLink[] = [
  { label: 'Admin dashboard', routerLink: '/admin' },
  { label: 'Config changes', routerLink: '/admin/config-change-sets' },
  { label: 'Anti-abuse config', routerLink: '/admin/anti-abuse-config' },
  { label: 'Formulas', routerLink: '/admin/formulas' },
  { label: 'Buildings', routerLink: '/admin/buildings' },
];

export const CONFIG_CHANGE_SETS_PAGE_LINKS: readonly AdminTagLink[] = [
  { label: 'Admin dashboard', routerLink: '/admin' },
  { label: 'Config definitions', routerLink: '/admin/config-definitions' },
  { label: 'Anti-abuse config', routerLink: '/admin/anti-abuse-config' },
  { label: 'Formulas', routerLink: '/admin/formulas' },
  { label: 'Buildings', routerLink: '/admin/buildings' },
];

export const ANTI_ABUSE_CONFIG_PAGE_LINKS: readonly AdminTagLink[] = [
  { label: 'Admin dashboard', routerLink: '/admin' },
  { label: 'Config changes', routerLink: '/admin/config-change-sets' },
  { label: 'Config definitions', routerLink: '/admin/config-definitions' },
];

export const FORMULAS_PAGE_LINKS: readonly AdminTagLink[] = [
  { label: 'Admin dashboard', routerLink: '/admin' },
  { label: 'Balance editor', routerLink: '/admin/balance' },
  { label: 'Config definitions', routerLink: '/admin/config-definitions' },
  { label: 'Config changes', routerLink: '/admin/config-change-sets' },
];

export const AUDIT_DICTIONARIES_PAGE_LINKS: readonly AdminTagLink[] = [
  { label: 'Admin dashboard', routerLink: '/admin' },
  { label: 'Config changes', routerLink: '/admin/config-change-sets' },
  { label: 'Anti-abuse config', routerLink: '/admin/anti-abuse-config' },
];
