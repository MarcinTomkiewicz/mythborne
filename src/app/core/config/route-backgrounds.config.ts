export interface RouteBackgroundConfig {
  readonly path: string;
  readonly image: string;
  readonly exact?: boolean;
}

const ENTRY_BACKGROUND_IMAGE = "url('/images/backgrounds/entry-background.png')";

export const ROUTE_BACKGROUNDS: readonly RouteBackgroundConfig[] = [
  {
    path: '/',
    image: "url('/images/backgrounds/landing-background.png')",
    exact: true,
  },
  {
    path: '/auth/login',
    image: ENTRY_BACKGROUND_IMAGE,
    exact: true,
  },
  {
    path: '/auth/register',
    image: ENTRY_BACKGROUND_IMAGE,
    exact: true,
  },
  {
    path: '/auth/server-entry',
    image: ENTRY_BACKGROUND_IMAGE,
    exact: true,
  },
  {
    path: '/auth/create-character',
    image: ENTRY_BACKGROUND_IMAGE,
    exact: true,
  },
  { path: '/hero/dashboard', image: "url('/images/backgrounds/main-background.png')" },
  { path: '/hero/attributes', image: "url('/images/backgrounds/attributes-background.png')" },
  { path: '/game/exploration', image: "url('/images/backgrounds/exploration-background.png')" },
  { path: '/game/armory', image: "url('/images/backgrounds/armory-background.png')" },
  { path: '/game/mansion', image: "url('/images/backgrounds/mansion-background.png')" },
  { path: '/game/vicinity', image: "url('/images/backgrounds/vicinity-background.png')" },
  { path: '/game/guild', image: "url('/images/backgrounds/guild-background.png')" },
  { path: '/game/trade', image: "url('/images/backgrounds/trade-background.png')" },
  { path: '/game/auction', image: "url('/images/backgrounds/auction-background.png')" },
  { path: '/game/reports', image: "url('/images/backgrounds/reports-background.png')" },
  { path: '/game/combat', image: "url('/images/backgrounds/combat-background.png')" },
];

export function resolveRouteBackgroundImage(url: string): string | null {
  const path = url.split(/[?#]/, 1)[0] || '/';

  return ROUTE_BACKGROUNDS.find((entry) =>
    entry.exact ? path === entry.path : path.startsWith(entry.path)
  )?.image ?? null;
}
