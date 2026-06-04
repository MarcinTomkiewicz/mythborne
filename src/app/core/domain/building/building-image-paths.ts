import {
  supabaseStoragePublicAssetUrl,
} from '../../config/storage-assets.config';
import { trimToLower, trimToUpper } from '../../utils/normalize-text';

const BUILDING_IMAGE_ASSET_PATHS: Record<string, Record<string, string>> = {
  A: {
    agora: 'buildings/district-a/agora.png',
    armory: 'buildings/district-a/armory.png',
    barracks: 'buildings/district-a/barracks.png',
    farm: 'buildings/district-a/farm.png',
    fortress: 'buildings/district-a/fortress.png',
    'lumber-mill': 'buildings/district-a/lumber-mill.png',
    'trade-route': 'buildings/district-a/trade-routes.png',
    'trade-routes': 'buildings/district-a/trade-routes.png',
    hippokaion: 'buildings/district-a/hippocaion.png',
  },
};

export function resolveBuildingImagePath(
  key: string | null | undefined,
  districtCode: string | null | undefined
): string | null {
  const assetPath = resolveBuildingAssetPath(key, districtCode);

  return assetPath
    ? supabaseStoragePublicAssetUrl(assetPath)
    : null;
}

export function resolveBuildingLocalImagePath(
  key: string | null | undefined,
  districtCode: string | null | undefined
): string | null {
  const assetPath = resolveBuildingAssetPath(key, districtCode);

  return assetPath ? `/images/${assetPath}` : null;
}

function resolveBuildingAssetPath(
  key: string | null | undefined,
  districtCode: string | null | undefined
): string | null {
  const normalizedKey = trimToLower(key);
  const normalizedDistrict = trimToUpper(districtCode);

  if (!normalizedKey || !normalizedDistrict) {
    return null;
  }

  return BUILDING_IMAGE_ASSET_PATHS[normalizedDistrict]?.[normalizedKey] ?? null;
}
