import { Json } from '../types/database.types';

export type JsonRecord = Record<string, Json | undefined>;

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

export function readPath(value: Json | undefined, ...path: string[]): Json | undefined {
  return path.reduce<Json | undefined>((current, key) => {
    const record = jsonRecord(current);
    return record ? record[key] : undefined;
  }, value);
}

export function requiredRecord(value: Json | undefined, field: string): JsonRecord {
  const record = jsonRecord(value);

  if (!record) {
    throw new Error(`${field} must be an object.`);
  }

  return record;
}

export function definedFields(record: JsonRecord): JsonRecord {
  return Object.fromEntries(
    Object.entries(record).filter(([, value]) => value !== undefined && value !== null),
  );
}
