import {
  booleanValue,
  jsonRecord,
  jsonValue,
  mapJsonArray,
  mapJsonObject,
  numberValue,
  optionalBoolean,
  optionalNumber,
  optionalText,
  read,
  text,
} from './json-read';

describe('json-read helpers', () => {
  it('narrows JSON records and rejects arrays or scalar values', () => {
    const record = jsonRecord({ id: 'value' });

    expect(record ? text(record['id']) : null).toBe('value');
    expect(jsonRecord(['value'])).toBeNull();
    expect(jsonRecord('value')).toBeNull();
    expect(jsonRecord(null)).toBeNull();
  });

  it('maps JSON object and array values through guarded record readers', () => {
    const object = mapJsonObject({ id: 'object-1' }, (row) => text(row['id']));
    const array = mapJsonArray([{ id: 'row-1' }, 'bad-row', { id: 'row-2' }], (row) =>
      text(row['id']),
    );

    expect(object).toBe('object-1');
    expect(array).toEqual(['row-1', 'row-2']);
    expect(mapJsonObject(['bad'], () => 'bad')).toBeNull();
    expect(mapJsonArray({ id: 'not-array' }, () => 'bad')).toEqual([]);
  });

  it('reads the first defined key and maps primitive fallback values', () => {
    const record = jsonRecord({
      empty: null,
      primary: undefined,
      secondary: 'value',
      count: 3,
      enabled: true,
      payload: { nested: true },
    });

    expect(text(read(record, 'primary', 'secondary'))).toBe('value');
    expect(read(record, 'empty') as unknown).toBeNull();
    expect(text(read(record, 'secondary'))).toBe('value');
    expect(text(read(record, 'missing'))).toBe('');
    expect(optionalText(read(record, 'missing'))).toBeNull();
    expect(numberValue(read(record, 'count'))).toBe(3);
    expect(numberValue(read(record, 'secondary'))).toBe(0);
    expect(optionalNumber(read(record, 'missing'))).toBeNull();
    expect(booleanValue(read(record, 'enabled'))).toBeTrue();
    expect(booleanValue(read(record, 'missing'))).toBeFalse();
    expect(optionalBoolean(read(record, 'missing'))).toBeNull();
    expect(jsonValue(read(record, 'payload')) as unknown).toEqual({ nested: true });
    expect(jsonValue(read(record, 'missing')) as unknown).toEqual({});
  });
});
