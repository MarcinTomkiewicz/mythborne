import {
  optionalJsonString,
  requiredJsonArray,
  requiredJsonNumber,
  requiredJsonRecord,
  requiredJsonString,
} from './json-field-readers';

describe('json field readers', () => {
  it('reads required records, arrays and primitive fields from DB JSON', () => {
    const record = requiredJsonRecord({
      name: 'Bandit',
      level: 5,
      optional: null,
      slots: [],
    }, 'snapshot');

    expect(requiredJsonString(record, 'name')).toBe('Bandit');
    expect(requiredJsonNumber(record, 'level')).toBe(5);
    expect(optionalJsonString(record, 'optional')).toBeNull();
    expect(requiredJsonArray(record['slots'], 'slots').length).toBe(0);
  });

  it('throws readable errors for malformed DB JSON fields', () => {
    expect(() => requiredJsonRecord([], 'snapshot')).toThrowError(
      'DB snapshot is missing or malformed.',
    );
    expect(() => requiredJsonString({}, 'name')).toThrowError(
      'DB field "name" is missing or malformed.',
    );
    expect(() => optionalJsonString({ name: 5 }, 'name')).toThrowError(
      'DB field "name" is malformed.',
    );
    expect(() => requiredJsonNumber({ level: Number.NaN }, 'level')).toThrowError(
      'DB field "level" is missing or malformed.',
    );
  });
});
