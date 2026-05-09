import {
  humanizeKey,
  requiredTrimmedText,
} from './normalize-text';

describe('normalize text helpers', () => {
  it('returns required trimmed text or throws with workflow context', () => {
    expect(requiredTrimmedText(' value ', 'field', 'test workflow')).toBe('value');
    expect(() => requiredTrimmedText(' ', 'field', 'test workflow'))
      .toThrowError('field is required for test workflow.');
  });

  it('humanizes technical keys with a fallback for empty input', () => {
    expect(humanizeKey('session_completed')).toBe('Session Completed');
    expect(humanizeKey('manual-combat')).toBe('Manual Combat');
    expect(humanizeKey('', 'Event')).toBe('Event');
  });
});
