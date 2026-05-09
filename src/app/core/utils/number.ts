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

export function optionalNonNegativeInteger(value: unknown): number | null {
  if (value === null || value === undefined) {
    return null;
  }

  const normalized = Math.floor(Number(value));

  return Number.isFinite(normalized) && normalized >= 0 ? normalized : null;
}

export function clampPercent(value: unknown): number {
  const normalized = Number(value);

  return Number.isFinite(normalized)
    ? Math.max(0, Math.min(100, normalized))
    : 0;
}
