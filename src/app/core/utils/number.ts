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

export function optionalInteger(value: unknown): number | null {
  if (value === null || value === undefined) {
    return null;
  }

  const normalized = Math.floor(Number(value));

  return Number.isFinite(normalized) ? normalized : null;
}

export function optionalPositiveInteger(value: unknown): number | null {
  if (value === null || value === undefined) {
    return null;
  }

  const normalized = Math.floor(Number(value));

  return Number.isFinite(normalized) && normalized >= 1 ? normalized : null;
}

export function clampPercent(value: unknown): number {
  const normalized = Number(value);

  return Number.isFinite(normalized)
    ? Math.max(0, Math.min(100, normalized))
    : 0;
}

export function signedNumberLabel(value: number): string {
  return value > 0 ? `+${value}` : `${value}`;
}
