import { Json } from '../types/database.types';

export type GameReportJsonRecord = { [key: string]: Json | undefined };

export function readJsonField(
  record: GameReportJsonRecord,
  key: string,
): Json | undefined {
  return record[key];
}

export function requiredJsonArray(value: Json | undefined, fieldName: string): Json[] {
  if (!Array.isArray(value)) {
    throw new Error(`${fieldName} must be a JSON array.`);
  }

  return value;
}

export function requiredJsonRecord(
  value: Json | undefined,
  fieldName: string,
): GameReportJsonRecord {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`${fieldName} must be a JSON object.`);
  }

  return value;
}

export function requiredJsonString(value: Json | undefined, fieldName: string): string {
  if (typeof value !== 'string' || value.length === 0) {
    throw new Error(`${fieldName} must be a non-empty string.`);
  }

  return value;
}

export function optionalJsonString(value: Json | undefined): string | null {
  return typeof value === 'string' && value.length > 0 ? value : null;
}

export function requiredJsonNumber(value: Json | undefined, fieldName: string): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new Error(`${fieldName} must be a number.`);
  }

  return value;
}

export function optionalJsonNumber(value: Json | undefined): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

export function optionalJsonBoolean(value: Json | undefined): boolean | null {
  return typeof value === 'boolean' ? value : null;
}

export function nullableText(value: string | null): string | null {
  return typeof value === 'string' && value.length > 0 ? value : null;
}
