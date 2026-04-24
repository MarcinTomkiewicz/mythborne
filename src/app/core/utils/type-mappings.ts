import { toSlug } from './slug';

export function toCamelCase<T>(value: unknown): T {
  if (Array.isArray(value)) {
    return value.map((entry) => toCamelCase(entry)) as T;
  }

  if (value !== null && typeof value === 'object') {
    return Object.entries(value).reduce((acc, [key, entry]) => {
      acc[toCamelKey(key)] = toCamelCase(entry);
      return acc;
    }, {} as Record<string, unknown>) as T;
  }

  return value as T;
}

export function toSnakeCase<T>(value: unknown): T {
  if (Array.isArray(value)) {
    return value.map((entry) => toSnakeCase(entry)) as T;
  }

  if (value !== null && typeof value === 'object') {
    return Object.entries(value).reduce((acc, [key, entry]) => {
      acc[toSnakeKey(key)] = toSnakeCase(entry);
      return acc;
    }, {} as Record<string, unknown>) as T;
  }

  return value as T;
}

export function toSnakeKey(key: string): string {
  return key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

export function stringToSlug(value: string): string {
  return toSlug(value);
}

function toCamelKey(key: string): string {
  return key.replace(/_([a-z])/g, (_, char: string) => char.toUpperCase());
}
