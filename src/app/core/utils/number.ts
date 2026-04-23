export function roundedNumber(value: unknown, fallback = 0): number {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? Math.round(numeric) : fallback;
}

export function integerAtLeast(value: unknown, min: number, fallback = min): number {
  return Math.max(min, roundedNumber(value, fallback));
}

export function nonNegativeInteger(value: unknown): number {
  return integerAtLeast(value, 0);
}

export function positiveInteger(value: unknown): number {
  return integerAtLeast(value, 1);
}
