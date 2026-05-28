export function activeProtectionLabel(input: {
  isActive: boolean | null | undefined;
  expiresAt: string | null | undefined;
}): string {
  return input.isActive && input.expiresAt
    ? `do ${formatTimeLabel(input.expiresAt)}`
    : 'Brak aktywnej ochrony';
}

export function formatTimeLabel(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value.slice(0, 8);
  }

  return [
    date.getHours(),
    date.getMinutes(),
    date.getSeconds(),
  ].map((part) => String(part).padStart(2, '0')).join(':');
}
