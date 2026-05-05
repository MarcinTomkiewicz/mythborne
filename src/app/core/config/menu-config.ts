import { MenuItem } from "primeng/api";

export const MENU_LOGGED_IN: MenuItem[] = [
  { title: 'Dashboard', url: '/hero/dashboard', icon: '/assets/icons/spartan-helmet.svg' },
  { title: 'Attributes', url: '/hero/attributes', icon: '/assets/icons/skills.svg' },
  { title: 'Challenges', url: '/game/challenges', icon: '/assets/icons/hydra.svg' },
  { title: 'Exploration', url: '/game/exploration', icon: '/assets/icons/hydra.svg' },
  { title: 'Combat', url: '/game/combat', icon: '/assets/icons/swordman.svg' },
  { title: 'Armory', url: '/game/armory', icon: '/assets/icons/battle-gear.svg' },
  { title: 'Mansion', url: '/game/mansion', icon: '/assets/icons/capitol.svg' },
  { title: 'Vicinity', url: '/game/vicinity', icon: '/assets/icons/capitol.svg' },
  { title: 'Reports', url: '/game/reports', icon: '/assets/icons/info.svg' },
  { title: 'Trade', url: '/game/trade', icon: '/assets/icons/trade.svg' },
  { title: 'Auctions', url: '/game/auction', icon: '/assets/icons/trade.svg' },
  { title: 'Admin', url: '/admin', icon: '/assets/icons/capitol.svg' }
];

export const MENU_GUEST: MenuItem[] = [
  { title: 'About the game', url: '/public', icon: '/assets/icons/info.svg' },
  { title: 'Register', url: '/auth/create-character', icon: '/assets/icons/user-plus.svg' }
];
