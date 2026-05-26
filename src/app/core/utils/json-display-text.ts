import { Json } from '../types/database.types';
import { JsonRecord, optionalText, read } from './json-read';

export function firstText(
  record: JsonRecord | null,
  ...keys: string[]
): string | null {
  for (const key of keys) {
    const value = optionalText(read(record, key));

    if (value?.trim()) {
      return value.trim();
    }
  }

  return null;
}

export function firstTextInRecords(
  records: Array<JsonRecord | null>,
  ...keys: string[]
): string | null {
  for (const record of records) {
    const value = firstText(record, ...keys);

    if (value) {
      return value;
    }
  }

  return null;
}

export function firstTextArray(
  record: JsonRecord | null,
  ...keys: string[]
): string[] {
  for (const key of keys) {
    const value = read(record, key);

    if (Array.isArray(value)) {
      const lines = value.flatMap((entry) =>
        typeof entry === 'string' ? textLines(entry) : [],
      );

      if (lines.length) {
        return lines;
      }
    }

    if (typeof value === 'string') {
      const lines = textLines(value);

      if (lines.length) {
        return lines;
      }
    }
  }

  return [];
}

function textLines(value: Json): string[] {
  return typeof value === 'string'
    ? value
      .split(/\r?\n+/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
    : [];
}
