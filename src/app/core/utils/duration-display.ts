export function toShortDurationLabel(totalSeconds: number | null | undefined): string {
  if (typeof totalSeconds !== 'number' || !Number.isFinite(totalSeconds)) {
    return '';
  }

  const normalizedSeconds = Math.max(0, Math.floor(totalSeconds));

  if (normalizedSeconds < 60) {
    return `${normalizedSeconds} s`;
  }

  const totalMinutes = Math.floor(normalizedSeconds / 60);
  const seconds = normalizedSeconds % 60;

  if (totalMinutes < 60) {
    return seconds === 0
      ? `${totalMinutes} min`
      : `${totalMinutes} min ${seconds} s`;
  }

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return minutes === 0 ? `${hours} h` : `${hours} h ${minutes} min`;
}
