import { Json } from '../types/database.types';

export type JsonRecord = { [key: string]: Json | undefined };

export function requiredJsonRecord(value: Json | undefined, label: string): JsonRecord {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`DB ${label} is missing or malformed.`);
  }

  return value;
}

export function requiredJsonArray(value: Json | undefined, label: string): Json[] {
  if (!Array.isArray(value)) {
    throw new Error(`DB ${label} is missing or malformed.`);
  }

  return value;
}

export function requiredJsonString(record: JsonRecord, key: string): string {
  const value = record[key];

  if (typeof value !== 'string') {
    throw new Error(`DB field "${key}" is missing or malformed.`);
  }

  return value;
}

export function optionalJsonString(record: JsonRecord, key: string): string | null {
  const value = record[key];

  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value !== 'string') {
    throw new Error(`DB field "${key}" is malformed.`);
  }

  return value;
}

export function requiredJsonNumber(record: JsonRecord, key: string): number {
  const value = record[key];

  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new Error(`DB field "${key}" is missing or malformed.`);
  }

  return value;
}
