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
];

export const ADMIN_DASHBOARD_LINKS: readonly AdminTagLink[] = [
  { label: 'Open armory', routerLink: '/game/armory' },
  { label: 'Hero dashboard', routerLink: '/hero/dashboard' },
];

export const BALANCE_PAGE_LINKS: readonly AdminTagLink[] = [
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
  { label: 'Formulas', routerLink: '/admin/balance' },
  { label: 'Buildings', routerLink: '/admin/buildings' },
];
