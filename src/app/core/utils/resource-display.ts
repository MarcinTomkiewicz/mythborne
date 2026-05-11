import { humanizeKey } from './normalize-text';

const RESOURCE_LABELS: Record<string, string> = {
  drachma: 'Drachma',
  materials: 'Materials',
  material: 'Materials',
  workforce: 'Workforce',
};

export function resourceTypeLabel(resourceType: string | null | undefined): string {
  if (!resourceType) {
    return 'Resource';
  }

  return RESOURCE_LABELS[resourceType] ?? humanizeKey(resourceType, 'Resource');
}

export function signedAmountLabel(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) {
    return '0';
  }

  return amount > 0 ? `+${amount}` : String(amount);
}

export function resourceAmountLabel(
  resourceType: string | null | undefined,
  amount: number | null | undefined,
): string {
  return `${resourceTypeLabel(resourceType)} ${signedAmountLabel(amount)}`;
}
