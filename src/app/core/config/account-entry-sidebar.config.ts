import {
  AccountEntrySidebarContextKey,
  SidebarContextRowConfig,
  SidebarNavGroup,
} from '../interfaces/layout/sidebar.interface';

export const ACCOUNT_ENTRY_SIDEBAR_CONTEXT_ROWS: readonly SidebarContextRowConfig<AccountEntrySidebarContextKey>[] =
  [
    {
      key: 'account',
      label: 'Zalogowano jako',
    },
    {
      key: 'server',
      label: 'Wybrany serwer',
    },
    {
      key: 'hero',
      label: 'Bohater do wejścia',
    },
  ];

export const ACCOUNT_ENTRY_SIDEBAR_NAV_GROUPS: readonly SidebarNavGroup[] = [
  {
    title: 'Wejście',
    items: [
      {
        kind: 'link',
        label: 'Wejdź do gry',
        route: '/auth/server-entry',
        iconClass: 'pi pi-teleport',
      },
      {
        kind: 'link',
        label: 'Stwórz bohatera',
        route: '/auth/create-character',
        iconClass: 'pi pi-laurels',
      },
    ],
  },
  {
    title: 'Konto',
    items: [
      {
        kind: 'button',
        label: 'Ustawienia konta',
        iconClass: 'pi pi-settings',
        badgeLabel: 'wkrótce',
        badgeTone: 'muted',
        disabled: true,
      },
      {
        kind: 'button',
        label: 'Powiadomienia',
        iconClass: 'pi pi-notification-icon',
        badgeLabel: 'wkrótce',
        badgeTone: 'muted',
        disabled: true,
      },
      {
        kind: 'logout',
      },
    ],
  },
];
