import {
  clampPercent,
  optionalNonNegativeInteger,
  optionalPositiveInteger,
} from './number';

describe('number helpers', () => {
  it('normalizes optional non-negative integers', () => {
    expect(optionalNonNegativeInteger(null)).toBeNull();
    expect(optionalNonNegativeInteger(undefined)).toBeNull();
    expect(optionalNonNegativeInteger(3.9)).toBe(3);
    expect(optionalNonNegativeInteger('4')).toBe(4);
    expect(optionalNonNegativeInteger(-1)).toBeNull();
    expect(optionalNonNegativeInteger('bad')).toBeNull();
  });

  it('normalizes optional positive integers', () => {
    expect(optionalPositiveInteger(null)).toBeNull();
    expect(optionalPositiveInteger(undefined)).toBeNull();
    expect(optionalPositiveInteger(3.9)).toBe(3);
    expect(optionalPositiveInteger('4')).toBe(4);
    expect(optionalPositiveInteger(0)).toBeNull();
    expect(optionalPositiveInteger(-1)).toBeNull();
    expect(optionalPositiveInteger('bad')).toBeNull();
  });

  it('clamps percent values to the 0-100 range', () => {
    expect(clampPercent(-10)).toBe(0);
    expect(clampPercent(42)).toBe(42);
    expect(clampPercent(120)).toBe(100);
    expect(clampPercent('bad')).toBe(0);
  });
});
