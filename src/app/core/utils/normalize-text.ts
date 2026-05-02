export function trimText(value: unknown): string {
  return String(value ?? '').trim();
}

export function trimToNull(value: unknown): string | null {
  const trimmed = trimText(value);
  return trimmed.length > 0 ? trimmed : null;
}

export function trimToLower(value: unknown): string {
  return trimText(value).toLowerCase();
}

export function trimToUpper(value: unknown): string {
  return trimText(value).toUpperCase();
}

export function normalizeKeyText(value: unknown): string {
  return trimToLower(value).replace(/[\s-]+/g, '_');
}
