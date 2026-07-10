import { trimToNull } from './normalize-text';

export function createRequestId(prefix: string): string {
  const randomId = globalThis.crypto?.randomUUID?.()
    ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  return `${prefix}:${randomId}`;
}

export function normalizeOrCreateRequestId(
  value: string | null | undefined,
  prefix: string,
): string {
  return trimToNull(value) ?? createRequestId(prefix);
}
