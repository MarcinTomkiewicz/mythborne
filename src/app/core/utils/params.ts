export function readParamNumber(params: unknown, key: string): number | null {
  if (!params || typeof params !== 'object' || Array.isArray(params)) {
    return null;
  }

  const value = Number((params as Record<string, unknown>)[key]);
  return Number.isFinite(value) ? value : null;
}
