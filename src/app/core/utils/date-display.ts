export function toDateTimeLabel(value: string): string {
  return new Date(value).toLocaleString();
}
