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

export function requiredNumber(value: Json | undefined, field: string): number {
  const number = optionalNumber(value);

  if (number === null) {
    throw new Error(`${field} must be a number.`);
  }

  return number;
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

export function optionalJson(value: Json | undefined): Json | null {
  return value === undefined ? null : value;
}

export function requiredRecord(value: Json | undefined, field: string): JsonRecord {
  const record = jsonRecord(value);

  if (!record) {
    throw new Error(`${field} must be an object.`);
  }

  return record;
}

export function requiredArray(value: Json | undefined, field: string): JsonRecord[] {
  if (!Array.isArray(value)) {
    throw new Error(`${field} must be an array.`);
  }

  return value.map((entry, index) => requiredRecord(entry, `${field}[${index}]`));
}

export function requiredText(value: Json | undefined, field: string): string {
  const textValue = optionalText(value);

  if (!textValue) {
    throw new Error(`${field} must be a non-empty string.`);
  }

  return textValue;
}

export function requiredTextArray(value: Json | undefined, field: string): string[] {
  if (!Array.isArray(value)) {
    throw new Error(`${field} must be an array.`);
  }

  return value.map((entry, index) =>
    requiredText(entry, `${field}[${index}]`),
  );
}

export function requiredBoolean(value: Json | undefined, field: string): boolean {
  const booleanValue = optionalBoolean(value);

  if (booleanValue === null) {
    throw new Error(`${field} must be a boolean.`);
  }

  return booleanValue;
}

export function requiredInteger(value: Json | undefined, field: string): number {
  const number = optionalNumber(value);

  if (number === null || !Number.isInteger(number)) {
    throw new Error(`${field} must be an integer.`);
  }

  return number;
}

export function requiredNonNegativeInteger(value: Json | undefined, field: string): number {
  const number = requiredInteger(value, field);

  if (number < 0) {
    throw new Error(`${field} must be a non-negative integer.`);
  }

  return number;
}

export function optionalNonNegativeInteger(value: Json | undefined): number | null {
  if (value === null || value === undefined) {
    return null;
  }

  return requiredNonNegativeInteger(value, 'optional non-negative integer');
}

export function definedFields(record: JsonRecord): JsonRecord {
  return Object.fromEntries(
    Object.entries(record).filter(([, value]) => value !== undefined && value !== null),
  );
}
