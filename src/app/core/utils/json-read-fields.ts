import type { JsonRecord } from './json-read-record';
import { read, requiredRecord } from './json-read-record';
import { requiredText } from './json-read-primitives';

export function requiredRecordField(
  record: JsonRecord,
  key: string,
  parentField: string,
): JsonRecord {
  return requiredRecord(read(record, key), `${parentField}.${key}`);
}

export function requiredTextFields<const Key extends string>(
  record: JsonRecord,
  parentField: string,
  keys: readonly Key[],
): Record<Key, string> {
  return Object.fromEntries(
    keys.map((key) => [
      key,
      requiredText(read(record, key), `${parentField}.${key}`),
    ]),
  ) as Record<Key, string>;
}
