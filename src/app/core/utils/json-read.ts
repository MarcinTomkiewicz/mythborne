import { Json } from '../types/database.types';

export type JsonRecord = Record<string, Json | undefined>;

export function mapJsonArray<T>(
  value: Json | undefined,
  mapper: (row: JsonRecord) => T,
): T[] {
  return Array.isArray(value)
    ? value.flatMap((entry) => {
        const record = jsonRecord(entry);
        return record ? [mapper(record)] : [];
      })
    : [];
}

export function mapJsonObject<T>(
  value: Json | undefined,
  mapper: (row: JsonRecord) => T,
): T | null {
  const record = jsonRecord(value);
  return record ? mapper(record) : null;
}

export function jsonRecord(value: Json | undefined): JsonRecord | null {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? (value as JsonRecord)
    : null;
}

export function read(record: JsonRecord | null, ...keys: string[]): Json | undefined {
  if (!record) {
    return undefined;
  }

  for (const key of keys) {
    const value = record[key];

    if (value !== undefined) {
      return value;
    }
  }

  return undefined;
}

export function readPath(
  value: Json | undefined,
  ...path: string[]
): Json | undefined {
  return path.reduce<Json | undefined>((current, key) => {
    const record = jsonRecord(current);
    return record ? record[key] : undefined;
  }, value);
}

export function text(value: Json | undefined): string {
  return typeof value === 'string' ? value : '';
}

export function optionalText(value: Json | undefined): string | null {
  return typeof value === 'string' ? value : null;
}

export function numberValue(value: Json | undefined): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

export function optionalNumber(value: Json | undefined): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

export function booleanValue(value: Json | undefined): boolean {
  return typeof value === 'boolean' ? value : false;
}

export function optionalBoolean(value: Json | undefined): boolean | null {
  return typeof value === 'boolean' ? value : null;
}

export function jsonValue(value: Json | undefined): Json {
  return value === undefined ? {} : value;
}
