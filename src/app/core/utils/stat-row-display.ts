import type { Json } from '../types/database.types';

export interface SortOrderRow {
  sortOrder: number;
}

export function sortBySortOrder<T extends SortOrderRow>(rows: readonly T[]): T[] {
  return rows.slice().sort((first, second) => first.sortOrder - second.sortOrder);
}

export function displayScalar(value: Json | undefined): string | number | null {
  return typeof value === 'string' || typeof value === 'number' ? value : null;
}

export function displayText(value: string | number | null): string {
  return value === null ? '' : `${value}`;
}
