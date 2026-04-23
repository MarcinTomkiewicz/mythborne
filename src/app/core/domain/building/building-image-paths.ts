import { trimToLower, trimToUpper } from '../../utils/normalize-text';

const BUILDING_IMAGE_PATHS: Record<string, Record<string, string>> = {
  A: {
    agora: '/images/buildings/district-a/agora.png',
    armory: '/images/buildings/district-a/armory.png',
    barracks: '/images/buildings/district-a/barracks.png',
    farm: '/images/buildings/district-a/farm.png',
    fortress: '/images/buildings/district-a/fortress.png',
    'lumber-mill': '/images/buildings/district-a/lumber-mill.png',
    'trade-route': '/images/buildings/district-a/trade-routes.png',
    'trade-routes': '/images/buildings/district-a/trade-routes.png',
  },
};

export function resolveBuildingImagePath(
  key: string | null | undefined,
  districtCode: string | null | undefined
): string | null {
  const normalizedKey = trimToLower(key);
  const normalizedDistrict = trimToUpper(districtCode);

  if (!normalizedKey || !normalizedDistrict) {
    return null;
  }

  return BUILDING_IMAGE_PATHS[normalizedDistrict]?.[normalizedKey] ?? null;
}
