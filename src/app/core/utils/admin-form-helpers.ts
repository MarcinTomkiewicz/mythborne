import { WritableSignal } from '@angular/core';
import { Json } from '../types/database.types';

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

export function markReasonInvalid(
  reasonError: WritableSignal<string | null>,
  reason: { markAsTouched: () => void; value: string | null },
): boolean {
  reason.markAsTouched();

  if (typeof reason.value === 'string' && reason.value.trim().length > 0) {
    reasonError.set(null);
    return false;
  }

  reasonError.set('Reason is required for this admin mutation.');
  return true;
}

export function nextSortOrder<T>(rows: T[], read: (row: T) => number): number {
  return rows.reduce((max, row) => Math.max(max, read(row)), 0) + 10;
}
