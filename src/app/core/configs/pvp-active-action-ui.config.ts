import {
  SUPABASE_ASSET_IMAGE_TRANSFORMS,
  supabaseStorageCssImageUrl,
} from '../config/storage-assets.config';

export const PVP_SPY_BACKGROUND_SOURCE = 'pvp-spy';

export const PVP_SPY_BACKGROUND_IMAGE = supabaseStorageCssImageUrl(
  'backgrounds/spy-background.png',
  SUPABASE_ASSET_IMAGE_TRANSFORMS.background,
);

export const PVP_SANDBOX_ATTACK_AMOUNT = 3;
export const PVP_SANDBOX_TITLE = 'Sandbox PvP';
export const PVP_SANDBOX_UNAVAILABLE =
  'Narzędzia testowe PvP są dostępne tylko na serwerze sandbox.';
export const PVP_SANDBOX_SKIP_SUCCESS =
  'Czas podróży aktywnego ataku został skrócony.';
export const PVP_SANDBOX_SKIP_ERROR =
  'Nie udało się skrócić czasu aktywnego ataku PvP.';
export const PVP_SANDBOX_ADD_ATTACKS_SUCCESS_PREFIX =
  'Dodano ataki. Dostępne ataki:';
export const PVP_SANDBOX_ADD_ATTACKS_REASON =
  'Sandbox PvP: dodanie prób ataku.';
export const PVP_SANDBOX_ADD_ATTACKS_ERROR =
  'Nie udało się dodać ataków PvP.';
