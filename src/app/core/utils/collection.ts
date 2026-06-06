export function uniqueSorted<T extends string>(values: readonly T[]): T[] {
  return Array.from(new Set(values)).sort((left, right) => left.localeCompare(right));
}

export function uniqueInOrder<T>(values: readonly T[]): T[] {
  return Array.from(new Set(values));
}

export function toSelectOptions<T extends string | number>(
  values: readonly T[],
): Array<{ label: string; value: T }> {
  return values.map((value) => ({
    label: String(value),
    value,
  }));
}
