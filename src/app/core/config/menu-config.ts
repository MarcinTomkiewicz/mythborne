import { MenuItem } from "primeng/api";

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
      { title: 'Combat', url: '/game/combat', icon: 'pi pi-helmet' },
      { title: 'Armory', url: '/game/armory', icon: 'pi pi-helmet' },
    ],
  },
  {
    title: 'World',
    items: [
      { title: 'Mansion', url: '/game/mansion', icon: 'pi pi-helmet' },
      { title: 'Vicinity', url: '/game/vicinity', icon: 'pi pi-hydra' },
      { title: 'Guild', url: '/game/guild', icon: 'pi pi-helmet' },
      { title: 'Reports', url: '/game/reports', icon: 'pi pi-skills' },
      { title: 'Trade', url: '/game/trade', icon: 'pi pi-trade' },
      { title: 'Auctions', url: '/game/auction', icon: 'pi pi-trade' },
    ],
  },
  {
    title: 'Operations',
    items: [
      { title: 'Admin', url: '/admin', icon: 'pi pi-skills' },
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
