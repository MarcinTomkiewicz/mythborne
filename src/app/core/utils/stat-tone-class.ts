export type StatTone = 'neutral' | 'positive' | 'negative';

export function statTone(value: unknown): StatTone {
  return value === 'positive' || value === 'negative' ? value : 'neutral';
}

export function toneTextClass(
  tone: StatTone,
  textSizeClass = '',
): string {
  const colorClass = tone === 'positive'
    ? 'success-text'
    : tone === 'negative'
      ? 'error-text'
      : 'color-heading';

  return [colorClass, textSizeClass].filter(Boolean).join(' ');
}

export function colorableToneTextClass(
  tone: StatTone,
  colorableFinalValue: boolean,
  textSizeClass = '',
): string {
  return toneTextClass(colorableFinalValue ? tone : 'neutral', textSizeClass);
}
