import { MenuItem } from 'primeng/api';

export interface MenuGroup {
  title: string;
  items: MenuItem[];
}

export const MENU_LOGGED_IN_GROUPS: MenuGroup[] = [
  {
    title: 'Hero',
    items: [
      { title: 'Dashboard', url: '/hero/dashboard', icon: 'pi pi-helmet' },
      { title: 'Attributes', url: '/hero/attributes', icon: 'pi pi-skills' },
      { title: 'Exploration', url: '/game/exploration', icon: 'pi pi-hydra' },
      { title: 'Armory', url: '/game/armory', icon: 'pi pi-chest' },
      { title: 'Mansion', url: '/game/mansion', icon: 'pi pi-capitol' },
    ],
  },
  {
    title: 'World',
    items: [
      { title: 'Vicinity', url: '/game/vicinity', icon: 'pi pi-trail' },
      { title: 'Guild', url: '/game/guild', icon: 'pi pi-overlord' },
      { title: 'Reports', url: '/game/reports', icon: 'pi pi-tied-scroll' },
      { title: 'Trade', url: '/game/trade', icon: 'pi pi-trade' },
      { title: 'Auctions', url: '/game/auction', icon: 'pi pi-shop-bag' },
    ],
  },
  {
    title: 'Operations',
    items: [
      { title: 'Admin', url: '/admin', icon: 'pi pi-d20' },
    ],
  },
];

export const MENU_LOGGED_IN: MenuItem[] = MENU_LOGGED_IN_GROUPS.flatMap(
  (group) => group.items,
);

export const MENU_GUEST: MenuItem[] = [
  { title: 'About the game', url: '/public', icon: '/assets/icons/info.svg' },
  { title: 'Register', url: '/auth/create-character', icon: '/assets/icons/user-plus.svg' }
];
