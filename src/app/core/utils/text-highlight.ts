import { TextHighlightPart } from '../types/text-highlight.types';
import { normalizeSearchText } from './normalize-text';

export function highlightTextParts(
  value: string,
  normalizedTerm: string,
): TextHighlightPart[] {
  if (!normalizedTerm) {
    return [{ text: value, isMatch: false }];
  }

  const normalizedValue = normalizeSearchText(value);
  const start = normalizedValue.indexOf(normalizedTerm);

  if (start < 0) {
    return [{ text: value, isMatch: false }];
  }

  const end = start + normalizedTerm.length;

  return [
    { text: value.slice(0, start), isMatch: false },
    { text: value.slice(start, end), isMatch: true },
    { text: value.slice(end), isMatch: false },
  ].filter((part) => part.text.length > 0);
}
