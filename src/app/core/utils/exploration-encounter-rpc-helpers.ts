import { trimText, trimToNull } from './normalize-text';

export function requiredText(value: string | null | undefined, field: string): string {
  const normalized = trimText(value);

  if (!normalized) {
    throw new Error(`${field} is required for encounter configuration workflow.`);
  }

  return normalized;
}

export function integer(value: number | null | undefined, field: string): number {
  const normalized = Math.floor(Number(value));

  if (!Number.isFinite(normalized)) {
    throw new Error(`${field} must be a number for encounter configuration workflow.`);
  }

  return normalized;
}

export function positiveNumber(value: number | null | undefined, field: string): number {
  const normalized = Number(value);

  if (!Number.isFinite(normalized) || normalized <= 0) {
    throw new Error(`${field} must be positive for encounter configuration workflow.`);
  }

  return normalized;
}

export function percent(value: number | null | undefined, field: string): number {
  const normalized = Number(value);

  if (!Number.isFinite(normalized) || normalized < 0 || normalized > 100) {
    throw new Error(`${field} must be between 0 and 100 for encounter configuration workflow.`);
  }

  return normalized;
}

export function addOptionalText<T extends Record<string, unknown>, K extends keyof T>(
  target: T,
  key: K,
  value: string | null | undefined,
): void {
  const normalized = trimToNull(value);

  if (normalized) {
    target[key] = normalized as T[K];
  }
}

export function addOptionalNumber<T extends Record<string, unknown>, K extends keyof T>(
  target: T,
  key: K,
  value: number | null | undefined,
): void {
  if (value === null || value === undefined) {
    return;
  }

  const normalized = Number(value);

  if (Number.isFinite(normalized)) {
    target[key] = normalized as T[K];
  }
}

export function addOptionalInteger<T extends Record<string, unknown>, K extends keyof T>(
  target: T,
  key: K,
  value: number | null | undefined,
): void {
  if (value === null || value === undefined) {
    return;
  }

  const normalized = Math.floor(Number(value));

  if (Number.isFinite(normalized)) {
    target[key] = normalized as T[K];
  }
}
