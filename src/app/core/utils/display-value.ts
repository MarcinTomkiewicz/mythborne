export function displayValue(
  value: string | number | boolean | null | undefined,
): string {
  if (value === null || value === undefined || value === '') {
    return '-';
  }

  return String(value);
}
