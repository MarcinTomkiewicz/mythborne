import { environment } from '../../../environments/environment';

export interface SupabaseImageTransformOptions {
  readonly width: number;
  readonly quality: number;
}

export interface SupabaseImageDimensions {
  readonly width: number;
  readonly height: number;
}

export const SUPABASE_ASSET_BUCKET = 'assets';

export const SUPABASE_ASSET_IMAGE_TRANSFORMS = {
  background: { width: 1920, quality: 80 },
  card: { width: 800, quality: 80 },
  originCard: { width: 800, quality: 80 },
  buildingCard: { width: 800, quality: 80 },
  paperdoll: { width: 800, quality: 80 },
} as const satisfies Record<string, SupabaseImageTransformOptions>;

export const SUPABASE_ASSET_IMAGE_DIMENSIONS = {
  originCard: { width: 800, height: 1254 },
  buildingCard: { width: 800, height: 800 },
  paperdoll: { width: 800, height: 1200 },
} as const satisfies Record<string, SupabaseImageDimensions>;

const SUPABASE_PUBLIC_ASSET_BASE_URL =
  `${environment.supabaseUrl}/storage/v1/object/public/${SUPABASE_ASSET_BUCKET}`;
const SUPABASE_RENDER_ASSET_BASE_URL =
  `${environment.supabaseUrl}/storage/v1/render/image/public/${SUPABASE_ASSET_BUCKET}`;

const STORAGE_BACKED_LOCAL_IMAGE_PREFIXES = [
  'backgrounds/',
  'buildings/district-a/',
  'origins/',
  'paperdolls/',
] as const;

export function supabaseStoragePublicAssetUrl(path: string): string {
  return `${SUPABASE_PUBLIC_ASSET_BASE_URL}/${normalizeAssetPath(path)}`;
}

export function supabaseStorageImageUrl(
  path: string,
  options: SupabaseImageTransformOptions,
): string {
  const normalizedPath = normalizeAssetPath(path);

  return `${SUPABASE_RENDER_ASSET_BASE_URL}/${normalizedPath}?width=${options.width}&quality=${options.quality}`;
}

export function supabaseStorageCssImageUrl(
  path: string,
  options: SupabaseImageTransformOptions,
): string {
  return `url('${supabaseStorageImageUrl(path, options)}')`;
}

export function storageBackedImageUrl(
  pathOrUrl: string,
  options: SupabaseImageTransformOptions,
): string {
  const assetPath = localImagePathToStorageAssetPath(pathOrUrl);

  return assetPath ? supabaseStorageImageUrl(assetPath, options) : pathOrUrl;
}

function normalizeAssetPath(path: string): string {
  return path.replace(/^\/+/, '');
}

function localImagePathToStorageAssetPath(pathOrUrl: string): string | null {
  const localPath = pathOrUrl.replace(/^\/images\//, '');

  return STORAGE_BACKED_LOCAL_IMAGE_PREFIXES.some((prefix) => localPath.startsWith(prefix))
    ? localPath
    : null;
}
