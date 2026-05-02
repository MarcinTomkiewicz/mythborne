import { ResourceTypeReadModel } from '../domain/exploration/exploration-reward.model';
import { SelectOption } from '../types/select-option.types';

export const RESOURCE_TYPE_DEGRADED_FALLBACKS = ['drachma', 'materials', 'workforce'];

export function toResourceTypeOptions(
  resourceTypes: ResourceTypeReadModel[],
  referencedKeys: readonly string[] = [],
): SelectOption[] {
  if (resourceTypes.length === 0) {
    return fallbackResourceTypeOptions(referencedKeys);
  }

  const referenced = new Set(referencedKeys.filter(Boolean));
  const options = resourceTypes
    .filter((type) => type.isActive || referenced.has(type.key))
    .map((type) => ({
      label: `${type.label} (${type.key})${type.isActive ? '' : ' - inactive referenced'}`,
      value: type.key,
    }));

  referenced.forEach((key) => {
    if (!resourceTypes.some((type) => type.key === key)) {
      options.push({ label: `${key} - unknown referenced resource type`, value: key });
    }
  });

  return options;
}

export function resourceTypeDisplayLabel(
  resourceTypes: ResourceTypeReadModel[],
  key: string,
): string {
  const type = resourceTypes.find((entry) => entry.key === key);

  if (!type) {
    return `${key} - unknown resource type`;
  }

  return `${type.label} (${type.key})${type.isActive ? '' : ' - inactive'}`;
}

export function resourceTypeDescription(
  resourceTypes: ResourceTypeReadModel[],
  key: string,
): string | null {
  const type = resourceTypes.find((entry) => entry.key === key);

  return type?.description ?? type?.helperText ?? type?.adminDescription ?? null;
}

function fallbackResourceTypeOptions(referencedKeys: readonly string[]): SelectOption[] {
  const values = new Set([...RESOURCE_TYPE_DEGRADED_FALLBACKS, ...referencedKeys.filter(Boolean)]);

  return Array.from(values).sort().map((value) => ({
    label: `${value} - degraded fallback`,
    value,
  }));
}
