import { trimText } from '../../../core/utils/normalize-text';
export { parseMetadataJson } from '../../../core/utils/admin-form-helpers';

export function requiredFormValue(value: string | null, label: string): string {
  const normalized = trimText(value);

  if (!normalized) {
    throw new Error(`${label} is required.`);
  }

  return normalized;
}
