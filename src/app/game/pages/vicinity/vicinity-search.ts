import type { VicinityAddressSearch } from '../../../core/types/vicinity.types';

const ADDRESS_SEARCH_PATTERN = /^\s*([a-z])\s*-\s*(\d+)\s*$/i;

export function parseVicinityAddressSearch(value: string): VicinityAddressSearch | null {
  const match = ADDRESS_SEARCH_PATTERN.exec(value);

  if (!match) {
    return null;
  }

  return {
    districtCode: match[1].toUpperCase(),
    addressNumber: Number(match[2]),
  };
}

export function normalizeVicinitySearch(value: string | null | undefined): string {
  return typeof value === 'string' ? value.trim() : '';
}
