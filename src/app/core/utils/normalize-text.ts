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

export function normalizeSearchText(value: unknown): string {
  return trimToLower(value)
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ');
}

export function requiredTrimmedText(
  value: unknown,
  field: string,
  context: string,
): string {
  const trimmed = trimText(value);

  if (!trimmed) {
    throw new Error(`${field} is required for ${context}.`);
  }

  return trimmed;
}

export function humanizeKey(value: unknown, fallback = 'Value'): string {
  const label = trimText(value)
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(' ');

  return label || fallback;
}
