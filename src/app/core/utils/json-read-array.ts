import { Json } from '../types/database.types';
import { JsonRecord, jsonRecord, requiredRecord } from './json-read-record';
import { requiredText } from './json-read-primitives';

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

export function requiredArray(value: Json | undefined, field: string): JsonRecord[] {
  if (!Array.isArray(value)) {
    throw new Error(`${field} must be an array.`);
  }

  return value.map((entry, index) => requiredRecord(entry, `${field}[${index}]`));
}

export function optionalRecordArray(value: Json | undefined, field: string): JsonRecord[] {
  if (value === undefined || value === null) {
    return [];
  }

  return requiredArray(value, field);
}

export function requiredTextArray(value: Json | undefined, field: string): string[] {
  if (!Array.isArray(value)) {
    throw new Error(`${field} must be an array.`);
  }

  return value.map((entry, index) =>
    requiredText(entry, `${field}[${index}]`),
  );
}

export function optionalTextArray(value: Json | undefined, field: string): string[] {
  if (value === undefined || value === null) {
    return [];
  }

  return requiredTextArray(value, field);
}

export function requireJsonArray(value: Json | undefined, field: string): Json[] {
  if (!Array.isArray(value)) {
    throw new Error(`${field} must be an array.`);
  }

  return value;
}
