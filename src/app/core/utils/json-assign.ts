export function assignText<T extends object, K extends keyof T>(
  target: T,
  key: K,
  value: string | null,
): void {
  if (value !== null) {
    target[key] = value as T[K];
  }
}

export function assignNumber<T extends object, K extends keyof T>(
  target: T,
  key: K,
  value: number | null,
): void {
  if (value !== null) {
    target[key] = value as T[K];
  }
}

export function assignBoolean<T extends object, K extends keyof T>(
  target: T,
  key: K,
  value: boolean | null,
): void {
  if (value !== null) {
    target[key] = value as T[K];
  }
}
