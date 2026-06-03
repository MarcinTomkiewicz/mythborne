import {
  SUPABASE_ASSET_IMAGE_TRANSFORMS,
  supabaseStorageCssImageUrl,
} from './storage-assets.config';

export interface RouteBackgroundConfig {
  readonly path: string;
  readonly image: string;
  readonly exact?: boolean;
}

const backgroundImage = (fileName: string): string =>
  supabaseStorageCssImageUrl(
    `backgrounds/${fileName}`,
    SUPABASE_ASSET_IMAGE_TRANSFORMS.background,
  );

const ENTRY_BACKGROUND_IMAGE = backgroundImage('entry-background.png');

export const ROUTE_BACKGROUNDS: readonly RouteBackgroundConfig[] = [
  {
    path: '/',
    image: backgroundImage('landing-background.png'),
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
  { path: '/hero/dashboard', image: backgroundImage('main-background.png') },
  { path: '/hero/attributes', image: backgroundImage('attributes-background.png') },
  { path: '/game/exploration', image: backgroundImage('exploration-background.png') },
  { path: '/game/armory', image: backgroundImage('armory-background.png') },
  { path: '/game/mansion', image: backgroundImage('mansion-background.png') },
  { path: '/game/vicinity', image: backgroundImage('vicinity-background.png') },
  { path: '/game/guild', image: backgroundImage('guild-background.png') },
  { path: '/game/trade', image: backgroundImage('trade-background.png') },
  { path: '/game/auction', image: backgroundImage('auction-background.png') },
  { path: '/game/reports', image: backgroundImage('reports-background.png') },
  { path: '/game/combat', image: backgroundImage('combat-background.png') },
];

export function resolveRouteBackgroundImage(url: string): string | null {
  const path = url.split(/[?#]/, 1)[0] || '/';

  return ROUTE_BACKGROUNDS.find((entry) =>
    entry.exact ? path === entry.path : path.startsWith(entry.path)
  )?.image ?? null;
}
