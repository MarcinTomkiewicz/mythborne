import { RewardDictionaryReadModel } from '../domain/exploration/exploration-reward.model';
import { SelectOption } from '../types/select-option.types';

export function optionsFromValues(values: readonly string[]): Array<SelectOption<string>> {
  return Array.from(new Set(values.filter(Boolean))).sort().map((value) => ({
    label: labelFromKey(value),
    value,
  }));
}

export function dictionaryOptions(
  dictionary: RewardDictionaryReadModel[],
  fallbackValues: readonly string[],
): Array<SelectOption<string>> {
  const active = dictionary
    .filter((entry) => entry.isActive)
    .map((entry) => ({
      label: `${entry.label} (${entry.key})`,
      value: entry.key,
    }));

  return active.length > 0 ? active : optionsFromValues(fallbackValues);
}

export function dictionaryHelp(
  dictionary: RewardDictionaryReadModel[],
  key: string | null | undefined,
): string | null {
  const entry = dictionary.find((row) => row.key === key);

  return entry?.description ?? entry?.helperText ?? entry?.adminDescription ?? null;
}

export function labelFromKey(key: string): string {
  return key
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(' ') || key;
}
