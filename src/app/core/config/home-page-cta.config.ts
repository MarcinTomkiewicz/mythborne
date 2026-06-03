export const HOME_PAGE_GUEST_CTA = {
  primary: {
    label: 'Zaloguj',
    icon: 'pi pi-sign-in',
    route: '/auth/login',
  },
  secondary: {
    label: 'Załóż konto',
    icon: 'pi pi-user-plus',
    route: '/auth/register',
  },
} as const;

export const HOME_PAGE_AUTHENTICATED_CTA = {
  primary: {
    label: 'Wejdź do gry',
    icon: 'pi pi-play',
    route: '/auth/server-entry',
  },
  secondary: {
    label: 'Stwórz bohatera',
    icon: 'pi pi-user-plus',
    route: '/auth/server-entry',
  },
} as const;
