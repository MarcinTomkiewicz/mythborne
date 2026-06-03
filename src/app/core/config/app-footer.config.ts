export const APP_FOOTER_BRAND = 'Mythsworn';
export const APP_FOOTER_SUBTITLE = 'Throne of Hellas';

export const APP_FOOTER_LINKS = [
  {
    key: 'home',
    label: 'Start',
    route: '/',
  },
  {
    key: 'login',
    label: 'Zaloguj',
    route: '/auth/login',
  },
  {
    key: 'register',
    label: 'Załóż konto',
    route: '/auth/register',
  },
  {
    key: 'server-entry',
    label: 'Wejście do gry',
    route: '/auth/server-entry',
  },
] as const;
