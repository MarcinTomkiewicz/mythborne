import { SidebarNavGroup } from '../interfaces/layout/sidebar.interface';

export const MENU_LOGGED_IN_GROUPS: readonly SidebarNavGroup[] = [
  {
    title: 'Bohater',
    items: [
      { kind: 'link', label: 'Panel', route: '/hero/dashboard', iconClass: 'pi pi-helmet' },
      { kind: 'link', label: 'Atrybuty', route: '/hero/attributes', iconClass: 'pi pi-skills' },
      { kind: 'link', label: 'Eksploracja', route: '/game/exploration', iconClass: 'pi pi-hydra' },
      { kind: 'link', label: 'Zbrojownia', route: '/game/armory', iconClass: 'pi pi-chest' },
      { kind: 'link', label: 'Posiadłość', route: '/game/mansion', iconClass: 'pi pi-capitol' },
    ],
  },
  {
    title: 'Świat',
    items: [
      { kind: 'link', label: 'Okolica', route: '/game/vicinity', iconClass: 'pi pi-trail' },
      { kind: 'link', label: 'Gildia', route: '/game/guild', iconClass: 'pi pi-overlord' },
      { kind: 'link', label: 'Raporty', route: '/game/reports', iconClass: 'pi pi-tied-scroll' },
      { kind: 'link', label: 'Handel', route: '/game/trade', iconClass: 'pi pi-trade' },
      { kind: 'link', label: 'Aukcje', route: '/game/auction', iconClass: 'pi pi-shop-bag' },
    ],
  },
  {
    title: 'Operacje',
    items: [
      { kind: 'link', label: 'Administracja', route: '/admin', iconClass: 'pi pi-d20' },
    ],
  },
];
