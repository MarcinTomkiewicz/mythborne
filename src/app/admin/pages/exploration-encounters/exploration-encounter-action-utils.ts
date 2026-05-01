import { Json } from '../../../core/types/database.types';
import { trimText } from '../../../core/utils/normalize-text';

export function parseMetadataJson(value: string, setError: (message: string) => void): Json | null {
  try {
    const parsed = JSON.parse(value || '{}');

    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      throw new Error('Metadata must be a JSON object.');
    }

    return parsed as Json;
  } catch {
    setError('Metadata must be a valid JSON object.');
    return null;
  }
}

export function requiredFormValue(value: string | null, label: string): string {
  const normalized = trimText(value);

  if (!normalized) {
    throw new Error(`${label} is required.`);
  }

  return normalized;
}
