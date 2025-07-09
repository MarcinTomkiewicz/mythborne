import { MenuItem } from "primeng/api";

export const MENU_LOGGED_IN: MenuItem[] = [
  { title: 'Dashboard', url: '/game/dashboard', icon: 'assets/icons/spartan-helmet.svg' },
  { title: 'Attributes', url: '/game/attributes', icon: 'assets/icons/skills.svg' },
  { title: 'Challenges', url: '/game/challenges', icon: 'assets/icons/hydra.svg' },
  { title: 'Combat', url: '/game/combat', icon: 'assets/icons/swordman.svg' },
  { title: 'Armory', url: '/game/armory', icon: 'assets/icons/battle-gear.svg' },
  { title: 'Mansion', url: '/game/mansion', icon: 'assets/icons/capitol.svg' },
  { title: 'Trade', url: '/game/trade', icon: 'assets/icons/trade.svg' }
];

export const MENU_GUEST: MenuItem[] = [
  { title: 'About', url: '/about', icon: 'assets/icons/info.svg' },
  { title: 'Register', url: '/register', icon: 'assets/icons/user-plus.svg' }
];
