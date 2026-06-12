import {
  SUPABASE_ASSET_IMAGE_TRANSFORMS,
  supabaseStorageCssImageUrl,
} from '../config/storage-assets.config';

export const PVP_SPY_BACKGROUND_SOURCE = 'pvp-spy';

export const PVP_SPY_BACKGROUND_IMAGE = supabaseStorageCssImageUrl(
  'backgrounds/spy-background.png',
  SUPABASE_ASSET_IMAGE_TRANSFORMS.background,
);
