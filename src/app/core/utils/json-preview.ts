import { Json } from '../types/database.types';

export function formatJsonPreview(value: Json | null, nullLabel: string): string {
  if (value === null) {
    return nullLabel;
  }

  if (typeof value !== 'object') {
    return String(value);
  }

  return JSON.stringify(value, null, 2);
}

export function parseJsonInput(value: string, errorMessage: string): Json {
  try {
    return JSON.parse(value.trim()) as Json;
  } catch {
    throw new Error(errorMessage);
  }
}
