import { Json } from '../types/database.types';
import { jsonRecord, read } from './json-read-record';

export * from './json-read-array';
export * from './json-read-fields';
export * from './json-read-primitives';
export * from './json-read-record';
export * from './json-read-value';

export function rowsValue(value: Json | undefined, key = 'rows'): Json | undefined {
  const record = jsonRecord(value);

  return record ? read(record, key) : value;
}
